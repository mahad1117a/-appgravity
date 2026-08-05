require('dotenv').config(); // FIX: dotenv was a dependency but was never actually loaded,
                             // so .env values (ALLOWED_ORIGINS, NODE_ENV, PORT, TRUST_PROXY)
                             // were silently ignored in favor of hardcoded defaults.

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const { searchAllKnowledge, setCustomKnowledgeEntries } = require('./knowledge-base');
const { loadStore, saveStore, slugify, UPLOADS_DIR } = require('./data-store');

const app = express();
const PORT = process.env.PORT || 3000;

// FIX: Required whenever the app sits behind a reverse proxy (see the Nginx config in
// SECURITY.md). Without this, req.ip resolves to the proxy's own address, not the real
// client — which means IP banning/rate-limiting either bans everyone at once or bans
// no one meaningfully, and express-rate-limit will throw on X-Forwarded-For headers.
// Set TRUST_PROXY in .env to the correct hop count for your deployment (1 for a single
// Nginx proxy in front of the app). Set to 0 / omit if there is NO reverse proxy.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
app.use(cookieParser());

// ── 0. THREAT & BOT PROTECTION / IP AUTO-BAN STORE ──
const bannedIPs = new Map(); // IP -> unbanTimestamp
const threatLog = [];

const isIPBanned = (ip) => {
  if (!bannedIPs.has(ip)) return false;
  const unbanTime = bannedIPs.get(ip);
  if (Date.now() > unbanTime) {
    bannedIPs.delete(ip);
    return false;
  }
  return true;
};

// FIX: threatLog, quotesStore, courseRequestsStore, and reviewsStore were unbounded
// arrays — under sustained traffic (even legitimate) they grow forever and eventually
// exhaust process memory. This caps each at MAX_LOG_ENTRIES, dropping the oldest first.
// This is a stopgap, not a substitute for real persistent storage (see note below).
const MAX_LOG_ENTRIES = 2000;
const cappedPush = (arr, item, max = MAX_LOG_ENTRIES) => {
  arr.push(item);
  if (arr.length > max) arr.splice(0, arr.length - max);
};

const banIP = (ip, reason, durationMs = 60 * 60 * 1000) => {
  bannedIPs.set(ip, Date.now() + durationMs);
  cappedPush(threatLog, { ip, reason, timestamp: new Date().toISOString() });
  console.warn(`🚨 [SECURITY ALERT] Banned IP ${ip} for: ${reason}`);
};

// ── 1. SECURITY HEADERS (Helmet) & CSP ──
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // FIX: scriptSrc no longer allows fonts.googleapis.com. That domain serves the
        // Google Fonts *stylesheet* (correctly allowed under styleSrc below) — no script
        // on this site is ever loaded from it, so leaving it in scriptSrc widened the
        // trusted-script surface for no functional reason. script.js (self) is all that's
        // needed, and there are no inline <script> or on*= handlers anywhere in the HTML.
        scriptSrc: ["'self'"],
        // styleSrc still needs 'unsafe-inline' because index.html has a few inline
        // style="..." attributes. Moving those to CSS classes would let this be tightened too.
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.web3forms.com"],
        // FIX: was 'none', which silently blocks ANY iframe — including the YouTube
        // course video embeds this site now uses. Scoped narrowly to YouTube's
        // privacy-enhanced embed domain only, not opened up generally.
        frameSrc: ["'self'", "https://www.youtube-nocookie.com"],
        objectSrc: ["'none'"],
        // FIX: frame-ancestors is the modern CSP-level replacement for X-Frame-Options
        // and is respected by all current browsers even where the legacy header isn't.
        // Belt-and-suspenders with frameguard below rather than relying on just one.
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", "https://api.web3forms.com"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    originAgentCluster: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// FIX: Permissions-Policy tells the browser this site never needs camera, microphone,
// geolocation, or a few other sensitive device APIs — so even if a future bug or a
// compromised third-party script tried to use them, the browser blocks it outright.
// Costs nothing functionally since the site never uses any of these.
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  next();
});

// ── 2. BOT SCANNER & BAD USER-AGENT BLOCKER ──
// NOTE: User-Agent filtering is trivial for a real attacker to bypass (it's one header),
// so treat this as a low-cost speed bump against unsophisticated/default-config scanners,
// not real protection. It should never be the only control on sensitive endpoints.
const MALICIOUS_UAS = [/sqlmap/i, /nikto/i, /nmap/i, /gobuster/i, /dirbuster/i, /w3af/i, /acunetix/i, /nessus/i, /masscan/i, /zgrab/i];

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  if (isIPBanned(clientIP)) {
    return res.status(403).json({ error: 'Access denied due to suspicious activity from your IP address.' });
  }

  // FIX: previously auto-banned any request with no User-Agent header. That's a common,
  // legitimate pattern for uptime monitors, some webhook senders, and internal health
  // checks — banning on it risked locking out real traffic (and, worse, since many
  // clients share an IP behind NAT/CGNAT, one such request could ban a whole building).
  // We no longer ban on this; genuinely malicious traffic is still caught by the
  // deep payload inspection and rate limiters below.
  const userAgent = req.headers['user-agent'] || '';

  // FIX: dropped python-requests / curl / wget from the auto-ban list. These are used
  // by legitimate scripts, cron jobs, and monitoring tools; a real attacker changes the
  // UA string in one line of code, so banning on it only punishes honest traffic.
  for (const pattern of MALICIOUS_UAS) {
    if (pattern.test(userAgent)) {
      banIP(clientIP, `Automated scanner signature detected: ${userAgent}`);
      return res.status(403).json({ error: 'Automated vulnerability scanning is strictly prohibited.' });
    }
  }

  next();
});

// ── 3. CORS CONFIGURATION ──
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',');
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,
  })
);

// ── 4. BODY PARSING & PAYLOAD LIMITS ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 5. DEEP ATTACK VECTOR INSPECTION ──
// FIX: these were declared with the global 'g' flag and reused across requests via
// .test(). Global regexes carry lastIndex state between calls, so the SAME payload
// could be detected on one request and silently missed on the next — a real bug that
// undermined the "deep inspection" claim. We only need a boolean match here, not global
// search, so the 'g' flag is dropped entirely.
const ATTACK_VECTORS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /union\s+select/i,
  /drop\s+table/i,
  /insert\s+into/i,
  /delete\s+from/i,
  /\.\.\//i,
  /\${/i
];

const inspectValue = (val) => {
  if (typeof val === 'string') {
    for (const vector of ATTACK_VECTORS) {
      if (vector.test(val)) return true;
    }
  } else if (typeof val === 'object' && val !== null) {
    for (const k in val) {
      if (inspectValue(val[k])) return true;
    }
  }
  return false;
};

app.use('/api/', (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  if (inspectValue(req.body) || inspectValue(req.query)) {
    banIP(clientIP, 'Malicious exploit vector detected in request payload');
    return res.status(403).json({ error: 'Request rejected by deep threat inspection system.' });
  }
  next();
});

// ── 6. NOSQL INJECTION & HPP PROTECTION ──
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(hpp({ whitelist: ['category', 'rating', 'projectType'] }));

// ── 7. IN-MEMORY SESSIONS & CSRF STORE ──
const activeSessions = new Map(); // token -> timestamp

const generateCSRFToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Cleanup expired CSRF tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of activeSessions.entries()) {
    if (expiry < now) activeSessions.delete(token);
  }
}, 60 * 60 * 1000);

// FIX: bannedIPs was previously only cleaned lazily, i.e. only when that exact IP made
// another request. An IP banned once and never seen again stayed in memory forever.
setInterval(() => {
  const now = Date.now();
  for (const [ip, unbanTime] of bannedIPs.entries()) {
    if (now > unbanTime) bannedIPs.delete(ip);
  }
}, 60 * 60 * 1000);

// FIX (double-submit cookie pattern): the token must now match BOTH the X-CSRF-Token
// header AND a SameSite=Strict, httpOnly cookie set when the token was issued. A
// cross-site attacker page cannot read or set that cookie (browser same-origin rules +
// SameSite=Strict), and cannot read the JSON response from /api/csrf-token cross-origin
// either (blocked by CORS). Previously the header alone was checked against a token that
// literally anyone could fetch for themselves, which meant the check mostly verified
// "did you call the token endpoint first" rather than "is this a same-site request."
const verifyCSRFToken = (req, res, next) => {
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies ? req.cookies.csrf_token : undefined;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token missing or invalid. Action rejected.' });
  }
  if (!activeSessions.has(headerToken)) {
    return res.status(403).json({ error: 'CSRF token missing or invalid. Action rejected.' });
  }
  const expiry = activeSessions.get(headerToken);
  if (Date.now() > expiry) {
    activeSessions.delete(headerToken);
    return res.status(403).json({ error: 'CSRF token expired. Please refresh the page.' });
  }
  next();
};

// ── 🔐 ADMIN DASHBOARD AUTH ──
// A lightweight session system for the admin dashboard, following the same pattern
// as the CSRF token store above (in-memory token -> expiry map + periodic cleanup),
// rather than pulling in a whole session-store dependency for a single-operator panel.
const adminSessions = new Map(); // token -> expiry timestamp

setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of adminSessions.entries()) {
    if (expiry < now) adminSessions.delete(token);
  }
}, 60 * 60 * 1000);

// The admin password is never stored in plaintext, in code, or in .env — only a
// scrypt hash + its salt are. See .env.example for the one-line command that
// generates ADMIN_PASSWORD_HASH / ADMIN_PASSWORD_SALT from a real password.
function verifyAdminPassword(inputPassword) {
  const { ADMIN_PASSWORD_HASH, ADMIN_PASSWORD_SALT } = process.env;
  if (!ADMIN_PASSWORD_HASH || !ADMIN_PASSWORD_SALT || !inputPassword) return false;
  try {
    const inputHash = crypto.scryptSync(String(inputPassword), ADMIN_PASSWORD_SALT, 64);
    const storedHash = Buffer.from(ADMIN_PASSWORD_HASH, 'hex');
    // timingSafeEqual requires equal-length buffers, and throws otherwise — a
    // mismatched length just means "wrong", not a crash.
    if (inputHash.length !== storedHash.length) return false;
    return crypto.timingSafeEqual(inputHash, storedHash);
  } catch (e) {
    return false;
  }
}

const verifyAdminSession = (req, res, next) => {
  const token = req.cookies ? req.cookies.admin_session : undefined;
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }
  const expiry = adminSessions.get(token);
  if (Date.now() > expiry) {
    adminSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
  next();
};

// ── 8. RATE LIMITERS ──
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Strict limit reached. Please wait before submitting more requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 15,
  message: { error: 'Chat message rate limit exceeded. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Much stricter than the other limiters on purpose — this endpoint exists purely
// to be brute-forced against, so 5 attempts per 15 minutes is deliberate, not a bug.
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);

// The admin dashboard should never be indexed by search engines or cached by
// browsers/proxies — it's not secret-by-obscurity (real auth handles that), but
// there's no reason for it to show up in search results or linger in a cache either.
app.use(['/admin.html', '/api/admin'], (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ── PERSISTENT DATA STORE ──
const store = loadStore();
setCustomKnowledgeEntries(store.customKnowledge);

const quotesStore = store.quotes;
const courseRequestsStore = store.courseRequests;
const reviewsStore = store.reviews;
const coursesCatalog = store.courses;
const postsStore = store.posts;
const messagesStore = store.messages;
const usersStore = store.users;
const settingsStore = store.settings;
const analyticsStore = store.analytics;
const chatHistoryStore = store.chatHistory;
const customKnowledgeStore = store.customKnowledge;
const filesStore = store.files;

function persistStore() {
  setCustomKnowledgeEntries(customKnowledgeStore);
  saveStore(store);
}

function trackPageView(page) {
  const key = page || '/';
  analyticsStore.pageViews[key] = (analyticsStore.pageViews[key] || 0) + 1;
  const today = new Date().toISOString().split('T')[0];
  let dayEntry = analyticsStore.dailyVisits.find(d => d.date === today);
  if (!dayEntry) {
    dayEntry = { date: today, count: 0 };
    analyticsStore.dailyVisits.push(dayEntry);
  }
  dayEntry.count += 1;
  if (analyticsStore.dailyVisits.length > 365) {
    analyticsStore.dailyVisits.splice(0, analyticsStore.dailyVisits.length - 365);
  }
  persistStore();
}

function trackSearchQuery(query) {
  const key = String(query || '').toLowerCase().trim().slice(0, 120);
  if (!key) return;
  analyticsStore.searchQueries[key] = (analyticsStore.searchQueries[key] || 0) + 1;
  persistStore();
}

// Helper: Sanitize Text Input
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return '';
  return validator.escape(text.trim());
};

// ── 🧮 SAFE ARITHMETIC EVALUATOR ──
// FIX: this replaces a previous implementation that ran user input through
// Function(`"use strict"; return (...)`), which is functionally eval() — a full
// JavaScript code-execution primitive. It was constrained by a regex whitelist
// beforehand, but that leaves exactly one regex bug away from arbitrary code
// execution. This hand-written recursive-descent parser supports only
// + - * / ( ) and decimals, and is structurally incapable of executing
// anything other than arithmetic — there is no eval()/Function() path at all,
// so a future change elsewhere in the file can't reopen this as an RCE vector.
function safeEvaluateArithmetic(expr) {
  let pos = 0;
  const peek = () => expr[pos];
  const skipSpace = () => { while (expr[pos] === ' ') pos++; };

  function parseNumber() {
    skipSpace();
    const start = pos;
    while (pos < expr.length && /[0-9.]/.test(expr[pos])) pos++;
    if (start === pos) throw new Error('Expected a number');
    const value = parseFloat(expr.slice(start, pos));
    if (isNaN(value)) throw new Error('Invalid number');
    return value;
  }

  function parseFactor() {
    skipSpace();
    if (peek() === '(') {
      pos++;
      const value = parseExpr();
      skipSpace();
      if (peek() !== ')') throw new Error('Expected )');
      pos++;
      return value;
    }
    if (peek() === '-') { pos++; return -parseFactor(); }
    if (peek() === '+') { pos++; return parseFactor(); }
    return parseNumber();
  }

  function parseTerm() {
    let value = parseFactor();
    skipSpace();
    while (peek() === '*' || peek() === '/') {
      const op = peek(); pos++;
      const rhs = parseFactor();
      if (op === '*') value *= rhs;
      else {
        if (rhs === 0) throw new Error('Division by zero');
        value /= rhs;
      }
      skipSpace();
    }
    return value;
  }

  function parseExpr() {
    let value = parseTerm();
    skipSpace();
    while (peek() === '+' || peek() === '-') {
      const op = peek(); pos++;
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
      skipSpace();
    }
    return value;
  }

  const result = parseExpr();
  skipSpace();
  if (pos !== expr.length) throw new Error('Unexpected trailing characters');
  return result;
}

// ── 🔍 DIRECT ANSWER ENGINE — Wikipedia quick facts + Google search fallback ──
// FIX: this previously also scraped DuckDuckGo's HTML search results page with a
// regex. That's fragile (the markup can change and silently break this at any
// time), a grey area under DuckDuckGo's terms of use, and added two slow outbound
// calls per unmatched message. It's replaced with one legitimate documented API
// (Wikipedia's public REST summary endpoint) for a quick factual blurb where one
// exists, plus — always, per how this bot is meant to work — a direct Google
// search link so the visitor can look further themselves rather than the bot
// guessing or silently failing.
async function fetchWebSearchResults(query) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) return { text: "How can I help you today?", action: "empty" };
  const encodedQuery = encodeURIComponent(cleanQuery);
  const googleUrl = `https://www.google.com/search?q=${encodedQuery}`;

  // 0. Math expression check — routed through the safe parser above, never eval().
  if (/\d/.test(cleanQuery) && /^[\d\s+\-*/().]+$/.test(cleanQuery)) {
    try {
      const calcResult = safeEvaluateArithmetic(cleanQuery);
      if (typeof calcResult === 'number' && isFinite(calcResult)) {
        return {
          text: `💡 **Direct Answer:**\n\n\`${cleanQuery}\` = **${calcResult}**`,
          action: "math_answer"
        };
      }
    } catch (e) { /* not a valid expression — fall through to the search below */ }
  }

  // 1. Wikipedia REST API summary (a real documented public API, not scraping)
  let directAnswer = "";
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedQuery}`;
    const wikiRes = await fetch(wikiUrl, { headers: { 'User-Agent': 'AppsGravityAI/2.0 (learning assistant)' } });
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract && wikiData.type !== 'disambiguation' && wikiData.extract.length > 20) {
        directAnswer = wikiData.extract.trim();
      }
    }
  } catch (err) { /* Wikipedia unreachable/no match — the Google link below still returns */ }

  if (directAnswer) {
    return {
      text: `💡 **Quick Answer:**\n\n${directAnswer}\n\nWant to dig deeper? 🔎 [Search "${cleanQuery}" on Google](${googleUrl})`,
      action: "direct_answer"
    };
  }

  // 2. Nothing in the knowledge base or Wikipedia — hand over a live Google
  // search link instead of guessing.
  return {
    text: `🔎 That's outside Hassan's knowledge base right now — here's a direct search instead:\n\n[Search "${cleanQuery}" on Google](${googleUrl})\n\nOr ask me about Hassan's **Free Courses**, **Web/Mobile Development**, or the **Project Estimator**!`,
    action: "google_fallback"
  };
}

// FIX: msg.includes('app') / .includes('rate') / .includes('cost') were plain substring
// checks, which silently match inside unrelated everyday words — "happy", "happen",
// "apply", and "appreciate" all contain "app"; "generate", "separate", "operate",
// "corporate", and "desperate" all contain "rate"; "costume" contains "cost". A visitor
// typing something as ordinary as "I'd appreciate some help" was being routed into the
// mobile-app pitch instead of getting a real answer. containsWord checks whole-word
// boundaries instead, so short keywords only match when they're actually a separate word.
function containsWord(haystack, phrase) {
  return ` ${haystack} `.includes(` ${phrase} `);
}

// ── 🤖 AI CHATBOT ENGINE LOGIC (UPGRADED INTELLIGENCE & CONVERSATION) ──
async function getAiResponse(userMessage) {
  const rawMsg = userMessage || '';
  const msg = rawMsg.toLowerCase().trim();

  // 1. GREETINGS & SMALL TALK
  if (/^(hi|hello|hey|heyy|salam|aOA|good morning|good afternoon|good evening|yo|sup|greetings)\b/i.test(msg)) {
    return {
      text: "👋 **Hello and welcome!** I'm **GravityBot AI**, the official virtual assistant for **Apps Gravity**, founded by **Hassan**.\n\nI'm doing great and ready to assist you! How can I help today?\n\n• 🎓 **Free Medical Billing Video Course**\n• 📱 **Mobile App Dev (Pak Advisory App)**\n• 🌐 **Web Development & Cost Estimates**\n• 📬 **Contacting Hassan directly**",
      action: "greetings"
    };
  }

  if (msg.includes('how are you') || msg.includes('how r u') || msg.includes('how do you do')) {
    return {
      text: "😊 I'm feeling great and running at full speed! Thank you for asking. How can I assist you with **Apps Gravity** projects or our free **Medical Billing Course** today?",
      action: "chitchat"
    };
  }

  if (msg.includes('who are you') || msg.includes('what are you') || msg.includes('who made you') || msg.includes('who created you') || msg.includes('your name')) {
    return {
      text: "🤖 I am **GravityBot AI**, an intelligent conversational assistant created by **Hassan** (Founder of Apps Gravity). I help visitors explore custom mobile/web development services, get live project price estimates, and access free video courses!",
      action: "about_bot"
    };
  }

  if (msg.includes('tell me a joke') || msg.includes('say something funny') || msg.includes('joke')) {
    return {
      text: "😄 Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛✨\n\nSpeaking of clean code, how can Hassan help build your next app or website today?",
      action: "joke"
    };
  }

  if (msg.includes('thank') || msg.includes('thx') || msg.includes('thanks') || msg.includes('great job') || msg.includes('awesome')) {
    return {
      text: "🌟 You're very welcome! It's my pleasure to help. Feel free to ask any more questions about our courses, mobile app development, or website quotes!",
      action: "gratitude"
    };
  }

  if (msg.includes('bye') || msg.includes('goodbye') || msg.includes('see ya') || msg.includes('cya')) {
    return {
      text: "👋 Goodbye! Have a fantastic day! If you ever need app/web dev services or free courses, **Apps Gravity** is always here for you.",
      action: "farewell"
    };
  }

  // 2. MEDICAL BILLING COURSE & LEARNING
  if (msg.includes('medical billing') || msg.includes('billing course') || msg.includes('drive link') || msg.includes('drive folder') || msg.includes('google drive') || msg.includes('watch course') || msg.includes('download course')) {
    return {
      text: "🎓 **Medical Billing Complete Video Course** is 100% free!\n\nYou can stream or download all video lessons securely via Google Drive:\n\n👉 [Access Secure Google Drive Folder](https://drive.google.com/drive/folders/1sA2HPCr4jU8fH8aNAdogDor22VKgA96I?usp=drive_link)\n\n**Course Highlights:**\n• Claim Submission & Verification\n• ICD-10 & CPT Coding Essentials\n• Revenue Cycle Management (RCM)\n• Real-world Billing Procedures",
      action: "courses"
    };
  }

  if (msg.includes('what is medical billing') || msg.includes('explain medical billing') || msg.includes('cpt') || msg.includes('icd') || msg.includes('rcm')) {
    return {
      text: "💡 **Medical Billing Breakdown:**\n\nMedical billing is the process of submitting and following up on claims with health insurance companies in order to receive payment for services rendered by healthcare providers.\n\n• **ICD-10**: Diagnosis codes defining the patient's condition.\n• **CPT**: Procedure codes defining treatments provided.\n• **RCM**: Revenue Cycle Management tracking financial workflows.\n\nLearn all of this step-by-step in Hassan's free video course on Google Drive!",
      action: "medical_info"
    };
  }

  if (msg.includes('is it free') || msg.includes('course cost') || msg.includes('course fee') || msg.includes('payment for course')) {
    return {
      text: "🎁 Yes! The **Medical Billing Video Course** provided by Hassan is **100% FREE** with no hidden fees or paywalls. You get full access to all video modules on Google Drive.",
      action: "courses"
    };
  }

  // 3. PAK ADVISORY APP & MOBILE DEV
  if (msg.includes('pak advisory') || containsWord(msg, 'app') || containsWord(msg, 'apps') || msg.includes('mobile') || msg.includes('android') || msg.includes('ios') || msg.includes('flutter')) {
    return {
      text: "📱 **Apps Gravity Mobile App Development:**\n\nHassan specializes in building native & cross-platform mobile apps (iOS & Android). Our flagship featured project is **Pak Advisory App** — an intuitive advisory & expert guidance platform built for users across Pakistan!\n\nWould you like Hassan to build a custom mobile app for your startup or business?",
      action: "portfolio"
    };
  }

  // 4. WEB DEVELOPMENT & ESTIMATION
  if (msg.includes('web') || msg.includes('website') || msg.includes('full stack') || msg.includes('frontend') || msg.includes('backend') || msg.includes('express') || msg.includes('react')) {
    return {
      text: "🌐 **Apps Gravity Web Engineering:**\n\nWe design & code luxury, ultra-fast, responsive web platforms using modern HTML/CSS, Vanilla JS, Express backends, and security-hardened architectures.\n\nWant to estimate your project cost? Scroll to our interactive **Project Estimator** calculator on the website!",
      action: "calculator"
    };
  }

  if (msg.includes('price') || containsWord(msg, 'cost') || containsWord(msg, 'rate') || msg.includes('estimate') || msg.includes('how much') || msg.includes('quote')) {
    return {
      text: "💰 **Instant Cost Estimation:**\n\nOur project quotes are transparent and tailored to your tech stack:\n• **Web Apps**: Starting around ~$499\n• **Mobile Apps**: Starting around ~$799\n• **Full-Stack Ecosystems**: Starting around ~$1199\n\nUse our live **Project Estimator** on this page to build your custom feature breakdown!",
      action: "calculator"
    };
  }

  // 5. ABOUT HASSAN & CONTACT
  if (msg.includes('hassan') || msg.includes('who is hassan') || msg.includes('contact') || msg.includes('email') || msg.includes('reach') || msg.includes('hire') || msg.includes('location')) {
    return {
      text: "📬 **Contact Hassan (Founder & Developer):**\n\n• **Email**: mahadhassanlal@gmail.com\n• **GitHub**: [@mahad1117a](https://github.com/mahad1117a)\n• **Location**: Pakistan (Serving clients worldwide)\n• **Services**: Mobile App Dev, Web Dev, API Security & Free Courses\n\nYou can also submit your inquiry directly using the contact form at the bottom of the page!",
      action: "contact"
    };
  }

  // 6. REQUESTING NEW COURSES
  // FIX: this previously also matched bare "python" or "learning" anywhere in the
  // message, which meant a genuine question like "tell me about python" was
  // hijacked into a "request a course" reply instead of reaching the real answer
  // now available in the knowledge base below. Narrowed to phrasing that's
  // actually about requesting a course.
  if (msg.includes('request course') || msg.includes('request a course') || msg.includes('other course') || msg.includes('new course') || msg.includes('course request')) {
    return {
      text: "📚 Need a course on programming, web dev, or another topic? Click the **'Request a Course'** button in the Free Courses section, and Hassan will upload it for free!",
      action: "courses"
    };
  }

  // 7. STRUCTURED KNOWLEDGE BASE — web dev, mobile dev, programming, cybersecurity,
  // data/analytics, AI, medical billing, business/freelancing, and general tech topics.
  // Checked only after the business-critical intents above, so those always win.
  const kbMatch = searchAllKnowledge(rawMsg);
  if (kbMatch) {
    return { text: kbMatch.answer, action: "knowledge_base", category: kbMatch.category };
  }

  // 8. NOTHING MATCHED — GOOGLE SEARCH LINK FALLBACK (+ a Wikipedia quick answer
  // when one is available)
  return await fetchWebSearchResults(rawMsg);
}

// ── REST API ROUTES ──

// 0. CSRF Token Initializer Endpoint
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateCSRFToken();
  res.cookie('csrf_token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });
  res.json({ success: true, csrfToken });
});

// 1. AI Chat Endpoint
app.post('/api/chat', chatLimiter, verifyCSRFToken, async (req, res) => {
  const rawMessage = req.body.message;
  if (!rawMessage || typeof rawMessage !== 'string') {
    return res.status(400).json({ error: "Valid message text is required." });
  }
  const cleanMessage = sanitizeInput(rawMessage.slice(0, 500));
  const reply = await getAiResponse(cleanMessage);
  cappedPush(chatHistoryStore, {
    id: Date.now(),
    message: cleanMessage,
    action: reply.action || 'unknown',
    replyPreview: String(reply.text || '').slice(0, 200),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  trackSearchQuery(cleanMessage);
  persistStore();
  res.json({ success: true, reply });
});

// 2. Project Cost Estimator Endpoint
app.post('/api/quote', strictLimiter, verifyCSRFToken, (req, res) => {
  const { projectType, platform, features, email, name, message } = req.body;
  
  if (email && !validator.isEmail(String(email))) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  let basePrice = 499;
  let weeks = 2;

  if (projectType === 'mobile') {
    basePrice = 799;
    weeks = 3;
  } else if (projectType === 'fullstack') {
    basePrice = 1199;
    weeks = 4;
  }

  let totalFeaturesCost = 0;
  if (Array.isArray(features)) {
    if (features.includes('auth')) { totalFeaturesCost += 150; weeks += 0.5; }
    if (features.includes('payments')) { totalFeaturesCost += 200; weeks += 0.5; }
    if (features.includes('ai_chatbot')) { totalFeaturesCost += 250; weeks += 1; }
    if (features.includes('admin_panel')) { totalFeaturesCost += 300; weeks += 1; }
  }

  const estimatedTotal = basePrice + totalFeaturesCost;

  const quoteRecord = {
    id: Date.now(),
    projectType: sanitizeInput(projectType),
    platform: sanitizeInput(platform),
    features: Array.isArray(features) ? features.map(f => sanitizeInput(f)) : [],
    estimatedCost: estimatedTotal,
    estimatedWeeks: Math.ceil(weeks),
    clientInfo: {
      email: email ? sanitizeInput(email) : '',
      name: name ? sanitizeInput(name) : '',
      message: message ? sanitizeInput(message) : ''
    },
    created: new Date().toISOString()
  };

  cappedPush(quotesStore, quoteRecord);
  persistStore();

  res.json({
    success: true,
    estimatedCost: estimatedTotal,
    estimatedWeeks: Math.ceil(weeks),
    message: `Quote calculated! Estimated cost is $${estimatedTotal} with a turnaround of ~${Math.ceil(weeks)} weeks.`
  });
});

// 3. Courses Catalog Endpoint
app.get('/api/courses', (req, res) => {
  res.json({ success: true, courses: coursesCatalog });
});

// 3b. Secure Course Access Gateway Endpoint
app.get('/api/courses/access/:id', strictLimiter, (req, res) => {
  const courseId = sanitizeInput(req.params.id);
  const course = coursesCatalog.find(c => c.id === courseId);

  if (!course || !course.driveUrl) {
    return res.status(404).json({ error: "Course not found or access restricted." });
  }

  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  console.log(`🔒 [SECURE COURSE ACCESS] ID '${courseId}' accessed by IP ${clientIP}`);

  res.json({
    success: true,
    courseTitle: course.title,
    accessUrl: course.driveUrl,
    securityNotice: "Verified & anti-tamper protected Google Drive link by Apps Gravity Security Engine"
  });
});

// 4. Course Request Endpoint
app.post('/api/courses/request', strictLimiter, verifyCSRFToken, (req, res) => {
  const { courseTopic, requesterEmail, notes } = req.body;
  if (!courseTopic) {
    return res.status(400).json({ error: "Course topic is required." });
  }
  if (requesterEmail && !validator.isEmail(String(requesterEmail))) {
    return res.status(400).json({ error: "Invalid email format." });
  }
  const reqObj = {
    id: Date.now(),
    courseTopic: sanitizeInput(courseTopic),
    requesterEmail: requesterEmail ? sanitizeInput(requesterEmail) : '',
    notes: notes ? sanitizeInput(notes) : '',
    date: new Date().toISOString()
  };
  cappedPush(courseRequestsStore, reqObj);
  persistStore();
  res.json({ success: true, message: "Course request logged! Hassan will review it shortly." });
});

// 5. Reviews Endpoint
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, reviews: reviewsStore });
});

app.post('/api/reviews', strictLimiter, verifyCSRFToken, (req, res) => {
  const { name, role, rating, comment } = req.body;
  if (!name || !comment) {
    return res.status(400).json({ error: "Name and comment are required." });
  }
  const numRating = parseInt(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }
  const newReview = {
    id: Date.now(),
    name: sanitizeInput(String(name).slice(0, 100)),
    role: role ? sanitizeInput(String(role).slice(0, 100)) : "Client / Visitor",
    rating: numRating,
    comment: sanitizeInput(String(comment).slice(0, 1000)),
    date: new Date().toISOString().split('T')[0]
  };
  reviewsStore.unshift(newReview);
  if (reviewsStore.length > MAX_LOG_ENTRIES) reviewsStore.length = MAX_LOG_ENTRIES;
  persistStore();
  res.json({ success: true, review: newReview, message: "Review added successfully!" });
});

// 6. Contact Messages Endpoint
app.post('/api/contact', strictLimiter, verifyCSRFToken, (req, res) => {
  const { name, email, service, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!validator.isEmail(String(email))) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  const record = {
    id: Date.now(),
    name: sanitizeInput(String(name).slice(0, 100)),
    email: sanitizeInput(String(email).slice(0, 150)),
    service: service ? sanitizeInput(String(service).slice(0, 100)) : '',
    message: sanitizeInput(String(message).slice(0, 2000)),
    status: 'new',
    createdAt: new Date().toISOString()
  };
  cappedPush(messagesStore, record);
  persistStore();

  // Forward to Web3Forms for email notification (non-blocking server-side)
  const web3Key = process.env.WEB3FORMS_ACCESS_KEY;
  if (web3Key) {
    const web3Body = {
      access_key: web3Key,
      subject: `New Contact Form Submission from Apps Gravity`,
      from_name: `Apps Gravity Website`,
      name: record.name,
      email: record.email,
      service: record.service,
      message: record.message
    };
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(web3Body)
    }).catch(err => {
      console.error('Web3Forms forwarding error:', err.message);
    });
  }

  res.json({ success: true, message: 'Message received! Hassan will get back to you soon.' });
});

// 7. Public Settings (safe fields only)
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      siteName: settingsStore.siteName,
      founderName: settingsStore.founderName,
      heroLine1: settingsStore.heroLine1,
      heroLine2: settingsStore.heroLine2,
      heroSubtitle: settingsStore.heroSubtitle,
      contactEmail: settingsStore.contactEmail,
      githubUrl: settingsStore.githubUrl,
      logoUrl: settingsStore.logoUrl,
      seoTitle: settingsStore.seoTitle,
      seoDescription: settingsStore.seoDescription,
      seoKeywords: settingsStore.seoKeywords
    }
  });
});

// 8. Published Posts
app.get('/api/posts', (req, res) => {
  const published = postsStore
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  res.json({ success: true, posts: published });
});

// 9. Analytics Page View Tracker
app.post('/api/analytics/pageview', (req, res) => {
  const page = sanitizeInput(String(req.body.page || '/').slice(0, 200));
  trackPageView(page);
  res.json({ success: true });
});

// ── 🔐 ADMIN DASHBOARD ROUTES ──
// Single-operator login (password only, no username) — this dashboard has exactly
// one intended user (the site owner), so a username field would add friction
// without adding real security.
app.post('/api/admin/login', adminLoginLimiter, verifyCSRFToken, (req, res) => {
  const { password } = req.body;
  if (!verifyAdminPassword(password)) {
    cappedPush(threatLog, { ip: req.ip, reason: 'Failed admin login attempt', timestamp: new Date().toISOString() });
    // Deliberately generic message — doesn't reveal whether admin auth is even configured.
    return res.status(401).json({ error: 'Invalid password.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  const maxAge = 12 * 60 * 60 * 1000; // 12 hours
  adminSessions.set(token, Date.now() + maxAge);
  res.cookie('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge
  });
  res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies ? req.cookies.admin_session : undefined;
  if (token) adminSessions.delete(token);
  res.clearCookie('admin_session');
  res.json({ success: true });
});

// Lets the dashboard page check "am I logged in?" on load without triggering a 401
// in the browser console every time — the dashboard UI treats this as informational.
app.get('/api/admin/session', (req, res) => {
  const token = req.cookies ? req.cookies.admin_session : undefined;
  const authenticated = !!(token && adminSessions.has(token) && Date.now() <= adminSessions.get(token));
  res.json({ authenticated });
});

app.get('/api/admin/data', verifyAdminSession, (req, res) => {
  const topPages = Object.entries(analyticsStore.pageViews || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }));

  const topQueries = Object.entries(analyticsStore.searchQueries || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  const totalViews = Object.values(analyticsStore.pageViews || {}).reduce((s, n) => s + n, 0);

  res.json({
    success: true,
    quotes: [...quotesStore].reverse(),
    courseRequests: [...courseRequestsStore].reverse(),
    reviews: reviewsStore,
    courses: coursesCatalog,
    posts: postsStore,
    messages: [...messagesStore].reverse(),
    users: usersStore,
    settings: settingsStore,
    files: filesStore,
    customKnowledge: customKnowledgeStore,
    chatHistory: [...chatHistoryStore].reverse().slice(0, 200),
    analytics: {
      totalViews,
      topPages,
      topQueries,
      dailyVisits: analyticsStore.dailyVisits || [],
      newMessages: messagesStore.filter(m => m.status === 'new').length
    }
  });
});

app.delete('/api/admin/reviews/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = reviewsStore.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Review not found.' });
  reviewsStore.splice(idx, 1);
  persistStore();
  res.json({ success: true });
});

// ── Admin: Messages ──
app.patch('/api/admin/messages/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const msg = messagesStore.find(m => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Message not found.' });
  const { status } = req.body;
  if (['new', 'read', 'resolved'].includes(status)) msg.status = status;
  persistStore();
  res.json({ success: true, message: msg });
});

app.delete('/api/admin/messages/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = messagesStore.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found.' });
  messagesStore.splice(idx, 1);
  persistStore();
  res.json({ success: true });
});

// ── Admin: Courses CRUD ──
app.post('/api/admin/courses', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const { title, category, badge, meta, desc, driveUrl, youtubeUrl, pageUrl, features, secureAccessRequired } = req.body;
  if (!title) return res.status(400).json({ error: 'Course title is required.' });
  const course = {
    id: slugify(title) + '-' + Date.now().toString(36),
    title: sanitizeInput(String(title).slice(0, 200)),
    category: sanitizeInput(String(category || 'general').slice(0, 50)),
    badge: badge ? sanitizeInput(String(badge).slice(0, 100)) : '',
    meta: meta ? sanitizeInput(String(meta).slice(0, 200)) : '',
    desc: desc ? sanitizeInput(String(desc).slice(0, 1000)) : '',
    driveUrl: driveUrl ? sanitizeInput(String(driveUrl).slice(0, 500)) : '',
    youtubeUrl: youtubeUrl ? sanitizeInput(String(youtubeUrl).slice(0, 500)) : '',
    pageUrl: pageUrl ? sanitizeInput(String(pageUrl).slice(0, 200)) : '',
    secureAccessRequired: !!secureAccessRequired,
    features: Array.isArray(features) ? features.map(f => sanitizeInput(String(f).slice(0, 100))) : []
  };
  coursesCatalog.unshift(course);
  persistStore();
  res.json({ success: true, course });
});

app.put('/api/admin/courses/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const course = coursesCatalog.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  const fields = ['title', 'category', 'badge', 'meta', 'desc', 'driveUrl', 'youtubeUrl', 'pageUrl'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) course[f] = sanitizeInput(String(req.body[f]).slice(0, f === 'desc' ? 1000 : 500));
  });
  if (req.body.features !== undefined && Array.isArray(req.body.features)) {
    course.features = req.body.features.map(f => sanitizeInput(String(f).slice(0, 100)));
  }
  if (req.body.secureAccessRequired !== undefined) course.secureAccessRequired = !!req.body.secureAccessRequired;
  persistStore();
  res.json({ success: true, course });
});

app.delete('/api/admin/courses/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const idx = coursesCatalog.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found.' });
  coursesCatalog.splice(idx, 1);
  persistStore();
  res.json({ success: true });
});

// ── Admin: Posts CRUD ──
app.post('/api/admin/posts', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const { title, content, status, excerpt } = req.body;
  if (!title) return res.status(400).json({ error: 'Post title is required.' });
  const now = new Date().toISOString();
  const post = {
    id: Date.now(),
    slug: slugify(title),
    title: sanitizeInput(String(title).slice(0, 200)),
    excerpt: excerpt ? sanitizeInput(String(excerpt).slice(0, 300)) : '',
    content: sanitizeInput(String(content || '').slice(0, 10000)),
    status: status === 'published' ? 'published' : 'draft',
    createdAt: now,
    updatedAt: now
  };
  postsStore.unshift(post);
  persistStore();
  res.json({ success: true, post });
});

app.put('/api/admin/posts/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = postsStore.find(p => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (req.body.title !== undefined) {
    post.title = sanitizeInput(String(req.body.title).slice(0, 200));
    post.slug = slugify(post.title);
  }
  if (req.body.content !== undefined) post.content = sanitizeInput(String(req.body.content).slice(0, 10000));
  if (req.body.excerpt !== undefined) post.excerpt = sanitizeInput(String(req.body.excerpt).slice(0, 300));
  if (req.body.status !== undefined) post.status = req.body.status === 'published' ? 'published' : 'draft';
  post.updatedAt = new Date().toISOString();
  persistStore();
  res.json({ success: true, post });
});

app.delete('/api/admin/posts/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = postsStore.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found.' });
  postsStore.splice(idx, 1);
  persistStore();
  res.json({ success: true });
});

// ── Admin: AI Knowledge CRUD ──
app.post('/api/admin/knowledge', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const { category, keywords, answer } = req.body;
  if (!answer || !Array.isArray(keywords) || !keywords.length) {
    return res.status(400).json({ error: 'Keywords and answer are required.' });
  }
  const entry = {
    id: Date.now(),
    category: sanitizeInput(String(category || 'Custom').slice(0, 80)),
    keywords: keywords.map(k => sanitizeInput(String(k).slice(0, 80))).filter(Boolean),
    answer: sanitizeInput(String(answer).slice(0, 3000))
  };
  customKnowledgeStore.unshift(entry);
  setCustomKnowledgeEntries(customKnowledgeStore);
  persistStore();
  res.json({ success: true, entry });
});

app.put('/api/admin/knowledge/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const entry = customKnowledgeStore.find(e => e.id === id);
  if (!entry) return res.status(404).json({ error: 'Knowledge entry not found.' });
  if (req.body.category !== undefined) entry.category = sanitizeInput(String(req.body.category).slice(0, 80));
  if (req.body.keywords !== undefined && Array.isArray(req.body.keywords)) {
    entry.keywords = req.body.keywords.map(k => sanitizeInput(String(k).slice(0, 80))).filter(Boolean);
  }
  if (req.body.answer !== undefined) entry.answer = sanitizeInput(String(req.body.answer).slice(0, 3000));
  setCustomKnowledgeEntries(customKnowledgeStore);
  persistStore();
  res.json({ success: true, entry });
});

app.delete('/api/admin/knowledge/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = customKnowledgeStore.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Knowledge entry not found.' });
  customKnowledgeStore.splice(idx, 1);
  setCustomKnowledgeEntries(customKnowledgeStore);
  persistStore();
  res.json({ success: true });
});

// ── Admin: Users ──
app.post('/api/admin/users', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
  if (!validator.isEmail(String(email))) return res.status(400).json({ error: 'Invalid email.' });
  const validRoles = ['admin', 'editor', 'student'];
  const user = {
    id: Date.now(),
    name: sanitizeInput(String(name).slice(0, 100)),
    email: sanitizeInput(String(email).slice(0, 150)),
    role: validRoles.includes(role) ? role : 'student',
    createdAt: new Date().toISOString()
  };
  usersStore.push(user);
  persistStore();
  res.json({ success: true, user });
});

app.put('/api/admin/users/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = usersStore.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (req.body.name !== undefined) user.name = sanitizeInput(String(req.body.name).slice(0, 100));
  if (req.body.email !== undefined) {
    if (!validator.isEmail(String(req.body.email))) return res.status(400).json({ error: 'Invalid email.' });
    user.email = sanitizeInput(String(req.body.email).slice(0, 150));
  }
  if (req.body.role !== undefined && ['admin', 'editor', 'student'].includes(req.body.role)) {
    user.role = req.body.role;
  }
  persistStore();
  res.json({ success: true, user });
});

app.delete('/api/admin/users/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = usersStore.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found.' });
  if (usersStore.length <= 1) return res.status(400).json({ error: 'Cannot delete the last user.' });
  usersStore.splice(idx, 1);
  persistStore();
  res.json({ success: true });
});

// ── Admin: Settings ──
app.put('/api/admin/settings', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const allowed = ['siteName', 'founderName', 'heroLine1', 'heroLine2', 'heroSubtitle', 'contactEmail', 'githubUrl', 'logoUrl', 'seoTitle', 'seoDescription', 'seoKeywords'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) {
      settingsStore[key] = sanitizeInput(String(req.body[key]).slice(0, key.includes('seo') || key === 'heroSubtitle' ? 500 : 200));
    }
  });
  persistStore();
  res.json({ success: true, settings: settingsStore });
});

// ── Admin: Files (base64 upload) ──
app.post('/api/admin/files', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const { filename, contentBase64, mimeType } = req.body;
  if (!filename || !contentBase64) return res.status(400).json({ error: 'Filename and content are required.' });
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  const uniqueName = `${Date.now()}-${safeName}`;
  const filePath = path.join(UPLOADS_DIR, uniqueName);
  try {
    const buffer = Buffer.from(String(contentBase64), 'base64');
    if (buffer.length > 10 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 10MB).' });
    fs.writeFileSync(filePath, buffer);
    const record = {
      id: Date.now(),
      originalName: safeName,
      storedName: uniqueName,
      url: `/data/uploads/${uniqueName}`,
      mimeType: mimeType ? sanitizeInput(String(mimeType).slice(0, 80)) : 'application/octet-stream',
      size: buffer.length,
      uploadedAt: new Date().toISOString()
    };
    filesStore.unshift(record);
    persistStore();
    res.json({ success: true, file: record });
  } catch (err) {
    res.status(400).json({ error: 'Invalid file data.' });
  }
});

app.delete('/api/admin/files/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = filesStore.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ error: 'File not found.' });
  const file = filesStore[idx];
  const filePath = path.join(UPLOADS_DIR, file.storedName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  filesStore.splice(idx, 1);
  persistStore();
  res.json({ success: true });
});

// Serve uploaded files
app.use('/data/uploads', express.static(UPLOADS_DIR));

// ── Admin: Backup & Restore ──
app.get('/api/admin/backup', verifyAdminSession, (req, res) => {
  res.setHeader('Content-Disposition', `attachment; filename="apps-gravity-backup-${Date.now()}.json"`);
  res.json(store);
});

app.post('/api/admin/restore', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const backup = req.body;
  if (!backup || typeof backup !== 'object') return res.status(400).json({ error: 'Invalid backup data.' });

  const replaceArray = (target, source) => {
    target.length = 0;
    if (Array.isArray(source)) target.push(...source);
  };

  replaceArray(quotesStore, backup.quotes);
  replaceArray(courseRequestsStore, backup.courseRequests);
  replaceArray(reviewsStore, backup.reviews);
  replaceArray(coursesCatalog, backup.courses);
  replaceArray(postsStore, backup.posts);
  replaceArray(messagesStore, backup.messages);
  replaceArray(usersStore, backup.users);
  replaceArray(chatHistoryStore, backup.chatHistory);
  replaceArray(customKnowledgeStore, backup.customKnowledge);
  replaceArray(filesStore, backup.files);

  if (backup.settings) Object.assign(settingsStore, backup.settings);
  if (backup.analytics) Object.assign(analyticsStore, backup.analytics);

  setCustomKnowledgeEntries(customKnowledgeStore);
  persistStore();
  res.json({ success: true, message: 'Backup restored successfully.' });
});

app.delete('/api/admin/chat/:id', verifyAdminSession, verifyCSRFToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = chatHistoryStore.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Chat entry not found.' });
  chatHistoryStore.splice(idx, 1);
  persistStore();
  res.json({ success: true });
});

// Serve Static Frontend Files
app.use(express.static(__dirname));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Generic 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Resource not found." });
});

// Production Safe Error Handler (no stack trace exposure)
app.use((err, req, res, next) => {
  console.error("🔒 Security Event / Server Error:", err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message
  });
});
// Start Server
const server = app.listen(PORT, () => {
  console.log(`🔒 Enterprise Secure Apps Gravity Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another running process.`);
    console.error(`👉 The server is already running! You can access it directly at: http://localhost:${PORT}/admin`);
    console.error(`👉 To restart, run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});
