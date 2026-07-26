# 🔒 Apps Gravity - Enterprise Security & Server Security Guide

## 1. Overview & Architecture

The Apps Gravity platform implements an **Enterprise-Grade Multi-Layered Defense System** across both client-side and server-side infrastructure.

```
[ Client Browser ]
       │
       ▼ (HTTPS / TLS 1.2+)
[ Helmet Security Headers & CSP ]
       │
       ▼
[ CORS Origin Whitelist ]
       │
       ▼
[ Rate Limiting Middleware ]
       │
       ▼
[ Cryptographic CSRF Verification ]
       │
       ▼
[ NoSQL Injection & HPP Sanitization ]
       │
       ▼
[ Input Escaping & Validation ]
       │
       ▼
[ Secure Route Execution ]
```

---

## 2. Server Security Implementation (`server.js`)

### A. HTTP Security Headers (Helmet.js)
The server forces modern browser security policies:
- **Content Security Policy (CSP)**: Prevents execution of unauthorized external scripts or inline frame injection. `scriptSrc` is `'self'` only — no external script origins are trusted, since the site never loads a script from anywhere but its own `script.js`.
- **`frame-ancestors: 'none'`**: The modern CSP-level clickjacking defense, enforced alongside (not instead of) the legacy header below — respected by all current browsers even in edge cases where the legacy header isn't checked.
- **X-Frame-Options: `DENY`**: Legacy clickjacking defense, kept for older clients.
- **X-Content-Type-Options: `nosniff`**: Prevents browser MIME-type sniffing.
- **Strict-Transport-Security (HSTS)**: Forces TLS/HTTPS connections (`maxAge: 31536000`).
- **Referrer-Policy**: Set to `strict-origin-when-cross-origin`.
- **Permissions-Policy**: Explicitly disables camera, microphone, geolocation, payment, USB, and motion-sensor APIs site-wide — the site never needs them, so this closes off those APIs even against a future compromised script.

### B. Cross-Site Request Forgery (CSRF) Protection
- Endpoint `/api/csrf-token` generates a 32-byte cryptographic token (`crypto.randomBytes(32)`).
- Stored in memory with a 24-hour expiration window.
- All state-changing endpoints (`POST /api/chat`, `POST /api/quote`, `POST /api/courses/request`, `POST /api/reviews`) validate the header:
  ```http
  X-CSRF-Token: <token>
  ```

### C. Rate Limiting Strategy
Prevents Denial of Service (DoS) and automated bot spamming:
- **General API Limiter**: 100 requests / 15 minutes.
- **Strict Endpoint Limiter** (Quotes, Reviews, Requests): 10 requests / 15 minutes.
- **Chatbot Engine Limiter**: 15 messages / 1 minute.

### D. Input Sanitization & Data Protection
- **NoSQL Injection Prevention**: `express-mongo-sanitize` replaces `$` and `.` characters in payloads.
- **HTTP Parameter Pollution (HPP)**: `hpp` whitelist protects query strings.
- **Input Validation**: `validator.isEmail()` enforces correct email formats, and `validator.escape()` sanitizes text nodes against XSS.
- **Payload Size Limits**: Strict JSON body limit of `10kb`.
- **No eval()/Function()-style code execution**: the chatbot's calculator used to evaluate arithmetic via `Function(...)` (functionally equivalent to `eval()`), constrained only by a regex whitelist beforehand. It's now a small hand-written recursive-descent parser (`safeEvaluateArithmetic` in `server.js`) that is structurally incapable of executing anything other than `+ - * / ( )` arithmetic — there is no code-execution primitive left in that path at all, regardless of what reaches it.

### E. Bot/Scanner Blocking & Deep Attack Inspection
- **Automated Scanner Blocker**: Rejects requests from security scanners (`sqlmap`, `nikto`, `nmap`, `gobuster`, `dirbuster`, `w3af`, `acunetix`, `nessus`, `masscan`, `zgrab`).
- **Deep Exploit Vector Filter**: Recursively scans all incoming payload values against exploit regexes (`<script>`, `javascript:`, `union select`, `eval(`, `exec(`, `../`, `${`).
- **IP Threat Auto-Banning**: Automatically bans IP addresses for 1 hour upon detecting malicious payload injection attempts.

### F. GravityBot AI Knowledge Base (`knowledge-base.js`)
- A structured, scored knowledge base (150+ entries across 11 topic categories) that the chatbot searches before falling back further — see `knowledge-base.js` for the full list and how to add more entries.
- Matching uses whole-word/phrase boundaries (not raw substring checks), which also fixed pre-existing false-positive bugs in the older hardcoded intents (e.g. `"app"` previously matched inside `"happy"`/`"appreciate"`; `"rate"` matched inside `"generate"`/`"separate"`).
- When nothing in the knowledge base or the business-specific FAQ matches, the bot no longer scrapes DuckDuckGo's HTML (fragile, and a grey area under DuckDuckGo's terms of use). It now optionally shows a quick Wikipedia summary (a real, documented public API) and always includes a direct Google search link, so a visitor is never left with nothing.

---

## 3. Client-Side Protections & Fixes (`script.js`)

**Note (2026 audit):** earlier drafts of this document described client-side
"DevTools lock" (disabling F12, right-click, etc.) and prototype-freezing. Those
were never actually implemented in `script.js`, and on reflection they wouldn't
be worth adding: they're trivially bypassed by anyone who knows how (disabling
DevTools shortcuts doesn't stop the Network tab, a proxy, or curl), they break
accessibility tools and legitimate debugging, and they give a false sense of
security. Removed from this document. Real anti-clickjacking is handled at the
CSP/header level instead (see §2A), which can't be bypassed by disabling client
JavaScript.

Actual client-side fixes in this codebase:
- **XSS-safe chat & review rendering**: user- and externally-sourced text (chat
  replies, submitted reviews) is HTML-escaped before being inserted into the
  page, with only a small, safe whitelist of markdown (`**bold**`, `http(s)://`
  links) re-applied on top of the escaped text.
- **Shared review persistence**: reviews are loaded from `GET /api/reviews` on
  page load instead of only ever showing a local, unsynced array — so a
  submitted review is now genuinely visible to other visitors, not just the
  submitter's own browser session.

---

## 4. Web Server Configurations

### Nginx Production Reverse Proxy Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private-key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Security Verification Commands

Run the following commands locally to verify security enforcement:

```bash
# 1. Test CSRF Token Endpoint
curl -i http://localhost:3000/api/csrf-token

# 2. Test CSRF Protection Rejection (No Header)
curl -i -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message":"hello"}'

# 3. Security Audit
npm audit
```

---

**Last Updated:** July 25, 2026  
**Maintained by:** Hassan (@mahad1117a) — Founder of Apps Gravity
