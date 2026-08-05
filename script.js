// ── 🛡️ CLIENT UTILITIES ──
// Initialize safe global helper for AI Chat Window toggle
window.toggleAiChatWindow = function(show) {
  const aiChatWin = document.getElementById('aiChatWindow');
  const aiInput = document.getElementById('aiChatInput');
  if (!aiChatWin) return;
  if (show === true) {
    aiChatWin.classList.add('active');
  } else if (show === false) {
    aiChatWin.classList.remove('active');
  } else {
    aiChatWin.classList.toggle('active');
  }
  if (aiChatWin.classList.contains('active') && aiInput) {
    aiInput.focus();
  }
};


document.addEventListener('DOMContentLoaded', () => {
  // ── 🚀 2070 AI OPERATING SYSTEM PREMIUM INITIALIZATION ──

  // 1. Procedural Theme Calibrator & Time-of-Day Adaptation
  const hour = new Date().getHours();
  let currentThemeIndex = 0; // Default Gold Obsidian
  let timeOfDayTheme = "Gold Obsidian";

  // Pick procedural starting theme based on Time of Day
  if (hour >= 5 && hour < 8) {
    currentThemeIndex = 2; // Cosmic Violet (Dawn)
    timeOfDayTheme = "Cosmic Violet";
  } else if (hour >= 8 && hour < 17) {
    currentThemeIndex = 1; // Cyber Cyan (Day)
    timeOfDayTheme = "Cyber Cyan";
  } else if (hour >= 17 && hour < 20) {
    currentThemeIndex = 4; // Ruby Amber (Sunset)
    timeOfDayTheme = "Ruby Amber";
  } else {
    currentThemeIndex = 3; // Emerald Matrix (Night)
    timeOfDayTheme = "Emerald Matrix";
  }

  // Inject dynamic morphing aurora background elements
  const auroraMesh = document.createElement('div');
  auroraMesh.className = 'aurora-bg-mesh';
  auroraMesh.innerHTML = `
    <div class="aurora-orb aurora-orb-1"></div>
    <div class="aurora-orb aurora-orb-2"></div>
    <div class="aurora-orb aurora-orb-3"></div>
  `;
  document.body.prepend(auroraMesh);

  // 2. Returning Visitor Signature Engine
  let visits = parseInt(localStorage.getItem('apps_gravity_visits') || '0');
  visits++;
  localStorage.setItem('apps_gravity_visits', visits);
  const isReturning = visits > 1;

  // Custom greeting if returning
  const aiChatMessages = document.getElementById('aiChatMessages');
  if (aiChatMessages && isReturning) {
    aiChatMessages.innerHTML = `
      <div class="chat-msg bot">
        <div class="msg-bubble">
          🟢 <strong>NEURAL SYNC SECURE</strong><br>
          Welcome back, User [ID: AG-2070-${Math.floor(Math.random() * 8999) + 1000}]. Neural link established on visit #${visits}. I am <strong>GravityBot AI</strong>. How can I assist you with App/Web development, free video courses, or project quotes today?
        </div>
      </div>
    `;
  }

  // 3. Cinematic Boot Sequence Loader Screen
  const bootOverlay = document.getElementById('aiBootSequence');
  const bootLogsContainer = document.getElementById('bootLogs');
  const bootProgressFill = document.getElementById('bootProgressFill');

  const bootLogs = [
    { text: "⚡ INITIALIZING APPS_GRAVITY_OS CORE...", isSuccess: true },
    { text: "🛰️ LINKED TO HASSAN CORE GATEWAY SERVER", isSuccess: true },
    { text: "🧬 NEURAL RECEPTORS CALIBRATING TO v2070.4...", isSuccess: true },
    { text: isReturning ? `🟢 VISITOR RE-AUTHENTICATED // SECURE VISIT #${visits}` : "🟢 DETECTING VISITOR SIGNATURE... NEW NODE DETECTED", isSuccess: !isReturning },
    { text: "🗄️ PARSING EMBEDDED KNOWLEDGE BASE [150+ TOPICS]...", isSuccess: true },
    { text: `🎨 CHROME SPECTRUM SYNCED: ${timeOfDayTheme.toUpperCase()}`, isSuccess: true },
    { text: "🔒 ENCRYPTING CLIENT ROUTE HANDLERS [CSRF OK]...", isSuccess: true },
    { text: "✨ ALL QUANTUM SYSTEMS ONLINE. BOOT COMPLETED.", isSuccess: true }
  ];

  if (bootOverlay && bootLogsContainer && bootProgressFill) {
    // If returning visitor, speed up boot sequence significantly (10x faster) to maintain speed
    const stepDelay = isReturning ? 60 : 350;
    let logIndex = 0;

    function runBootStep() {
      if (logIndex < bootLogs.length) {
        const log = bootLogs[logIndex];
        const line = document.createElement('div');
        line.className = `boot-log-line ${log.isSuccess ? 'success' : 'warn'}`;
        line.innerHTML = `<span>[${new Date().toLocaleTimeString().split(' ')[0]}]</span> <span>${log.text}</span>`;
        bootLogsContainer.appendChild(line);
        bootLogsContainer.scrollTop = bootLogsContainer.scrollHeight;

        // Progress percentage
        const progress = Math.round(((logIndex + 1) / bootLogs.length) * 100);
        bootProgressFill.style.width = `${progress}%`;

        logIndex++;
        setTimeout(runBootStep, stepDelay);
      } else {
        // Complete, fade out overlay
        setTimeout(() => {
          bootOverlay.style.opacity = '0';
          setTimeout(() => {
            bootOverlay.style.display = 'none';
          }, 800);
        }, isReturning ? 150 : 500);
      }
    }
    setTimeout(runBootStep, 100);
  }

  // Update Status HUD labels
  const hudThemeLabel = document.getElementById('hudThemeLabel');
  if (hudThemeLabel) hudThemeLabel.innerText = timeOfDayTheme.toUpperCase();

  // 4. Command Palette Logic
  const commandPalette = document.getElementById('commandPalette');
  const paletteInput = document.getElementById('paletteInput');
  const paletteResults = document.getElementById('paletteResults');
  const hudCmdPaletteTrigger = document.getElementById('hudCmdPaletteTrigger');

  const commands = [
    { label: "💬 Ask GravityBot AI Assistant", action: () => window.toggleAiChatWindow(true), icon: "🤖" },
    { label: "💰 Calculate Instant Project Quote", action: () => document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' }), icon: "🧮" },
    { label: "📚 Explore Free Video Courses", action: () => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }), icon: "🎓" },
    { label: "🎨 Toggle OS Visual Theme", action: () => document.getElementById('themeToggleBtn')?.click(), icon: "🔮" },
    { label: "⚙️ Run Neural Network Diagnostics", action: () => runDiagnostics(), icon: "🔌" },
    { label: "🌀 Toggle Performance Low-Motion Mode", action: () => toggleLowMotion(), icon: "🚀" },
    { label: "⭐ Post Client Review or Feedback", action: () => document.getElementById('openReviewModalBtn')?.click(), icon: "📝" },
    { label: "✉️ Send Message to Hassan Directly", action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), icon: "📬" },
    { label: "📱 Preview Featured Pak Advisory App", action: () => document.getElementById('openPakModalBtn')?.click(), icon: "📱" },
    { label: "⬆️ Scroll to Top of System Screen", action: () => window.scrollTo({ top: 0, behavior: 'smooth' }), icon: "⬆️" }
  ];

  let selectedPaletteIndex = 0;

  function toggleCommandPalette(forceState) {
    if (!commandPalette) return;
    const isShowing = commandPalette.classList.contains('active');
    const nextState = forceState !== undefined ? forceState : !isShowing;

    if (nextState) {
      commandPalette.classList.add('active');
      commandPalette.setAttribute('aria-hidden', 'false');
      if (paletteInput) {
        paletteInput.value = '';
        paletteInput.focus();
      }
      renderPaletteResults('');
    } else {
      commandPalette.classList.remove('active');
      commandPalette.setAttribute('aria-hidden', 'true');
    }
  }

  function renderPaletteResults(query) {
    if (!paletteResults) return;
    paletteResults.innerHTML = '';
    const cleanQuery = query.toLowerCase().trim();

    const filtered = commands.filter(cmd => 
      cmd.label.toLowerCase().includes(cleanQuery)
    );

    if (filtered.length === 0) {
      paletteResults.innerHTML = `<div style="color: var(--text-muted); padding: 1.5rem; text-align: center;">No compatible neural commands found. Try 'Ask AI' or 'Theme'.</div>`;
      return;
    }

    selectedPaletteIndex = Math.min(selectedPaletteIndex, filtered.length - 1);

    filtered.forEach((cmd, idx) => {
      const item = document.createElement('div');
      item.className = `palette-item ${idx === selectedPaletteIndex ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="palette-item-left">
          <span class="palette-item-icon">${cmd.icon}</span>
          <span>${cmd.label}</span>
        </div>
        <span class="palette-item-action">EXECUTE</span>
      `;
      item.addEventListener('click', () => {
        cmd.action();
        toggleCommandPalette(false);
      });
      paletteResults.appendChild(item);
    });
  }

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    if (e.key === 'Escape' && commandPalette && commandPalette.classList.contains('active')) {
      toggleCommandPalette(false);
    }
  });

  if (hudCmdPaletteTrigger) {
    hudCmdPaletteTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCommandPalette(true);
    });
  }

  if (paletteInput) {
    paletteInput.addEventListener('input', (e) => {
      selectedPaletteIndex = 0;
      renderPaletteResults(e.target.value);
    });

    paletteInput.addEventListener('keydown', (e) => {
      const activeItems = paletteResults.querySelectorAll('.palette-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex + 1) % activeItems.length;
        renderPaletteResults(paletteInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex - 1 + activeItems.length) % activeItems.length;
        renderPaletteResults(paletteInput.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = activeItems[selectedPaletteIndex];
        if (activeItem) activeItem.click();
      }
    });
  }

  // Interactive OS Diagnostics trigger
  function runDiagnostics() {
    toggleCommandPalette(false);
    window.toggleAiChatWindow(true);
    const msgs = document.getElementById('aiChatMessages');
    if (!msgs) return;

    // Output cool diagnosis log
    const line = document.createElement('div');
    line.className = 'chat-msg bot';
    line.innerHTML = `
      <div class="msg-bubble" style="font-family: monospace; border: 1px solid var(--gold-primary); background: rgba(0,0,0,0.4); line-height: 1.5;">
        <span style="color: var(--gold-primary); font-weight: bold;">⚡ SYSTEM RUNTIME DIAGNOSTICS [OK]</span><br>
        ------------------------------------<br>
        • OPERATING SYSTEM: v2070.4.AI<br>
        • KNOWLEDGE LINK: 100% ONLINE<br>
        • ANOMALIES DETECTED: 0.00%<br>
        • CORE CODES: FULLY HARDENED<br>
        • RENDER PIPELINE: GPU COMPATIBLE<br>
        • CURRENT THEME: ${timeOfDayTheme.toUpperCase()}<br>
        ------------------------------------<br>
        STATUS: apps-gravity core is operating at maximum capacity. Ready for new projects.
      </div>
    `;
    msgs.appendChild(line);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Toggle Low-Motion Mode
  function toggleLowMotion() {
    document.body.classList.toggle('low-motion-active');
    const isActive = document.body.classList.contains('low-motion-active');
    showNotification(isActive ? "Low-Motion Mode Enabled" : "High-Performance Visuals Restored");
  }

  function showNotification(msg) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'admin-toast show';
    alertDiv.style.background = 'var(--gold-primary)';
    alertDiv.style.color = '#000';
    alertDiv.style.zIndex = '99999';
    alertDiv.innerText = `💡 ${msg}`;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      setTimeout(() => alertDiv.remove(), 400);
    }, 2500);
  }

  // Close palette on outer click
  window.addEventListener('click', (e) => {
    if (commandPalette && e.target === commandPalette) {
      toggleCommandPalette(false);
    }
  });

  // 5. Magnetic CTA Button Physics
  const magneticCTAs = document.querySelectorAll('.btn-primary, .btn-outline, .btn-gold-outline, .nav-theme-btn');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    magneticCTAs.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const bound = btn.getBoundingClientRect();
        const btnX = bound.left + bound.width / 2;
        const btnY = bound.top + bound.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const distanceX = mouseX - btnX;
        const distanceY = mouseY - btnY;

        // Displace the button slightly towards the cursor (magnetic feel)
        btn.style.transform = `translate(${distanceX * 0.2}px, ${distanceY * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // 6. Interactive Cursor click ripples
  window.addEventListener('mousedown', (e) => {
    if (document.body.classList.contains('low-motion-active')) return;
    const ripple = document.createElement('div');
    ripple.className = 'particle-ripple';
    ripple.style.left = `${e.clientX + window.scrollX}px`;
    ripple.style.top = `${e.clientY + window.scrollY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // 7. Glass card perspective tilt (3D cards)
  const tiltCards = document.querySelectorAll('.skill-card, .project-card, .course-card, .review-card, .estimator-card');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('low-motion-active')) return;
        const bound = card.getBoundingClientRect();
        const cardX = bound.left + bound.width / 2;
        const cardY = bound.top + bound.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const degreeX = (cardY - mouseY) / (bound.height / 2) * 8; // Max 8 degrees tilt
        const degreeY = (mouseX - cardX) / (bound.width / 2) * 8;

        card.style.transform = `perspective(1000px) rotateX(${degreeX}deg) rotateY(${degreeY}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // ── 🛡️ GLOBAL CSRF TOKEN RETRIEVAL ──
  let csrfToken = '';
  async function fetchCSRFToken() {
    try {
      const res = await fetch('/api/csrf-token');
      const data = await res.json();
      if (data.success) {
        csrfToken = data.csrfToken;
      }
    } catch (err) {
      console.warn("CSRF token fetch notice (static mode):", err);
    }
  }
  fetchCSRFToken();

  // ── Analytics: track page view ──
  fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: window.location.pathname || '/' })
  }).catch(() => {});

  // ── Load site settings from admin dashboard ──
  async function applySiteSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (!data.success || !data.settings) return;
      const s = data.settings;
      if (s.seoTitle) document.title = s.seoTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && s.seoDescription) metaDesc.content = s.seoDescription;
      const metaKeys = document.querySelector('meta[name="keywords"]');
      if (metaKeys && s.seoKeywords) metaKeys.content = s.seoKeywords;
      const line1 = document.querySelector('.hero-title .line-1');
      const line2 = document.querySelector('.hero-title .line-2');
      if (line1 && s.heroLine1) line1.textContent = s.heroLine1;
      if (line2 && s.heroLine2) line2.textContent = s.heroLine2;
      const heroSub = document.querySelector('.hero-subtitle');
      if (heroSub && s.heroSubtitle) {
        heroSub.innerHTML = s.heroSubtitle
          .replace(/Hassan/g, `<strong class="gold">${s.founderName || 'Hassan'}</strong>`)
          .replace(/Apps Gravity/g, '<strong class="gold">Apps Gravity</strong>');
      }
      const emailLink = document.getElementById('emailLink');
      if (emailLink && s.contactEmail) {
        emailLink.href = `mailto:${s.contactEmail}`;
        const emailText = emailLink.querySelector('.contact-text span:last-child');
        if (emailText) emailText.textContent = s.contactEmail;
      }
      const githubLink = document.getElementById('githubLink');
      if (githubLink && s.githubUrl) githubLink.href = s.githubUrl;
      const logoImg = document.querySelector('.logo-img');
      if (logoImg && s.logoUrl) logoImg.src = s.logoUrl;
    } catch (err) { /* settings optional */ }
  }
  applySiteSettings();

  // ── CURSOR GLOW & DOT ──
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');

  if (cursorGlow && cursorDot) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
    });
  }

  // ── PARTICLE CANVAS BACKGROUND ──
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 40;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = `rgba(201, 168, 76, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      if (document.body.classList.contains('low-motion-active') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTimeout(animateParticles, 1000); // Check again in 1 second, pausing 60fps loop
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ── NAVBAR SCROLL & ACTIVE LINK ──
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === currentSection) {
        link.classList.add('active');
      }
    });
  });


  // ── STAT COUNTERS ANIMATION ──
  const stats = document.querySelectorAll('.stat-num');
  let hasCounted = false;

  function countUpStats() {
    const heroSection = document.getElementById('home');
    if (!heroSection) return;
    const heroPos = heroSection.getBoundingClientRect();

    if (heroPos.top < window.innerHeight && !hasCounted) {
      hasCounted = true;
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        let count = 0;
        const increment = Math.max(1, Math.ceil(target / 30));
        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            stat.innerText = target;
            clearInterval(timer);
          } else {
            stat.innerText = count;
          }
        }, 50);
      });
    }
  }
  countUpStats();
  window.addEventListener('scroll', countUpStats);

  // ── SKILL BARS FILL ON SCROLL ──
  const skillFills = document.querySelectorAll('.skill-fill');
  let hasFilledSkills = false;

  function animateSkills() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;
    const pos = skillsSection.getBoundingClientRect();

    if (pos.top < window.innerHeight - 100 && !hasFilledSkills) {
      hasFilledSkills = true;
      skillFills.forEach(fill => {
        const targetWidth = fill.getAttribute('data-width');
        fill.style.width = `${targetWidth}%`;
      });
    }
  }
  window.addEventListener('scroll', animateSkills);
  animateSkills();

  // ── 🤖 AI CHATBOT ENGINE LOGIC ──
  const aiWidgetTrigger = document.getElementById('aiWidgetTrigger');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const closeAiChatBtn = document.getElementById('closeAiChatBtn');
  const heroChatTriggerBtn = document.getElementById('heroChatTriggerBtn');
  // Reuse outer-declared aiChatMessages
  const aiChatInput = document.getElementById('aiChatInput');
  const sendAiChatBtn = document.getElementById('sendAiChatBtn');
  const quickChips = document.querySelectorAll('.quick-chip');

  // (window.toggleAiChatWindow is already defined once above, at the top of this
  // file, so it's available immediately — no need to redefine it here.)

  if (aiWidgetTrigger) {
    aiWidgetTrigger.addEventListener('click', () => window.toggleAiChatWindow());
  }

  if (closeAiChatBtn) {
    closeAiChatBtn.addEventListener('click', () => window.toggleAiChatWindow(false));
  }

  if (heroChatTriggerBtn) {
    heroChatTriggerBtn.addEventListener('click', () => window.toggleAiChatWindow(true));
  }

  function appendChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;

    // FIX: previously this built the message HTML by running markdown replacements
    // directly on the raw text and dropping the result into innerHTML. Most bot
    // replies are hardcoded, but some can include externally-sourced text (e.g. a
    // Wikipedia summary) or, in theory, malformed user text — inserting any of that
    // as raw HTML is a real XSS vector. Escaping HTML special characters FIRST,
    // then applying the **bold** / [link](url) / newline formatting on top of the
    // escaped text, closes that off while keeping the same visual formatting.
    const escapeHtml = (str) => str.replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

    let formattedText = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, (match, label, url) => {
        // Only allow http(s) links through as real anchors — anything else
        // (javascript:, data:, etc.) renders as plain escaped text instead.
        if (/^https?:\/\//i.test(url)) {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        }
        return match;
      })
      .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `<div class="msg-bubble">${formattedText}</div>`;
    aiChatMessages.appendChild(msgDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  async function handleUserChatSubmit(userText) {
    const text = userText || aiChatInput.value.trim();
    if (!text) return;

    appendChatMessage('user', text);
    if (!userText) aiChatInput.value = '';

    // Show typing bubble
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot';
    typingDiv.innerHTML = `<div class="msg-bubble"><em>GravityBot is thinking...</em></div>`;
    aiChatMessages.appendChild(typingDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      aiChatMessages.removeChild(typingDiv);

      if (data.success && data.reply) {
        appendChatMessage('bot', data.reply.text);
      } else {
        const localReply = getLocalFallbackChatReply(text);
        appendChatMessage('bot', localReply);
      }
    } catch (err) {
      if (typingDiv.parentNode) aiChatMessages.removeChild(typingDiv);
      // Smart Local Fallback Response Engine
      const localReply = getLocalFallbackChatReply(text);
      appendChatMessage('bot', localReply);
    }
  }

  // FIX: matches the same word-boundary-safety fix applied server-side — plain
  // .includes('app') / .includes('rate') / .includes('cost') false-match inside
  // ordinary words like "happy", "generate", or "costume".
  function containsWord(haystack, phrase) {
    return ` ${haystack} `.includes(` ${phrase} `);
  }

  function getLocalFallbackChatReply(msgText) {
    const rawMsg = msgText || '';
    const msg = rawMsg.toLowerCase().trim();

    if (/^(hi|hello|hey|heyy|salam|aoa|good morning|good afternoon|good evening|yo|sup|greetings)\b/i.test(msg)) {
      return "👋 **Hello and welcome!** I'm **GravityBot AI**, virtual assistant for **Apps Gravity**, founded by **Hassan**.\n\nHow can I help you today?\n• 🎓 **Free Medical Billing Video Course**\n• 📱 **Mobile App Dev (Pak Advisory App)**\n• 🌐 **Web Development & Cost Estimates**\n• 📬 **Contact Hassan directly**";
    }
    if (msg.includes('how are you') || msg.includes('how r u') || msg.includes('how do you do')) {
      return "😊 I'm doing great and ready to help! How can I assist you with Apps Gravity services or our free Medical Billing Course today?";
    }
    if (msg.includes('who are you') || msg.includes('what are you') || msg.includes('who created you') || msg.includes('who made you')) {
      return "🤖 I am **GravityBot AI**, an intelligent virtual assistant built by **Hassan** (Founder of Apps Gravity) to help visitors explore app/web dev services and access free video courses!";
    }
    if (msg.includes('tell me a joke') || msg.includes('joke')) {
      return "😄 Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛✨ How can Hassan help build your next project today?";
    }
    if (msg.includes('thank') || msg.includes('thanks') || msg.includes('awesome') || msg.includes('great')) {
      return "🌟 You're very welcome! Feel free to ask any more questions about our courses, mobile app development, or website quotes!";
    }
    if (msg.includes('medical billing') || msg.includes('billing course') || msg.includes('drive link') || msg.includes('drive folder') || msg.includes('google drive') || msg.includes('watch course') || msg.includes('download course')) {
      return "🎓 **Medical Billing Complete Video Course** is 100% free!\n\nYou can stream or download all video lessons on Google Drive:\n\n👉 [Access Secure Google Drive Folder](https://drive.google.com/drive/folders/1sA2HPCr4jU8fH8aNAdogDor22VKgA96I?usp=drive_link)\n\nCovers claim submission, ICD-10 & CPT coding, and revenue cycle management!";
    }
    if (msg.includes('what is medical billing') || msg.includes('cpt') || msg.includes('icd') || msg.includes('rcm')) {
      return "💡 **Medical Billing Essentials:**\n\n• **ICD-10**: Diagnosis codes\n• **CPT**: Procedure codes\n• **RCM**: Revenue Cycle Management\n\nLearn all of this step-by-step in Hassan's free Google Drive video course!";
    }
    if (msg.includes('is it free') || msg.includes('course cost') || msg.includes('course fee')) {
      return "🎁 Yes! The **Medical Billing Video Course** is **100% FREE** with no fees or hidden costs.";
    }
    if (msg.includes('pak advisory') || containsWord(msg, 'app') || containsWord(msg, 'apps') || msg.includes('mobile') || msg.includes('android') || msg.includes('ios') || msg.includes('flutter')) {
      return "📱 **Pak Advisory App** is our featured mobile platform built for Pakistan. Need a custom mobile app for iOS/Android? Scroll to our **Project Estimator** or reach Hassan directly!";
    }
    if (msg.includes('web') || msg.includes('website') || msg.includes('full stack') || msg.includes('frontend') || msg.includes('backend')) {
      return "🌐 We build luxury full-stack websites and web apps! Scroll to our interactive **Project Estimator** section on the site for an instant quote!";
    }
    if (msg.includes('price') || containsWord(msg, 'cost') || msg.includes('estimate') || msg.includes('quote') || containsWord(msg, 'rate') || msg.includes('how much')) {
      return "💰 Prices start around ~$499 for Web Apps and ~$799 for Mobile Apps. Use our interactive **Project Estimator** on the page to calculate exact costs!";
    }
    if (msg.includes('hassan') || msg.includes('contact') || msg.includes('email') || msg.includes('reach') || msg.includes('hire') || msg.includes('location')) {
      return "📬 Reach **Hassan** (Founder of Apps Gravity) directly:\n\n• **Email**: mahadhassanlal@gmail.com\n• **GitHub**: [@mahad1117a](https://github.com/mahad1117a)\n\nOr scroll to the contact form on this page!";
    }
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(rawMsg)}`;
    return `🔎 That's outside my local knowledge base right now — here's a direct search instead:\n\n[Search "${rawMsg}" on Google](${googleUrl})\n\nOr ask me about Hassan's **Free Medical Billing Video Course**, **Pak Advisory App**, or **App/Web Development**!`;
  }

  if (sendAiChatBtn) {
    sendAiChatBtn.addEventListener('click', () => handleUserChatSubmit());
  }

  if (aiChatInput) {
    aiChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserChatSubmit();
    });
  }

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      handleUserChatSubmit(prompt);
    });
  });

  // ── COURSES HUB & FILTER SYSTEM ──
  let coursesCatalogData = [
    {
      id: "medical-billing",
      title: "Medical Billing Complete Video Course",
      category: "medical",
      badge: "🔥 Free Full Video Course",
      meta: "Full Video Lessons • Google Drive Access",
      desc: "Comprehensive Medical Billing video course hosted on Google Drive. Covers claim submission, ICD-10 & CPT coding, revenue cycle management (RCM), and practical billing workflows.",
      driveUrl: "https://drive.google.com/drive/folders/1sA2HPCr4jU8fH8aNAdogDor22VKgA96I?usp=drive_link",
      secureAccessRequired: true,
      features: ["🔒 End-to-End Secure Access", "Hosted on Google Drive", "100% Free Full Lessons", "ICD/CPT & RCM Modules"]
    },
    {
      id: "data-analytics-bi",
      title: "Data Analytics and Business Intelligence",
      category: "analytics",
      badge: "🆕 New • Free Full Video Course",
      meta: "178 Video Lessons • Videos & Files Included",
      desc: "A complete, ground-up Data Analytics & Business Intelligence course. Covers analytics fundamentals, BI tools and techniques, and real-world project workflows across 178 video lessons.",
      pageUrl: "data-analytics-course.html",
      features: ["📹 178 Video Lessons", "📂 Downloadable Course Files", "🔎 Searchable Lesson List", "💡 100% Free Access"]
    }
  ];

  const coursesGridContainer = document.getElementById('coursesGridContainer');
  const courseSearchInput = document.getElementById('courseSearchInput');
  const filterChips = document.querySelectorAll('.filter-chip');

  let activeFilter = 'all';

  async function handleSecureCourseAccess(courseId, fallbackUrl) {
    try {
      const res = await fetch(`/api/courses/access/${courseId}`);
      const data = await res.json();
      if (data.success && data.accessUrl) {
        window.open(data.accessUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  }

  function renderCourses() {
    if (!coursesGridContainer) return;
    const searchTerm = (courseSearchInput ? courseSearchInput.value : '').toLowerCase();

    coursesGridContainer.innerHTML = '';

    const filtered = coursesCatalogData.filter(course => {
      const matchesCategory = activeFilter === 'all' || course.category === activeFilter;
      const matchesSearch = course.title.toLowerCase().includes(searchTerm) || 
                            course.desc.toLowerCase().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      coursesGridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">
          <p>No courses found matching your criteria. Click below to request a course!</p>
          <button class="btn btn-outline sm" style="margin-top: 1rem;" id="notFoundReqBtn">Request a Course</button>
        </div>
      `;
      const notFoundBtn = document.getElementById('notFoundReqBtn');
      if (notFoundBtn) {
        notFoundBtn.addEventListener('click', () => {
          const courseReqModal = document.getElementById('courseReqModal');
          if (courseReqModal) courseReqModal.classList.add('active');
        });
      }
      return;
    }

    filtered.forEach(course => {
      const card = document.createElement('div');
      card.className = `course-card ${(course.category === 'medical' || course.category === 'analytics') ? 'featured-course' : ''}`;
      card.setAttribute('data-aos', 'fade-up');

      const featuresHtml = course.features.map(f => `<div class="c-feat">${f}</div>`).join('');

      // Courses hosted on an internal page (e.g. the Data Analytics course with its own
      // Videos/Files page) get a "Start Course" link instead of the Google Drive button.
      let actionButtonHtml = course.pageUrl
        ? `
        <a href="${course.pageUrl}" class="btn btn-primary full" style="justify-content: center; text-decoration: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>▶ Start Course</span>
        </a>
        <small class="drive-note">📚 Videos Tab &amp; Files Tab • Updated as new lessons are added</small>
      `
        : `
        <a href="${course.driveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary full" style="justify-content: center; text-decoration: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>▶ Watch Video Course on Google Drive</span>
        </a>
        <small class="drive-note">🔒 Verified Direct Google Drive Access • Stream &amp; Download Videos</small>
      `;

      card.innerHTML = `
        <div class="course-badge">${course.badge}</div>
        <div class="course-header">
          <div class="course-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div class="course-title-area">
            <h3>${course.title}</h3>
            <span class="course-meta">${course.meta}</span>
          </div>
        </div>
        <p class="course-desc">${course.desc}</p>
        <div class="course-features">${featuresHtml}</div>
        <div class="course-footer">
          ${actionButtonHtml}
        </div>
      `;
      coursesGridContainer.appendChild(card);
    });
  }

  if (courseSearchInput) {
    courseSearchInput.addEventListener('input', renderCourses);
  }

  async function loadCoursesFromAPI() {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
        coursesCatalogData = data.courses;
        renderCourses();
      }
    } catch (err) {
      // Fallback to static catalog if offline
    }
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter');
      renderCourses();
    });
  });

  renderCourses();
  loadCoursesFromAPI();

  // ── 🎨 DYNAMIC AI THEME SWITCHER ENGINE (INTEGRATED WITH 2070 OS) ──
  const themes = [
    { id: 'gold', name: 'Gold Obsidian' },
    { id: 'cyan', name: 'Cyber Cyan' },
    { id: 'violet', name: 'Cosmic Violet' },
    { id: 'emerald', name: 'Emerald Matrix' },
    { id: 'ruby', name: 'Ruby Amber' }
  ];

  function applyTheme(index) {
    const theme = themes[index];
    document.body.setAttribute('data-theme', theme.id);
    const themeLabel = document.getElementById('themeNameLabel');
    if (themeLabel) themeLabel.innerText = theme.name;

    // Synchronize with bottom HUD system status label
    const hudThemeLabelEl = document.getElementById('hudThemeLabel');
    if (hudThemeLabelEl) hudThemeLabelEl.innerText = theme.name.toUpperCase();
  }

  // Use the computed currentThemeIndex from our time-of-day OS initialization above
  applyTheme(currentThemeIndex);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      applyTheme(currentThemeIndex);
    });
  }

  // ── ⭐ REVIEWS SYSTEM ──
  // Static seed reviews shown immediately (and used as a fallback if the API call
  // below fails) so the section is never empty while data loads.
  let currentReviews = [
    { name: "Usman Tariq", role: "Startup Founder", rating: 5, comment: "Hassan built our mobile app from scratch. Phenomenal work, sleek UI, and super fast delivery!" },
    { name: "Dr. Ayesha Malik", role: "Healthcare Professional", rating: 5, comment: "The Medical Billing Video Course hosted on Google Drive was a lifesaver. Clear, thorough, and 100% free!" },
    { name: "Bilal Ahmad", role: "E-Commerce Director", rating: 5, comment: "Apps Gravity transformed our online store with custom web dev. Highly recommended!" }
  ];

  const reviewsGrid = document.getElementById('reviewsGrid');

  // FIX: review name/role/comment were previously interpolated directly into
  // innerHTML unescaped. The backend does sanitize what it stores, but the
  // locally-added review (added the instant you submit, before any reload)
  // used the raw un-escaped form values — so typing HTML into the review form
  // would execute immediately in your own browser. Escaping here closes that.
  const escapeHtml = (str) => String(str || '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function renderReviews(reviewsArray) {
    if (!reviewsGrid) return;
    reviewsGrid.innerHTML = '';

    reviewsArray.forEach(rev => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const stars = '⭐'.repeat(rev.rating || 5);
      card.innerHTML = `
        <div class="review-stars">${stars}</div>
        <p class="review-comment">"${escapeHtml(rev.comment)}"</p>
        <div class="review-author">
          <strong>${escapeHtml(rev.name)}</strong>
          <small>${escapeHtml(rev.role || 'Client / Visitor')}</small>
        </div>
      `;
      reviewsGrid.appendChild(card);
    });
  }

  renderReviews(currentReviews);

  // FIX: previously reviews were only ever rendered from a hardcoded local array —
  // a submitted review appeared for the person who submitted it, in that browser
  // session only, and vanished on refresh. It never actually reached other
  // visitors even though the backend was already storing it via POST /api/reviews.
  // Loading the real list here is what makes the review system actually shared.
  async function loadReviewsFromAPI() {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
        currentReviews = data.reviews;
        renderReviews(currentReviews);
      }
    } catch (err) {
      // Keep showing the static seed reviews if the API is unreachable.
    }
  }
  loadReviewsFromAPI();

  // ── 🧮 PROJECT ESTIMATOR — wired to the existing /api/quote backend endpoint ──
  const estimatorForm = document.getElementById('estimatorForm');
  const resultPriceValue = document.getElementById('resultPriceValue');
  const resultTimeValue = document.getElementById('resultTimeValue');
  const resultFeaturesList = document.getElementById('resultFeaturesList');
  const estimatorContactBtn = document.getElementById('estimatorContactBtn');

  const FEATURE_LABELS = {
    auth: '🔐 User Authentication',
    payments: '💳 Payments Integration',
    ai_chatbot: '🤖 AI Chatbot Assistant',
    admin_panel: '🛠️ Admin Panel'
  };

  // Client-side estimate shown instantly on load and while typing, so the panel
  // never feels stuck at the default — the authoritative number always comes
  // from the server on submit, this is just a live preview.
  function computeLocalEstimate() {
    const projectType = (estimatorForm.querySelector('input[name="projectType"]:checked') || {}).value || 'web';
    const features = Array.from(estimatorForm.querySelectorAll('input[name="feature"]:checked')).map(el => el.value);

    let basePrice = 499, weeks = 2;
    if (projectType === 'mobile') { basePrice = 799; weeks = 3; }
    else if (projectType === 'fullstack') { basePrice = 1199; weeks = 4; }

    let featuresCost = 0;
    if (features.includes('auth')) { featuresCost += 150; weeks += 0.5; }
    if (features.includes('payments')) { featuresCost += 200; weeks += 0.5; }
    if (features.includes('ai_chatbot')) { featuresCost += 250; weeks += 1; }
    if (features.includes('admin_panel')) { featuresCost += 300; weeks += 1; }

    return { total: basePrice + featuresCost, weeks: Math.ceil(weeks), features };
  }

  function renderEstimate({ total, weeks, features }) {
    if (resultPriceValue) resultPriceValue.textContent = total;
    if (resultTimeValue) resultTimeValue.textContent = `~${weeks} week${weeks === 1 ? '' : 's'} turnaround`;
    if (resultFeaturesList) {
      resultFeaturesList.innerHTML = features.length
        ? features.map(f => `<li>${FEATURE_LABELS[f] || f}</li>`).join('')
        : '<li>Base package — no add-ons selected</li>';
    }
  }

  // Keep the visual "selected" state on radio-cards in sync with the actual input
  function syncRadioCardSelection(container) {
    if (!container) return;
    container.querySelectorAll('.radio-card').forEach(card => {
      const input = card.querySelector('input[type="radio"]');
      card.classList.toggle('selected', !!(input && input.checked));
    });
  }

  if (estimatorForm) {
    const projectTypeCards = document.getElementById('projectTypeCards');
    const platformCards = document.getElementById('platformCards');

    renderEstimate(computeLocalEstimate());

    estimatorForm.addEventListener('change', () => {
      syncRadioCardSelection(projectTypeCards);
      syncRadioCardSelection(platformCards);
      renderEstimate(computeLocalEstimate());
    });

    estimatorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const projectType = (estimatorForm.querySelector('input[name="projectType"]:checked') || {}).value || 'web';
      const platform = (estimatorForm.querySelector('input[name="platform"]:checked') || {}).value || 'cross-platform';
      const features = Array.from(estimatorForm.querySelectorAll('input[name="feature"]:checked')).map(el => el.value);
      const email = document.getElementById('estimatorEmail') ? document.getElementById('estimatorEmail').value : '';

      const submitBtn = document.getElementById('calculateEstimateBtn');
      const origLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span>Calculating...</span>'; }

      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ projectType, platform, features, email })
        });
        const data = await res.json();
        if (data.success) {
          renderEstimate({ total: data.estimatedCost, weeks: data.estimatedWeeks, features });
        } else {
          // Server validation failed (e.g. bad email) — keep the accurate local estimate visible
          renderEstimate(computeLocalEstimate());
        }
      } catch (err) {
        // Offline/network failure — the local estimate is still accurate and stays visible
        renderEstimate(computeLocalEstimate());
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origLabel; }
      }
    });
  }

  if (estimatorContactBtn) {
    estimatorContactBtn.addEventListener('click', () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ── MODAL TOGGLES ──
  const pakAdvisoryModal = document.getElementById('pakAdvisoryModal');
  const openPakModalBtn = document.getElementById('openPakModalBtn');
  const closePakModalBtn = document.getElementById('closePakModalBtn');
  const phoneMockupTrigger = document.getElementById('phoneMockupTrigger');

  function toggleModal(modalEl, show) {
    if (!modalEl) return;
    if (show) modalEl.classList.add('active');
    else modalEl.classList.remove('active');
  }

  if (openPakModalBtn) openPakModalBtn.addEventListener('click', () => toggleModal(pakAdvisoryModal, true));
  if (phoneMockupTrigger) phoneMockupTrigger.addEventListener('click', () => toggleModal(pakAdvisoryModal, true));
  if (closePakModalBtn) closePakModalBtn.addEventListener('click', () => toggleModal(pakAdvisoryModal, false));

  // Course Req Modal
  const courseReqModal = document.getElementById('courseReqModal');
  const openCourseReqModalBtn = document.getElementById('openCourseReqModalBtn');
  const closeCourseReqModalBtn = document.getElementById('closeCourseReqModalBtn');
  const courseReqForm = document.getElementById('courseReqForm');

  // Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const navLinksList = document.getElementById('navLinks');

  if (hamburger && navLinksList) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksList.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksList.classList.remove('active');
      });
    });
  }

  // Course Request Modal Handler
  if (openCourseReqModalBtn) openCourseReqModalBtn.addEventListener('click', () => toggleModal(courseReqModal, true));
  if (closeCourseReqModalBtn) closeCourseReqModalBtn.addEventListener('click', () => toggleModal(courseReqModal, false));

  if (courseReqForm) {
    courseReqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const topic = document.getElementById('reqCourseTopic').value;
      const email = document.getElementById('reqCourseEmail').value;
      const notes = document.getElementById('reqCourseNotes').value;

      try {
        await fetch('/api/courses/request', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({ courseTopic: topic, requesterEmail: email, notes })
        });
      } catch (err) {}

      alert(`✅ Thank you! Course request for "${topic}" submitted successfully.`);
      courseReqForm.reset();
      toggleModal(courseReqModal, false);
    });
  }

  // Review Modal
  const reviewModal = document.getElementById('reviewModal');
  const openReviewModalBtn = document.getElementById('openReviewModalBtn');
  const closeReviewModalBtn = document.getElementById('closeReviewModalBtn');
  const submitReviewForm = document.getElementById('submitReviewForm');

  if (openReviewModalBtn) openReviewModalBtn.addEventListener('click', () => toggleModal(reviewModal, true));
  if (closeReviewModalBtn) closeReviewModalBtn.addEventListener('click', () => toggleModal(reviewModal, false));

  if (submitReviewForm) {
    submitReviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reviewNameInput').value;
      const role = document.getElementById('reviewRoleInput').value;
      const rating = parseInt(document.getElementById('reviewRatingInput').value);
      const comment = document.getElementById('reviewCommentInput').value;

      const newRev = { name, role, rating, comment };

      // FIX: previously this always unshifted the raw, un-sanitized form values
      // (newRev) into the local list — even though the server had just sanitized
      // and stored its own version. Now the server's sanitized review is used
      // when the request succeeds, and the local echo is only a fallback for
      // when the network call itself fails (e.g. offline).
      let displayedReview = newRev;
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(newRev)
        });
        const data = await res.json();
        if (data.success && data.review) {
          displayedReview = data.review;
        }
      } catch (err) {
        // offline/network failure — still show the visitor their own review locally
      }

      currentReviews.unshift(displayedReview);
      renderReviews(currentReviews);

      submitReviewForm.reset();
      toggleModal(reviewModal, false);
      alert("✅ Thank you for your review!");
    });
  }

  // Close modals when clicking outside card
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });

  // ── CONTACT FORM — saves to admin dashboard + optional Web3Forms email ──
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const origText = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = 'Sending Message...';

      const name = contactForm.querySelector('[name="name"]')?.value || '';
      const email = contactForm.querySelector('[name="email"]')?.value || '';
      const service = contactForm.querySelector('[name="service"]')?.value || '';
      const message = contactForm.querySelector('[name="message"]')?.value || '';

      if (!csrfToken) await fetchCSRFToken();

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
          body: JSON.stringify({ name, email, service, message })
        });
        const data = await response.json();

        if (data.success) {
          contactForm.reset();
          if (formSuccess) {
            formSuccess.style.display = 'block';
            formSuccess.innerText = '✅ Message sent! Hassan will get back to you soon.';
            setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
          }
        } else {
          alert(data.error || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        alert('Network error. Please check your internet connection.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    });
  }
});

