const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const DEFAULT_COURSES = [
  {
    id: 'medical-billing',
    title: 'Medical Billing Complete Video Course',
    category: 'medical',
    badge: '🔥 Free Full Video Course',
    meta: 'Full Video Lessons • Google Drive Access',
    desc: 'Comprehensive Medical Billing video course hosted on Google Drive. Covers claim submission, ICD-10 & CPT coding, revenue cycle management (RCM), and practical billing workflows.',
    driveUrl: 'https://drive.google.com/drive/folders/1sA2HPCr4jU8fH8aNAdogDor22VKgA96I?usp=drive_link',
    youtubeUrl: '',
    secureAccessRequired: true,
    features: ['🔒 End-to-End Secure Access', 'Hosted on Google Drive', '100% Free Full Lessons', 'ICD/CPT & RCM Modules']
  },
  {
    id: 'data-analytics-bi',
    title: 'Data Analytics and Business Intelligence',
    category: 'analytics',
    badge: '🆕 New • Free Full Video Course',
    meta: '178 Video Lessons • Videos & Files Included',
    desc: 'A complete, ground-up Data Analytics & Business Intelligence course. Covers analytics fundamentals, BI tools and techniques, and real-world project workflows across 178 video lessons.',
    pageUrl: 'data-analytics-course.html',
    youtubeUrl: '',
    features: ['📹 178 Video Lessons', '📂 Downloadable Course Files', '🔎 Searchable Lesson List', '💡 100% Free Access']
  }
];

const DEFAULT_REVIEWS = [
  { id: 1, name: 'Usman Tariq', role: 'Startup Founder', rating: 5, comment: 'Hassan built our mobile app from scratch. Phenomenal work, sleek UI, and super fast delivery!', date: '2026-06-15' },
  { id: 2, name: 'Dr. Ayesha Malik', role: 'Healthcare Professional', rating: 5, comment: 'The Medical Billing Video Course hosted on Google Drive was a lifesaver. Clear, thorough, and 100% free!', date: '2026-07-02' },
  { id: 3, name: 'Bilal Ahmad', role: 'E-Commerce Director', rating: 5, comment: 'Apps Gravity transformed our online store with custom web dev. Highly recommended!', date: '2026-07-20' }
];

const DEFAULT_SETTINGS = {
  siteName: 'Apps Gravity',
  founderName: 'Hassan',
  heroLine1: 'Apps & Knowledge Built for',
  heroLine2: 'Your Universe',
  heroSubtitle: "Hey, I'm Hassan — founder of Apps Gravity. I craft apps, websites & distribute free professional courses tailored to your needs.",
  contactEmail: 'mahadhassanlal@gmail.com',
  githubUrl: 'https://github.com/mahad1117a',
  logoUrl: 'logo.jpg',
  seoTitle: 'Apps Gravity | Hassan – App & Web Developer',
  seoDescription: 'Hassan – App Developer, Web Developer & Free Course Distributor. Building cutting-edge apps and websites tailored to your needs.',
  seoKeywords: 'Apps Gravity, Hassan, App Development, Web Development, Free Courses, Medical Billing Course, AI Assistant'
};

function defaultStore() {
  return {
    quotes: [],
    courseRequests: [],
    reviews: [...DEFAULT_REVIEWS],
    courses: [...DEFAULT_COURSES],
    posts: [],
    messages: [],
    users: [
      { id: 1, name: 'Hassan', email: 'mahadhassanlal@gmail.com', role: 'admin', createdAt: new Date().toISOString() }
    ],
    settings: { ...DEFAULT_SETTINGS },
    analytics: {
      pageViews: {},
      dailyVisits: [],
      searchQueries: {}
    },
    chatHistory: [],
    customKnowledge: [],
    files: []
  };
}

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function deepMergeSettings(defaults, saved) {
  return { ...defaults, ...(saved || {}) };
}

function loadStore() {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    const store = defaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
    return store;
  }
  try {
    const saved = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    const base = defaultStore();
    return {
      ...base,
      ...saved,
      settings: deepMergeSettings(base.settings, saved.settings),
      analytics: { ...base.analytics, ...(saved.analytics || {}) }
    };
  } catch (err) {
    console.error('Failed to load data store, using defaults:', err.message);
    return defaultStore();
  }
}

function saveStore(store) {
  ensureDirs();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || `item-${Date.now()}`;
}

module.exports = {
  DATA_DIR,
  UPLOADS_DIR,
  DEFAULT_SETTINGS,
  loadStore,
  saveStore,
  slugify
};
