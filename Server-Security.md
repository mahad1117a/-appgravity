# 🖥️ Server Security Architecture (`server.js`)

This document outlines the technical implementation details of the Express server security layer for **Apps Gravity**.

## Security Modules & Middleware Stack

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const validator = require('validator');
```

| Security Feature | Package / Mechanism | Scope / Rule |
| :--- | :--- | :--- |
| **HTTP Headers** | `helmet()` | Enforces CSP (`scriptSrc: 'self'` only), `frame-ancestors: 'none'`, HSTS, X-Frame-Options (DENY), nosniff, COOP, CORP, Referrer Policy, Permissions-Policy |
| **CSRF Protection** | In-memory token store | 32-byte crypto token validation via `X-CSRF-Token` header |
| **Rate Limiting** | `express-rate-limit` | General (100/15min), Strict (10/15min), Chatbot (15/min) |
| **Scanner / Bot Blocker** | Custom User-Agent filter | Blocks `sqlmap`, `nikto`, `nmap`, `gobuster`, `dirbuster`, `w3af`, etc. |
| **Deep Threat Inspection** | Exploit Regex Filter | Recursively scans payload values for XSS, SQLi, RCE, and Path Traversal |
| **IP Auto-Banning** | Dynamic IP ban store | 1-hour IP block upon detecting malicious exploit attempts |
| **NoSQL Injection** | `express-mongo-sanitize` | Replaces prohibited `$` and `.` operators with `_` |
| **Parameter Pollution** | `hpp()` | Whitelists acceptable parameters (`category`, `rating`, `projectType`) |
| **Body Size Limit** | Express JSON / UrlEncoded | Caps incoming payload size to `10kb` max |
| **Input Escaping** | `validator.escape()` | Escapes user input to prevent stored/reflected XSS |
| **No eval()/Function()** | Hand-written recursive-descent parser | The chatbot's calculator (`safeEvaluateArithmetic`) parses `+ - * / ( )` directly — no dynamic code execution primitive exists in that path |
| **Chatbot Knowledge Base** | `knowledge-base.js` (scored keyword matching) | 150+ entries across 11 categories, whole-word matching (no substring false-positives), Google-search-link fallback instead of HTML scraping |

---

## Endpoint Security Summary

| Endpoint | Method | Security Rules Applied |
| :--- | :--- | :--- |
| `/api/csrf-token` | `GET` | Generates & returns new 24h cryptographic token |
| `/api/chat` | `POST` | `chatLimiter`, `verifyCSRFToken`, length cap (500 chars), HTML escaping |
| `/api/quote` | `POST` | `strictLimiter`, `verifyCSRFToken`, email format validation, field escaping |
| `/api/courses/request` | `POST` | `strictLimiter`, `verifyCSRFToken`, email validation, field escaping |
| `/api/reviews` | `POST` | `strictLimiter`, `verifyCSRFToken`, rating bounds (1-5), string escaping |
| `/*` | `ALL` | Catch-all generic 404 & production-safe 500 error handler (no stack trace) |
