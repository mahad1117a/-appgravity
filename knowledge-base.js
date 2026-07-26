// ══════════════════════════════════════════════════════════════════════════
// 🧠 GravityBot AI — Knowledge Base
//
// A structured, searchable knowledge base that powers GravityBot's answers
// on topics beyond Apps Gravity's own business FAQ (which stays hardcoded in
// server.js because those answers are business-critical and hand-tuned).
//
// HOW IT WORKS
// ────────────
// Each topic is one call to addEntries(category, [...]). Every entry has:
//   - keywords: words/phrases a visitor might type that should trigger it
//   - answer:   the response text (same **bold** / [link](url) / \n markdown
//               the frontend already renders)
//
// searchKnowledgeBase(query) scores every entry against the visitor's message
// (multi-word phrase matches score higher than single-word ones) and returns
// the best match if it clears a confidence threshold — otherwise null, which
// tells the caller to fall back to the live Google-search-link response.
//
// HOW TO ADD MORE KNOWLEDGE
// ──────────────────────────
// Scroll to any addEntries(...) block below (or add a new one) and push a new
// { keywords: [...], answer: "..." } object. No other file needs to change —
// this is intentionally structured so the knowledge base can keep growing
// over time without ever touching server.js.
// ══════════════════════════════════════════════════════════════════════════

const KNOWLEDGE_BASE = [];

function addEntries(category, entries) {
  for (const e of entries) {
    KNOWLEDGE_BASE.push({ category, keywords: e.keywords, answer: e.answer });
  }
}

// ── 🌐 WEB DEVELOPMENT ──
addEntries("Web Development", [
  {
    keywords: ["html", "what is html", "hypertext markup language"],
    answer: "🌐 **HTML (HyperText Markup Language)**\n\nHTML is the standard markup language used to structure content on the web — headings, paragraphs, links, images, forms, and more. Browsers read HTML and render it as a webpage.\n\nWant a custom website built the right way? That's exactly what Hassan does at Apps Gravity!"
  },
  {
    keywords: ["css", "what is css", "cascading style sheets"],
    answer: "🎨 **CSS (Cascading Style Sheets)**\n\nCSS controls how a webpage looks — colors, layout, fonts, spacing, and animations. It works alongside HTML (structure) and JavaScript (behavior) to form the three core building blocks of the web."
  },
  {
    keywords: ["javascript", "what is javascript", "js language"],
    answer: "⚡ **JavaScript**\n\nJavaScript is the programming language that makes webpages interactive — form validation, animations, live updates, and full web apps. It runs in every modern browser and, via Node.js, on servers too (this very site's backend is built with it!)."
  },
  {
    keywords: ["difference between html css javascript", "html vs css vs javascript"],
    answer: "🧩 **HTML vs CSS vs JavaScript**\n\n• **HTML** = structure (the skeleton)\n• **CSS** = presentation (the styling)\n• **JavaScript** = behavior (the interactivity)\n\nTogether they're the three pillars of front-end web development."
  },
  {
    keywords: ["react", "what is react", "react.js", "reactjs"],
    answer: "⚛️ **React**\n\nReact is a JavaScript library (built by Meta) for building user interfaces out of reusable components. It's one of the most in-demand front-end skills today, powering everything from small widgets to full single-page apps."
  },
  {
    keywords: ["nodejs", "what is node.js", "node js", "what is node"],
    answer: "🟢 **Node.js**\n\nNode.js lets you run JavaScript outside the browser — usually to build backend servers and APIs. This very website's backend server is built with Node.js and Express!"
  },
  {
    keywords: ["expressjs", "what is express.js", "express js"],
    answer: "🚂 **Express.js**\n\nExpress is a minimal, flexible web framework for Node.js used to build APIs and web servers quickly — routing, middleware, request handling, all included. Apps Gravity's own backend runs on Express."
  },
  {
    keywords: ["what is an api", "what is api", "rest api", "application programming interface"],
    answer: "🔌 **API (Application Programming Interface)**\n\nAn API is a set of rules that lets two pieces of software talk to each other — for example, your browser calling a server to fetch data. A **REST API** is the most common style: it uses standard HTTP methods (GET, POST, PUT, DELETE) over URLs."
  },
  {
    keywords: ["what is frontend", "front-end vs backend", "what is backend", "full stack meaning", "full stack developer"],
    answer: "🧱 **Front-end vs Back-end vs Full-Stack**\n\n• **Front-end**: everything the user sees and interacts with (HTML/CSS/JS, React, etc.)\n• **Back-end**: the server, database, and business logic behind the scenes\n• **Full-stack**: a developer comfortable working across both\n\nApps Gravity builds full-stack — from pixel-perfect UI down to secure backend APIs."
  },
  {
    keywords: ["what is a database", "sql vs nosql", "relational database"],
    answer: "🗄️ **Databases: SQL vs NoSQL**\n\n• **SQL (relational)** databases like MySQL/PostgreSQL store data in structured tables with fixed schemas — great for consistent, related data.\n• **NoSQL** databases like MongoDB store flexible, document-based data — great for rapidly changing or unstructured data.\n\nMost real projects pick based on the shape of the data, not hype."
  },
  {
    keywords: ["git", "github", "what is git", "git version control", "what is github"],
    answer: "🗂️ **Git & GitHub**\n\n**Git** is a version control system that tracks every change to your code so you can undo mistakes, work in branches, and collaborate safely. **GitHub** is a cloud platform for hosting Git repositories and collaborating with others."
  },
  {
    keywords: ["what is responsive design", "responsive web design", "mobile friendly website"],
    answer: "📱 **Responsive Web Design**\n\nA responsive website automatically adapts its layout to any screen size — desktop, tablet, or phone — usually via flexible grids, CSS media queries, and scalable images. Every site Apps Gravity builds is fully responsive by default."
  },
  {
    keywords: ["what is seo", "search engine optimization", "improve google ranking"],
    answer: "🔍 **SEO (Search Engine Optimization)**\n\nSEO is the practice of making a website easier for search engines to understand and rank — through fast load times, clean HTML structure, relevant keywords, meta descriptions, and quality backlinks. Good SEO is built in from day one, not bolted on later."
  },
  {
    keywords: ["what is hosting", "web hosting meaning", "what is a domain name"],
    answer: "☁️ **Hosting & Domains**\n\nA **domain** (like appsgravity.com) is your site's human-readable address. **Hosting** is the server space where your website's files actually live and get served from — providers include Vercel, Netlify, AWS, and traditional shared hosts."
  },
  {
    keywords: ["what is https", "http vs https", "ssl certificate", "tls certificate"],
    answer: "🔒 **HTTP vs HTTPS**\n\nHTTPS is HTTP with an added layer of encryption (TLS/SSL), so data traveling between browser and server can't be read or tampered with in transit. Any legitimate website handling logins, forms, or payments should run on HTTPS — Apps Gravity's projects always do."
  },
  {
    keywords: ["what is a cdn", "content delivery network"],
    answer: "🌍 **CDN (Content Delivery Network)**\n\nA CDN is a network of servers spread across the globe that cache and serve your website's static files (images, CSS, JS) from a location physically close to each visitor — making pages load faster worldwide."
  },
  {
    keywords: ["json", "what is json", "json format"],
    answer: "📦 **JSON (JavaScript Object Notation)**\n\nJSON is a lightweight, human-readable data format used almost everywhere on the web to exchange information between a browser and a server — e.g. `{\"name\": \"Hassan\", \"role\": \"Developer\"}`."
  },
  {
    keywords: ["npm", "what is npm", "node package manager"],
    answer: "📦 **npm (Node Package Manager)**\n\nnpm is the tool Node.js developers use to install and manage reusable code packages (libraries) — like Express, React, or security tools such as Helmet, all used in this very site."
  },
  {
    keywords: ["what is a web framework", "why use a framework"],
    answer: "🏗️ **Why use a framework?**\n\nFrameworks like Express (backend) or React (frontend) provide ready-made structure and solved problems — routing, security patterns, component reuse — so developers don't reinvent the wheel on every project, and code stays consistent and maintainable."
  },
  {
    keywords: ["graphql", "what is graphql"],
    answer: "🔷 **GraphQL**\n\nGraphQL is a query language for APIs that lets the client ask for exactly the data it needs in a single request, instead of over- or under-fetching data like typical REST endpoints often do."
  },
  {
    keywords: ["what is a single page application", "spa meaning"],
    answer: "📄 **Single Page Application (SPA)**\n\nAn SPA loads one HTML page and dynamically rewrites content as the user interacts with it, without full page reloads — giving an app-like feel. React, Vue, and Angular are commonly used to build SPAs."
  },
  {
    keywords: ["what is webpack", "what is vite", "bundler meaning"],
    answer: "📦 **Bundlers (Webpack / Vite)**\n\nA bundler takes many separate JS/CSS/asset files during development and combines + optimizes them into a small number of production-ready files, which is what actually gets shipped to visitors' browsers."
  },
  {
    keywords: ["what is web accessibility", "a11y meaning"],
    answer: "♿ **Web Accessibility (a11y)**\n\nAccessibility means designing websites so people with disabilities — visual, motor, cognitive — can use them too, e.g. via proper HTML semantics, keyboard navigation, color contrast, and screen-reader-friendly markup. It's good practice, and in many places a legal requirement."
  },
  {
    keywords: ["what is a progressive web app", "pwa meaning"],
    answer: "📲 **Progressive Web App (PWA)**\n\nA PWA is a website built to behave like a native app — installable to a home screen, capable of offline use, and able to send push notifications — all without needing an app store."
  },
  {
    keywords: ["how long does a website take to build", "how much time website development"],
    answer: "⏱️ **How long does a website take?**\n\nIt depends on scope — a simple landing page might take 1-2 weeks, while a full-stack platform with logins, payments, and an admin panel can take 3-6+ weeks. Use the **Project Estimator** on this page for a time estimate tailored to your exact requirements!"
  },
  {
    keywords: ["what tech stack do you use", "what technologies do you use", "what stack does apps gravity use"],
    answer: "🛠️ **Apps Gravity's Tech Stack**\n\nFront-end: HTML5, CSS3, modern JavaScript (and React when needed). Back-end: Node.js & Express. Security: Helmet, rate-limiting, CSRF protection, input sanitization — the same hardened stack running this very website."
  },
  {
    keywords: ["what is version control", "why use version control"],
    answer: "🔄 **Version Control**\n\nVersion control (most commonly Git) tracks every change made to a codebase over time, letting teams collaborate safely, review history, and roll back mistakes instantly instead of losing work."
  },
  {
    keywords: ["what is a landing page"],
    answer: "🎯 **Landing Page**\n\nA landing page is a focused, single-purpose webpage designed to drive one specific action — signing up, buying, or contacting — usually the destination of an ad or marketing campaign."
  }
]);

// ── 📱 MOBILE APP DEVELOPMENT ──
addEntries("Mobile Development", [
  {
    keywords: ["native app vs cross platform", "native vs hybrid app"],
    answer: "📱 **Native vs Cross-Platform Apps**\n\n• **Native** apps (Swift for iOS, Kotlin for Android) are built specifically for one platform — best performance, full access to device features.\n• **Cross-platform** apps (Flutter, React Native) share one codebase across iOS and Android — faster and cheaper to build and maintain.\n\nApps Gravity builds both, depending on your project's needs and budget."
  },
  {
    keywords: ["flutter", "what is flutter"],
    answer: "🐦 **Flutter**\n\nFlutter is Google's UI toolkit for building natively-compiled apps for iOS, Android, web, and desktop from a single Dart codebase — known for fast development and beautiful, consistent UI."
  },
  {
    keywords: ["react native", "what is react native"],
    answer: "⚛️ **React Native**\n\nReact Native lets developers build real native mobile apps using JavaScript and React, sharing most of the code between iOS and Android while still rendering true native UI components."
  },
  {
    keywords: ["kotlin", "what is kotlin"],
    answer: "🤖 **Kotlin**\n\nKotlin is the modern, officially-recommended language for native Android app development — concise, safer than Java (fewer null-pointer crashes), and fully interoperable with existing Java code."
  },
  {
    keywords: ["swift", "what is swift language", "swift programming ios"],
    answer: "🍎 **Swift**\n\nSwift is Apple's language for building native iOS, iPadOS, and macOS apps — fast, modern, and designed with safety features that catch bugs at compile time."
  },
  {
    keywords: ["how to publish app play store", "publish app google play"],
    answer: "🤖 **Publishing to Google Play**\n\nAt a high level: create a Google Play Developer account (one-time fee), prepare your app listing (screenshots, description, privacy policy), upload a signed release build (AAB), fill out content ratings and data-safety forms, then submit for review — typically a few hours to a couple of days."
  },
  {
    keywords: ["how to publish app app store", "publish app apple app store", "ios app submission"],
    answer: "🍏 **Publishing to the Apple App Store**\n\nAt a high level: enroll in the Apple Developer Program (annual fee), prepare your app listing and screenshots, archive and upload a build via Xcode, then submit for App Review — which typically takes 24-48 hours and checks for guideline compliance."
  },
  {
    keywords: ["push notifications meaning", "what are push notifications"],
    answer: "🔔 **Push Notifications**\n\nPush notifications are messages a mobile app can send to a user's device even when the app isn't open — used for reminders, updates, and re-engagement. They're delivered through services like Firebase Cloud Messaging or Apple Push Notification service."
  },
  {
    keywords: ["what is mobile ui ux", "mobile app design principles"],
    answer: "🎨 **Mobile UI/UX Basics**\n\nGood mobile design means thumb-friendly tap targets, minimal steps to complete a task, fast load times, and consistent platform conventions (Material Design for Android, Human Interface Guidelines for iOS)."
  },
  {
    keywords: ["how much does an app cost to build", "mobile app development cost"],
    answer: "💰 **Mobile App Development Cost**\n\nCosts scale with complexity — a simple app can start around ~$799, while apps with authentication, payments, or an admin panel cost more. Try the **Project Estimator** on this page for a tailored quote in seconds!"
  },
  {
    keywords: ["what is an mvp app", "minimum viable product mobile"],
    answer: "🚀 **MVP (Minimum Viable Product)**\n\nAn MVP is the smallest version of your app that still delivers real value to users — built to test an idea in the market quickly and cheaply before investing in every feature."
  },
  {
    keywords: ["do i need a backend for my app", "does my app need a server"],
    answer: "🖥️ **Does my app need a backend?**\n\nIf your app needs user accounts, saved data that syncs across devices, real-time features, or payments, yes — you'll need a backend server and database. A purely offline utility app might not."
  }
]);

// ── 💻 PROGRAMMING LANGUAGES & CS FUNDAMENTALS ──
addEntries("Programming Fundamentals", [
  {
    keywords: ["python", "what is python", "python programming language"],
    answer: "🐍 **Python**\n\nPython is a beginner-friendly, highly readable programming language used everywhere — web development, data analysis, AI/ML, automation, and scripting. It's often recommended as a first language."
  },
  {
    keywords: ["java", "what is java programming", "java language"],
    answer: "☕ **Java**\n\nJava is a widely-used, statically-typed language known for its \"write once, run anywhere\" portability. It powers everything from Android apps to large enterprise backend systems."
  },
  {
    keywords: ["c++", "what is c++", "c plus plus"],
    answer: "⚙️ **C++**\n\nC++ is a high-performance, low-level-capable language used for game engines, operating systems, and performance-critical software where fine control over memory matters."
  },
  {
    keywords: ["what is c language", "programming language c"],
    answer: "🔧 **C**\n\nC is one of the oldest and most influential programming languages — extremely close to hardware, still used for operating systems, embedded devices, and performance-critical code. Most modern languages borrow heavily from its syntax."
  },
  {
    keywords: ["php", "what is php"],
    answer: "🐘 **PHP**\n\nPHP is a server-side scripting language built specifically for the web — it powers a huge share of the internet, including WordPress, which alone runs over 40% of all websites."
  },
  {
    keywords: ["oop", "what is oop", "object oriented programming"],
    answer: "🧱 **OOP (Object-Oriented Programming)**\n\nOOP organizes code around \"objects\" that bundle data and behavior together, built on four core ideas: **encapsulation**, **inheritance**, **polymorphism**, and **abstraction**."
  },
  {
    keywords: ["what is a variable in programming", "what is a function in programming"],
    answer: "🔤 **Variables & Functions**\n\nA **variable** is a named container that stores a value. A **function** is a reusable block of code that performs a task and can be called whenever needed — the basic building blocks of every program."
  },
  {
    keywords: ["what is an array", "array data structure"],
    answer: "📊 **Array**\n\nAn array is an ordered collection of items stored under one variable name, accessed by index (position) — the most fundamental data structure in programming."
  },
  {
    keywords: ["what is a linked list"],
    answer: "🔗 **Linked List**\n\nA linked list stores data in nodes, where each node points to the next — unlike arrays, elements don't need to sit in contiguous memory, making insertion and deletion in the middle much cheaper."
  },
  {
    keywords: ["what is a stack data structure", "stack vs queue"],
    answer: "📚 **Stack vs Queue**\n\n• **Stack**: Last-In-First-Out (LIFO) — like a stack of plates, you remove from the top.\n• **Queue**: First-In-First-Out (FIFO) — like a checkout line, first person in is first served."
  },
  {
    keywords: ["what is a binary tree", "tree data structure"],
    answer: "🌳 **Tree (Data Structure)**\n\nA tree is a hierarchical structure of nodes, each with a parent and (optionally) children, starting from a single root — used for file systems, databases (indexes), and organizing hierarchical data. A **binary tree** limits each node to at most two children."
  },
  {
    keywords: ["what is a hash table", "hash map meaning"],
    answer: "🔑 **Hash Table (Hash Map)**\n\nA hash table stores key-value pairs and uses a hash function to compute where each value lives, giving average constant-time (O(1)) lookups — one of the most-used data structures in real software."
  },
  {
    keywords: ["what is big o notation", "time complexity meaning"],
    answer: "📈 **Big-O Notation**\n\nBig-O describes how an algorithm's running time (or memory use) grows as input size grows — e.g. O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic. It's how developers compare algorithm efficiency independent of hardware."
  },
  {
    keywords: ["what is recursion in programming"],
    answer: "🔁 **Recursion**\n\nRecursion is when a function calls itself to solve smaller instances of the same problem, until it hits a base case that stops it — commonly used for tree traversal, sorting algorithms, and problems that break down naturally into sub-problems."
  },
  {
    keywords: ["what is an algorithm"],
    answer: "🧮 **Algorithm**\n\nAn algorithm is a precise, step-by-step procedure for solving a problem or completing a task — sorting a list, finding the shortest path, searching data, and so on."
  },
  {
    keywords: ["bubble sort", "quick sort", "merge sort", "sorting algorithm"],
    answer: "🔀 **Sorting Algorithms**\n\nCommon ones include **Bubble Sort** (simple, slow: O(n²)), **Quick Sort** (fast in practice, average O(n log n)), and **Merge Sort** (stable, guaranteed O(n log n)). Real languages almost always use built-in optimized sorts rather than hand-rolled ones."
  },
  {
    keywords: ["what is an ide", "integrated development environment", "vs code meaning"],
    answer: "🖥️ **IDE (Integrated Development Environment)**\n\nAn IDE is software that bundles a code editor, debugger, and build tools together for writing software — popular ones include VS Code, IntelliJ, and Xcode."
  },
  {
    keywords: ["what is debugging", "how to debug code"],
    answer: "🐛 **Debugging**\n\nDebugging is the process of finding and fixing errors (bugs) in code — usually with tools like breakpoints, console logging, and step-through debuggers built into most IDEs."
  },
  {
    keywords: ["what is an api key"],
    answer: "🔑 **API Key**\n\nAn API key is a unique identifier used to authenticate requests to an API — proving who's calling it, and often used for rate limiting or billing. Sensitive API keys should never be exposed in public front-end code."
  },
  {
    keywords: ["compiled vs interpreted language", "what is a compiler", "what is an interpreter"],
    answer: "⚙️ **Compiled vs Interpreted Languages**\n\nA **compiler** translates all source code into machine code before running (like C++). An **interpreter** executes code line-by-line at runtime (like Python or JavaScript). Some languages, like Java, do a bit of both."
  },
  {
    keywords: ["what is asynchronous programming", "what is async await", "what is a promise in javascript"],
    answer: "⏳ **Asynchronous Programming**\n\nAsync code lets a program keep running (e.g. keep the UI responsive) while waiting on slow operations like network requests, instead of freezing. In JavaScript this is handled with **Promises** and the `async`/`await` syntax."
  },
  {
    keywords: ["best programming language to learn first", "which language should i learn first"],
    answer: "🎓 **Best first programming language**\n\nMost educators recommend **Python** first — clean, readable syntax that lets you focus on logic rather than fighting the language. If your goal is specifically web development, starting with **JavaScript** also makes sense since it's used everywhere on the web."
  }
]);

// ── 🛡️ CYBERSECURITY ──
addEntries("Cybersecurity", [
  {
    keywords: ["xss", "what is xss", "cross site scripting"],
    answer: "🛡️ **XSS (Cross-Site Scripting)**\n\nXSS is a vulnerability where an attacker injects malicious scripts into a webpage that then run in other users' browsers — usually because untrusted input was rendered as HTML without escaping. This site protects against it with strict input escaping and a Content-Security-Policy."
  },
  {
    keywords: ["sqli", "what is sql injection"],
    answer: "🛡️ **SQL Injection (SQLi)**\n\nSQL injection happens when untrusted user input is inserted directly into a database query, letting an attacker manipulate or steal data. The fix is always **parameterized queries / prepared statements** — never building SQL by string concatenation."
  },
  {
    keywords: ["csrf", "what is csrf", "cross site request forgery"],
    answer: "🛡️ **CSRF (Cross-Site Request Forgery)**\n\nCSRF tricks a logged-in user's browser into submitting an unwanted request to a site they're authenticated on — e.g. secretly changing their password via a malicious page. Defenses include CSRF tokens (which this site uses) and SameSite cookies."
  },
  {
    keywords: ["what is encryption", "how does encryption work"],
    answer: "🔐 **Encryption**\n\nEncryption scrambles data using a mathematical algorithm and a key so only someone with the correct key can read it. **Symmetric** encryption uses one shared key; **asymmetric** encryption uses a public/private key pair (used in HTTPS)."
  },
  {
    keywords: ["what is password hashing", "how are passwords stored securely", "bcrypt meaning"],
    answer: "🔑 **Password Hashing**\n\nGood systems never store your actual password — they store a one-way **hash** (via algorithms like bcrypt or Argon2) plus a random \"salt.\" Even if the database leaks, the original passwords can't be recovered directly."
  },
  {
    keywords: ["what is two factor authentication", "what is 2fa", "mfa meaning"],
    answer: "🔒 **Two-Factor Authentication (2FA/MFA)**\n\n2FA adds a second proof of identity beyond your password — a code from an app, an SMS, or a hardware key — so a stolen password alone isn't enough to break into an account."
  },
  {
    keywords: ["what is phishing"],
    answer: "🎣 **Phishing**\n\nPhishing is a social-engineering attack where scammers impersonate a trusted source (a bank, a company, a colleague) via email, text, or a fake website to trick people into giving up passwords, card numbers, or other sensitive data."
  },
  {
    keywords: ["what is a firewall"],
    answer: "🧱 **Firewall**\n\nA firewall monitors and filters incoming/outgoing network traffic based on defined security rules, acting as a barrier between a trusted internal network and untrusted external networks like the internet."
  },
  {
    keywords: ["vpn", "what is a vpn"],
    answer: "🌐 **VPN (Virtual Private Network)**\n\nA VPN encrypts your internet traffic and routes it through a remote server, hiding your IP address and protecting your data on untrusted networks like public Wi-Fi."
  },
  {
    keywords: ["what is malware", "what is ransomware", "what is a virus computer"],
    answer: "🦠 **Malware & Ransomware**\n\n**Malware** is any software designed to harm, exploit, or gain unauthorized access to a system. **Ransomware** is a specific type that encrypts your files and demands payment for the decryption key — regular backups are the best defense."
  },
  {
    keywords: ["what is penetration testing", "what is ethical hacking"],
    answer: "🕵️ **Penetration Testing (Ethical Hacking)**\n\nPen testing means legally and deliberately probing a system for vulnerabilities — with permission — so they can be fixed before real attackers find them."
  },
  {
    keywords: ["owasp", "owasp top 10", "what is owasp"],
    answer: "📋 **OWASP Top 10**\n\nOWASP is a nonprofit that publishes the \"Top 10\" most critical web application security risks — things like broken access control, injection flaws, and security misconfiguration — used industry-wide as a baseline security checklist."
  },
  {
    keywords: ["what is rate limiting", "why rate limit api"],
    answer: "🚦 **Rate Limiting**\n\nRate limiting caps how many requests a single user or IP can make in a given time window, protecting a server from abuse, brute-force attempts, and denial-of-service traffic. This site itself uses tiered rate limits on every API endpoint."
  },
  {
    keywords: ["what is a data breach", "what to do after data breach"],
    answer: "🚨 **Data Breach**\n\nA data breach is unauthorized access to confidential data. If a service you use is breached, change that password immediately (and anywhere else you reused it), and enable 2FA if you haven't already."
  },
  {
    keywords: ["is my website secure", "how secure is this website", "how is this site secured"],
    answer: "🔒 **How this site stays secure**\n\nApps Gravity's own platform runs a layered security stack: HTTPS/TLS, Helmet security headers with a strict Content-Security-Policy, CSRF token verification, rate limiting, NoSQL-injection & HPP protection, and full input sanitization on every endpoint. Security isn't an afterthought here — it's the foundation Hassan builds every client project on too."
  }
]);

// ── 🗄️ DATABASES, DATA ANALYTICS & BI ──
addEntries("Data & Analytics", [
  {
    keywords: ["what is data analytics", "data analytics meaning"],
    answer: "📊 **Data Analytics**\n\nData analytics is the process of examining raw data to find patterns, draw conclusions, and support decisions — spanning descriptive (what happened), diagnostic (why), predictive (what's likely next), and prescriptive (what to do) analysis. Hassan's free **178-lesson Data Analytics & BI course** covers all of this from the ground up!"
  },
  {
    keywords: ["what is business intelligence", "bi meaning"],
    answer: "📈 **Business Intelligence (BI)**\n\nBI is the combination of tools, processes, and technology that turns raw business data into actionable dashboards and reports — helping companies make faster, data-driven decisions. Tools like Power BI and Tableau are industry standards."
  },
  {
    keywords: ["sql", "what is sql", "structured query language"],
    answer: "🗄️ **SQL (Structured Query Language)**\n\nSQL is the standard language for querying and managing relational databases — SELECT, INSERT, UPDATE, DELETE, and JOIN are its core commands. It's one of the most valuable and durable skills in tech."
  },
  {
    keywords: ["what is excel used for", "microsoft excel", "excel functions"],
    answer: "📗 **Microsoft Excel**\n\nExcel remains one of the most widely used data tools in business — for calculations, formulas, pivot tables, and quick visualizations. It's the very first tool covered in Hassan's free **Data Analytics & BI course**."
  },
  {
    keywords: ["tableau power bi", "what is power bi"],
    answer: "📊 **Power BI**\n\nPower BI is Microsoft's business intelligence tool for connecting to data sources, building interactive dashboards, and sharing reports across an organization — a core skill in Hassan's free Data Analytics course."
  },
  {
    keywords: ["tableau", "what is tableau"],
    answer: "📉 **Tableau**\n\nTableau is a leading data visualization platform that turns raw data into interactive, shareable dashboards — widely used in business intelligence and analytics roles."
  },
  {
    keywords: ["what is data normalization", "database normalization"],
    answer: "🗂️ **Database Normalization**\n\nNormalization organizes a relational database's tables and columns to reduce data duplication and keep data consistent, following a series of \"normal forms\" (1NF, 2NF, 3NF, etc.)."
  },
  {
    keywords: ["what is acid in databases", "acid properties database"],
    answer: "🧪 **ACID (Database Transactions)**\n\nACID stands for **Atomicity, Consistency, Isolation, Durability** — the four guarantees a reliable database transaction system provides so your data never ends up half-updated or corrupted."
  },
  {
    keywords: ["what is an index in a database", "database indexing"],
    answer: "📇 **Database Indexing**\n\nAn index is a special data structure that lets a database find rows much faster — similar to an index at the back of a book — at the cost of extra storage and slightly slower writes."
  },
  {
    keywords: ["etl", "what is etl", "extract transform load"],
    answer: "🔄 **ETL (Extract, Transform, Load)**\n\nETL is the process of pulling data from various sources (Extract), cleaning/reshaping it (Transform), and loading it into a target system like a data warehouse (Load) — the backbone of most analytics pipelines."
  },
  {
    keywords: ["what is a data warehouse"],
    answer: "🏢 **Data Warehouse**\n\nA data warehouse is a large central repository that stores integrated data from multiple sources, optimized for analysis and reporting rather than day-to-day transactions."
  },
  {
    keywords: ["what is data visualization", "why is data visualization important"],
    answer: "📊 **Data Visualization**\n\nData visualization turns numbers into charts, graphs, and dashboards so patterns and trends are instantly understandable — a critical final step in any analytics workflow, since insight nobody can read is insight nobody uses."
  },
  {
    keywords: ["what is a pivot table"],
    answer: "🔄 **Pivot Table**\n\nA pivot table lets you summarize, group, and reorganize large datasets in Excel (or similar tools) without writing formulas — one of the fastest ways to turn raw rows of data into a useful summary."
  },
  {
    keywords: ["mean median mode", "what is standard deviation", "basic statistics for data analytics"],
    answer: "📐 **Basic Statistics for Analytics**\n\n• **Mean**: the average\n• **Median**: the middle value\n• **Mode**: the most frequent value\n• **Standard deviation**: how spread out the data is from the mean\n\nThese fundamentals underpin almost every analytics and BI task."
  }
]);

// ── 🤖 AI & MACHINE LEARNING ──
addEntries("AI & Machine Learning", [
  {
    keywords: ["artificial intelligence", "what is ai"],
    answer: "🤖 **Artificial Intelligence (AI)**\n\nAI is the broad field of building systems that perform tasks normally requiring human intelligence — understanding language, recognizing images, making decisions. I'm actually an example of one myself, built by Hassan for Apps Gravity!"
  },
  {
    keywords: ["machine learning", "what is machine learning", "ml meaning"],
    answer: "📚 **Machine Learning (ML)**\n\nML is a subset of AI where systems learn patterns from data instead of being explicitly programmed with rules — improving at a task the more (good) data they see."
  },
  {
    keywords: ["what is deep learning"],
    answer: "🧠 **Deep Learning**\n\nDeep learning is a subset of machine learning using multi-layered artificial neural networks, loosely inspired by the brain, to model complex patterns — the technology behind modern image recognition, speech recognition, and chatbots like me."
  },
  {
    keywords: ["what is a neural network"],
    answer: "🕸️ **Neural Network**\n\nA neural network is a computing structure made of layers of interconnected \"neurons\" that adjust their internal weights during training to recognize patterns in data — the core building block of deep learning."
  },
  {
    keywords: ["nlp", "what is nlp", "natural language processing"],
    answer: "💬 **NLP (Natural Language Processing)**\n\nNLP is the branch of AI focused on understanding and generating human language — powering chatbots, translation, sentiment analysis, and voice assistants."
  },
  {
    keywords: ["what is a chatbot", "how do chatbots work"],
    answer: "🤖 **How Chatbots Work**\n\nChatbots range from simple rule/keyword-matching systems (like parts of how I work) to large AI language models that generate free-form responses. Many production chatbots — including me — combine both: fast, precise answers for known topics, and a fallback for anything outside that."
  },
  {
    keywords: ["what is computer vision"],
    answer: "👁️ **Computer Vision**\n\nComputer vision is the AI field focused on letting machines interpret images and video — used for face recognition, self-driving cars, medical imaging, and quality inspection in manufacturing."
  },
  {
    keywords: ["what is prompt engineering"],
    answer: "✍️ **Prompt Engineering**\n\nPrompt engineering is the skill of crafting effective instructions for AI language models to get accurate, useful, well-formatted output — an increasingly valuable skill as AI tools become part of everyday workflows."
  },
  {
    keywords: ["tensorflow vs pytorch", "what is tensorflow", "what is pytorch"],
    answer: "🔧 **TensorFlow vs PyTorch**\n\nBoth are leading open-source frameworks for building and training machine learning models. **TensorFlow** (Google) is popular in production deployment; **PyTorch** (Meta) is popular in research for its flexibility — both are excellent choices today."
  },
  {
    keywords: ["is ai going to replace developers", "will ai replace programmers"],
    answer: "🤔 **Will AI replace developers?**\n\nAI is changing how developers work — automating boilerplate and speeding up debugging — but building real products still needs human judgment: understanding what users actually need, architecture decisions, and security. It's a tool that makes good developers faster, not a replacement for them."
  }
]);

// ── 🏥 MEDICAL BILLING & HEALTHCARE ADMIN (expanded beyond the core FAQ) ──
addEntries("Medical Billing", [
  {
    keywords: ["hcpcs", "what is hcpcs", "hcpcs codes"],
    answer: "🏥 **HCPCS Codes**\n\nHCPCS (Healthcare Common Procedure Coding System) codes cover products, supplies, and services not included in CPT codes — like ambulance rides, durable medical equipment, and certain drugs. Covered in depth in Hassan's free Medical Billing course."
  },
  {
    keywords: ["what is a claim denial", "denial management medical billing", "why do insurance claims get denied"],
    answer: "🚫 **Claim Denials & Denial Management**\n\nA denial happens when an insurer refuses to pay a submitted claim — common causes include coding errors, missing prior authorization, or eligibility issues. **Denial management** is the process of identifying, correcting, and resubmitting (appealing) these claims to recover revenue."
  },
  {
    keywords: ["what is an ehr", "what is an emr", "electronic health record"],
    answer: "💻 **EHR vs EMR**\n\nAn **EMR** (Electronic Medical Record) is a digital version of a patient's chart within one practice. An **EHR** (Electronic Health Record) is broader — designed to be shared across multiple providers and organizations for a fuller patient history."
  },
  {
    keywords: ["hipaa", "what is hipaa"],
    answer: "🔒 **HIPAA**\n\nHIPAA (Health Insurance Portability and Accountability Act) is U.S. legislation that sets national standards for protecting patient health information — anyone handling medical billing or records must follow strict privacy and security rules."
  },
  {
    keywords: ["what is prior authorization", "prior auth medical billing"],
    answer: "📝 **Prior Authorization**\n\nPrior authorization is approval an insurer requires *before* certain procedures or medications are covered. Skipping this step is one of the most common reasons claims get denied."
  },
  {
    keywords: ["superbill", "what is a superbill"],
    answer: "🧾 **Superbill**\n\nA superbill is an itemized form a healthcare provider gives detailing services rendered, diagnosis codes (ICD-10), and procedure codes (CPT) — the source document a biller uses to create and submit a claim."
  },
  {
    keywords: ["what is an eob", "explanation of benefits"],
    answer: "📄 **EOB (Explanation of Benefits)**\n\nAn EOB is a statement an insurer sends after processing a claim, showing what was billed, what the insurance covered, and what the patient owes — it is NOT a bill itself."
  },
  {
    keywords: ["deductible copay coinsurance difference", "what is a copay", "what is coinsurance", "what is a deductible"],
    answer: "💵 **Deductible vs Copay vs Coinsurance**\n\n• **Deductible**: what you pay out-of-pocket before insurance starts covering costs\n• **Copay**: a fixed fee per visit/service\n• **Coinsurance**: a percentage of the cost you share with the insurer after the deductible is met"
  },
  {
    keywords: ["what is a clearinghouse medical billing"],
    answer: "🔄 **Clearinghouse (Medical Billing)**\n\nA clearinghouse is a middleman service that checks claims for errors and formats them correctly before forwarding them electronically to insurance payers — reducing rejection rates significantly."
  },
  {
    keywords: ["medical coding vs medical billing difference", "coder vs biller"],
    answer: "🧩 **Medical Coding vs Medical Billing**\n\n**Medical coding** translates a doctor's diagnosis/procedure notes into standardized codes (ICD-10, CPT). **Medical billing** takes those codes and creates/submits/tracks the actual insurance claim for payment. Related but distinct roles — often learned together."
  },
  {
    keywords: ["cpc certification", "medical billing certification", "how to become a medical biller"],
    answer: "🎓 **Medical Billing/Coding Certifications**\n\nCommon industry certifications include the **CPC** (Certified Professional Coder, from AAPC) and **CCS** (Certified Coding Specialist, from AHIMA). Hassan's free video course teaches the practical fundamentals that support exactly this career path — at zero cost."
  },
  {
    keywords: ["what is revenue cycle management", "rcm process steps"],
    answer: "🔁 **Revenue Cycle Management (RCM) — the full flow**\n\nRCM covers the entire financial journey of a patient: registration & eligibility check → charge capture → coding → claim submission → payment posting → denial management/appeals → patient billing. Hassan's free course walks through every one of these stages."
  }
]);

// ── 💼 BUSINESS, FREELANCING & ENTREPRENEURSHIP ──
addEntries("Business & Freelancing", [
  {
    keywords: ["how to price a freelance project", "how to price a project"],
    answer: "💰 **Pricing a Project**\n\nMost freelancers price by: **fixed price** (agreed total for defined scope — best for well-defined projects), **hourly rate** (best for open-ended/evolving work), or **value-based pricing** (priced on the value delivered, not time spent). Apps Gravity uses transparent fixed pricing — try the **Project Estimator** above to see a real breakdown."
  },
  {
    keywords: ["what is an mvp", "minimum viable product meaning"],
    answer: "🚀 **MVP (Minimum Viable Product)**\n\nAn MVP is the simplest version of a product that still lets you test your core idea with real users — before spending time and money building every feature you imagine you'll need."
  },
  {
    keywords: ["how to write a good project brief", "client requirements gathering"],
    answer: "📋 **Writing a Good Project Brief**\n\nA strong brief covers: the problem you're solving, target users, must-have vs nice-to-have features, budget range, and timeline. The clearer the brief, the faster and more accurate any quote (including our own **Project Estimator**) will be."
  },
  {
    keywords: ["what should be in a freelance contract", "do i need a contract for a project"],
    answer: "📄 **Freelance Contracts**\n\nA solid contract should cover scope of work, payment terms & schedule, revision limits, IP/ownership of the final product, and a timeline — protecting both client and developer from misunderstandings."
  },
  {
    keywords: ["how to invoice a client", "invoicing tips"],
    answer: "🧾 **Invoicing Basics**\n\nA good invoice includes: your business details, the client's details, an itemized list of work/deliverables, the total due, payment terms (e.g. Net 15/30), and accepted payment methods — clear invoicing avoids payment delays."
  },
  {
    keywords: ["how to market a small business", "small business marketing tips"],
    answer: "📣 **Basic Small Business Marketing**\n\nStart with: a clear, fast website (your digital storefront), consistent social presence where your audience actually is, and word-of-mouth/testimonials — genuine reviews (like the ones on this page!) build trust faster than ads alone."
  },
  {
    keywords: ["bootstrapping vs funding startup", "how do startups get funded"],
    answer: "💵 **Startup Funding Basics**\n\n**Bootstrapping** means growing with your own revenue/savings — full control, slower growth. External funding (angel investors, venture capital) trades some ownership/control for faster growth capital. Most successful companies start bootstrapped."
  },
  {
    keywords: ["tips for remote work", "working with a remote developer"],
    answer: "🌍 **Working With a Remote Developer**\n\nClear written requirements, a single point of contact, agreed check-in points, and a shared project-tracking tool go a long way — Hassan works with clients worldwide this way every day."
  }
]);

// ── 🏢 APPS GRAVITY — EXPANDED FAQ (beyond the hardcoded core rules in server.js) ──
addEntries("Apps Gravity FAQ", [
  {
    keywords: ["do you provide source code", "is source code included", "do i own the code"],
    answer: "📂 **Source Code Ownership**\n\nYes — when a project is completed and paid for, you receive full source code and ownership. There's no vendor lock-in with Apps Gravity."
  },
  {
    keywords: ["do you offer support after launch", "post launch support", "do you offer maintenance"],
    answer: "🛠️ **Post-Launch Support**\n\nApps Gravity offers ongoing support and maintenance packages after launch — bug fixes, updates, and feature additions. Reach out via the contact form to discuss what fits your project."
  },
  {
    keywords: ["do you sign an nda", "non disclosure agreement", "is my idea confidential"],
    answer: "🤐 **Confidentiality & NDAs**\n\nYour project details and ideas are treated as confidential. If you'd like a formal NDA signed before sharing sensitive details, just mention it when you reach out via the contact form."
  },
  {
    keywords: ["what payment methods do you accept", "how do i pay for a project"],
    answer: "💳 **Payments**\n\nPayment details and accepted methods are confirmed directly with Hassan once your project scope is finalized — reach out via the contact form or email to arrange this."
  },
  {
    keywords: ["can you redesign my existing website", "website redesign service"],
    answer: "♻️ **Website Redesigns**\n\nYes — Apps Gravity takes on redesigns of existing websites, whether that means a visual refresh, a full rebuild on modern tech, or adding new features to what you already have."
  },
  {
    keywords: ["do you offer refunds", "refund policy"],
    answer: "↩️ **Refund Policy**\n\nRefund terms depend on project stage and are agreed upfront before work begins, as part of the project contract — reach out via the contact form for specifics on your situation."
  },
  {
    keywords: ["why choose apps gravity", "why hire hassan", "what makes apps gravity different"],
    answer: "⭐ **Why Apps Gravity?**\n\nTransparent, upfront pricing (try the **Project Estimator**), a security-first engineering approach (this very site runs enterprise-grade protections), free professional courses given back to the community, and direct, one-on-one communication with the founder — not a faceless agency."
  },
  {
    keywords: ["is the medical billing course really free", "any hidden cost course", "is there a catch free course"],
    answer: "🎁 **No Catch — Genuinely Free**\n\nBoth the Medical Billing course and the Data Analytics & BI course are 100% free, with no hidden fees, no upsells, and no paywalled modules. Hassan built these to give real value back to learners."
  },
  {
    keywords: ["how does the ai assistant work", "how do you work gravitybot", "are you a real ai"],
    answer: "🤖 **How I work**\n\nI combine a curated knowledge base about Apps Gravity's services and a wide range of tech/business topics with a live Google-search fallback for anything outside that — so you always get either a direct answer or a quick way to look it up yourself."
  },
  {
    keywords: ["how do i request a course", "can i request a specific course topic"],
    answer: "📚 **Requesting a Course**\n\nClick **'Request a Course'** in the Free Courses section, tell us the topic, and Hassan will consider uploading a free video course on it!"
  }
]);

// ── 🌍 GENERAL COMPUTER & INTERNET LITERACY ──
addEntries("General Tech Literacy", [
  {
    keywords: ["what is cloud computing"],
    answer: "☁️ **Cloud Computing**\n\nCloud computing means renting computing power, storage, and services over the internet (from providers like AWS, Google Cloud, or Azure) instead of owning and maintaining physical servers yourself."
  },
  {
    keywords: ["what is a browser", "how does a web browser work"],
    answer: "🌐 **Web Browser**\n\nA browser (Chrome, Safari, Firefox, Edge) is the software that requests webpages from servers and renders their HTML/CSS/JavaScript into what you see and interact with on screen."
  },
  {
    keywords: ["what is an ip address"],
    answer: "🔢 **IP Address**\n\nAn IP address is a unique numerical label assigned to every device on a network, letting data find its way to and from the right destination — similar to a postal address for the internet."
  },
  {
    keywords: ["difference between ui and ux", "what is ui ux"],
    answer: "🎨 **UI vs UX**\n\n• **UI (User Interface)**: how a product looks — layout, colors, buttons\n• **UX (User Experience)**: how a product feels to use — how intuitive, efficient, and satisfying the whole journey is\n\nGreat products need both working together."
  },
  {
    keywords: ["what is cache", "what does clearing cache do"],
    answer: "🗃️ **Cache**\n\nA cache stores copies of frequently used data closer to where it's needed (your browser, a server, a CDN) so future requests are faster — clearing it forces a fresh download instead of reusing possibly outdated stored copies."
  },
  {
    keywords: ["what is a cookie website", "browser cookies meaning"],
    answer: "🍪 **Browser Cookies**\n\nCookies are small pieces of data a website stores in your browser to remember things between visits — like staying logged in or remembering preferences. This site uses a secure, httpOnly cookie purely for CSRF protection, nothing else."
  },
  {
    keywords: ["what is a server"],
    answer: "🖥️ **Server**\n\nA server is a computer (or program) that provides data, resources, or services to other computers (clients) over a network — every website you visit is served by one."
  },
  {
    keywords: ["what is bandwidth internet"],
    answer: "📶 **Bandwidth**\n\nBandwidth is the maximum amount of data that can be transferred over a network connection in a given time — usually measured in Mbps (megabits per second). Higher bandwidth means faster downloads/streaming, assuming other factors don't bottleneck it."
  },
  {
    keywords: ["what is open source software", "open source meaning"],
    answer: "🔓 **Open Source Software**\n\nOpen source means a project's source code is publicly available for anyone to view, use, modify, and contribute to — Linux, WordPress, and countless developer tools are open source."
  },
  {
    keywords: ["difference between mb and gb", "what is a byte"],
    answer: "💾 **Bytes, KB, MB, GB**\n\nA **byte** is 8 bits. 1 **KB** ≈ 1,000 bytes, 1 **MB** ≈ 1,000 KB, 1 **GB** ≈ 1,000 MB — each unit is roughly 1,000x the previous one, used to measure file sizes and storage."
  }
]);

// ── 🎓 CAREER & LEARNING GUIDANCE ──
addEntries("Career & Learning", [
  {
    keywords: ["how to become a web developer", "how do i learn web development"],
    answer: "🎓 **Becoming a Web Developer**\n\nA solid path: learn HTML & CSS fundamentals → JavaScript → pick a framework (React is a great default) → learn Git → build real projects for your portfolio → learn backend basics (Node.js/Express). Consistent building beats consuming endless tutorials."
  },
  {
    keywords: ["is coding hard to learn", "can anyone learn to code"],
    answer: "💪 **Is coding hard to learn?**\n\nIt's a skill like any other — genuinely learnable by anyone willing to practice consistently. The hardest part for most people isn't the logic, it's staying consistent through the early frustrating stages before things start clicking."
  },
  {
    keywords: ["free resources to learn coding", "best free coding courses"],
    answer: "📚 **Free Ways to Learn**\n\nBeyond Hassan's own free courses on this site, freeCodeCamp, MDN Web Docs, and official language documentation are excellent, genuinely free starting points for programming and web development."
  },
  {
    keywords: ["how to build a developer portfolio", "portfolio tips for developers"],
    answer: "💼 **Building a Developer Portfolio**\n\nShow 3-5 real, finished projects (not just tutorials) with live demos and source code links, a short case study on the problem each one solves, and clear contact info — quality and finish beat quantity every time."
  },
  {
    keywords: ["coding interview tips", "how to prepare for a technical interview"],
    answer: "🧑‍💻 **Technical Interview Prep**\n\nPractice explaining your thought process out loud while solving problems (not just getting the right answer silently), review core data structures & algorithms, and be ready to walk through real projects you've built in detail."
  },
  {
    keywords: ["is a computer science degree necessary", "do i need a degree to be a developer"],
    answer: "🎓 **Do you need a CS degree?**\n\nNo — many working developers are self-taught or came from bootcamps. What actually matters to employers and clients is demonstrated skill: a strong portfolio, the ability to solve real problems, and clear communication."
  }
]);

// ══════════════════════════════════════════════════════════════════════════
// 🔎 SEARCH ENGINE
// Scores every entry's keywords against the visitor's message. Multi-word
// phrase matches score much higher than single-word ones (a phrase match is
// a far stronger signal of real intent), and the highest-scoring entry wins
// — but only if it clears `threshold`, so a weak/coincidental match doesn't
// get returned instead of falling through to the Google-search fallback.
// ══════════════════════════════════════════════════════════════════════════

function normalizeText(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generic English words that happen to be short — never let these trigger a
// match on their own, since they'd coincidentally appear in tons of unrelated
// queries ("app", "web", "cost"...). Specific technical single words (python,
// flutter, xss, hipaa...) are NOT in this list and score high enough alone.
const GENERIC_SINGLE_WORDS = new Set([
  'app', 'apps', 'web', 'the', 'for', 'are', 'you', 'how', 'can', 'why',
  'who', 'not', 'yes', 'new', 'old', 'get', 'use', 'course', 'courses',
  'price', 'cost', 'service', 'services', 'help', 'need', 'good', 'best'
]);

function searchKnowledgeBase(rawQuery, threshold = 4) {
  const query = normalizeText(rawQuery);
  if (!query) return null;
  // Pad with spaces so phrase matching only ever hits whole words — without
  // this, a substring check would wrongly match short keywords like "ml"
  // inside unrelated words like "html", or "ai" inside "said"/"again".
  const paddedQuery = ` ${query} `;

  let best = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const nkw = normalizeText(kw);
      if (!nkw) continue;
      const paddedKw = ` ${nkw} `;

      if (query === nkw) {
        score += 12; // exact match to a known phrase — very strong signal
      } else if (paddedQuery.includes(paddedKw)) {
        const wordCount = nkw.split(' ').length;
        if (wordCount >= 2) {
          // multi-word phrase match — strong signal, weighted by length
          score += 5 * wordCount;
        } else {
          // single-word match — only a strong signal if it's a specific,
          // unambiguous technical term rather than a generic English word
          score += GENERIC_SINGLE_WORDS.has(nkw) ? 1 : 4;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= threshold ? best : null;
}

function getCategoryList() {
  return [...new Set(KNOWLEDGE_BASE.map(e => e.category))];
}

module.exports = { KNOWLEDGE_BASE, searchKnowledgeBase, getCategoryList };
