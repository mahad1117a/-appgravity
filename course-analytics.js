// ══════════════════════════════════════════════════════════════
// Data Analytics & Business Intelligence — Course Page Logic
//
// TO ADD MORE LESSONS: just add another object to the COURSE_VIDEOS
// array below, in the same { title, youtubeId } shape. Order in this
// array = display order on the page. No other file needs to change.
//
// TO ADD FILES: add an object to COURSE_FILES with { name, url, meta }.
// ══════════════════════════════════════════════════════════════

const COURSE_VIDEOS = [
  { title: "What is Data Analytics & Business Intelligence?", youtubeId: "eY2SFn0WWAA" },
  { title: "About Instructor", youtubeId: "rqopfwvHzLA" },
  { title: "Who Should Enrol and Why it Matters?", youtubeId: "bnoJrWbuwas" },
  { title: "Common Challenges in Data Analytics Projects", youtubeId: "evmsLXYm9DM" },
  { title: "Course Roadmap - Tools, Techniques, and Outcomes", youtubeId: "Kam9M0tdrzQ" },
  { title: "Overview of Tools for Data Analytics and Business Intelligence", youtubeId: "OGi1qt7yi1w" },
  { title: "MS Excel and Its Importance", youtubeId: "kM3tWiq72Ek" },
  { title: "Understanding the Excel Interface", youtubeId: "mwJOmamcO0U" },
  { title: "Creating, Saving, and Managing Workbooks", youtubeId: "vhPZ82cXW2I" },
  { title: "Entering and Editing Data", youtubeId: "jywXr0WfQ3w" },
  { title: "Formatting Basics, Keyboard Shortcuts and Quick Access Toolbar", youtubeId: "oCJwtnio4L4" },
  { title: "Introduction to Formulas and Functions", youtubeId: "xb5Qc84urbM" },
  { title: "Basic Formulas and Real World Examples with Easy Techniques", youtubeId: "jzoFEoYD_kc" }, // reconstructed from scrambled paste — verify title/video match
  { title: "Working with Mini Static Bar", youtubeId: "7Vv3IwFz4mY" },
  { title: "Data Filter and Sort", youtubeId: "6ob1rXuHFbI" }
  // 163 more lessons will go here as they're added.
];

const COURSE_FILES = [
  // Example shape once files are ready to add:
  // { name: "Module 1 - Slides.pdf", url: "https://drive.google.com/...", meta: "PDF • Slides" }
];

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.course-tab-btn');
  const tabPanels = document.querySelectorAll('.course-tab-panel');
  const lessonListEl = document.getElementById('courseLessonList');
  const searchInput = document.getElementById('courseLessonSearch');
  const playerFrameEl = document.getElementById('coursePlayerFrame');
  const nowPlayingEl = document.getElementById('courseNowPlaying');
  const lessonCountEl = document.getElementById('courseLessonCount');
  const filesGridEl = document.getElementById('courseFilesGrid');

  let activeIndex = -1;

  // ── Tabs ──
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tabTarget).classList.add('active');
    });
  });

  // ── Player ──
  // Ad note: this loads the youtube-nocookie.com privacy-enhanced embed with
  // modestbranding/rel params to cut down on YouTube's own UI clutter. It
  // cannot remove YouTube's in-player ads — those are served by YouTube itself,
  // not by this site, so no website-side code can block them.
  function playLesson(index) {
    const lesson = COURSE_VIDEOS[index];
    if (!lesson) return;
    activeIndex = index;

    playerFrameEl.innerHTML = `
      <iframe
        src="https://www.youtube-nocookie.com/embed/${lesson.youtubeId}?rel=0&modestbranding=1&autoplay=1"
        title="${lesson.title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
      </iframe>`;

    nowPlayingEl.innerHTML = `<span>Now Playing • Lesson ${index + 1} of ${COURSE_VIDEOS.length}</span>${lesson.title}`;
    renderLessonList(searchInput.value);
  }

  // ── Lesson list ──
  function renderLessonList(filterText = '') {
    const term = filterText.trim().toLowerCase();
    const matches = COURSE_VIDEOS
      .map((lesson, index) => ({ lesson, index }))
      .filter(({ lesson }) => lesson.title.toLowerCase().includes(term));

    if (matches.length === 0) {
      lessonListEl.innerHTML = `<div class="course-lesson-empty">No lessons match "${filterText}".</div>`;
      return;
    }

    lessonListEl.innerHTML = matches.map(({ lesson, index }) => `
      <div class="course-lesson-item ${index === activeIndex ? 'playing' : ''}" data-index="${index}">
        <div class="course-lesson-num">${index + 1}</div>
        <div class="course-lesson-title">${lesson.title}</div>
      </div>
    `).join('');

    lessonListEl.querySelectorAll('.course-lesson-item').forEach(item => {
      item.addEventListener('click', () => playLesson(Number(item.dataset.index)));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderLessonList(e.target.value));
  }

  if (lessonCountEl) {
    lessonCountEl.textContent = `${COURSE_VIDEOS.length} Video Lessons`;
  }

  // ── Files tab ──
  function renderFiles() {
    if (!filesGridEl) return;
    if (COURSE_FILES.length === 0) {
      filesGridEl.innerHTML = `<div class="course-files-empty">Course files haven't been added yet — check back soon.</div>`;
      return;
    }
    filesGridEl.innerHTML = COURSE_FILES.map(file => `
      <a class="course-file-card" href="${file.url}" target="_blank" rel="noopener noreferrer">
        <div class="course-file-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div>
          <div class="course-file-name">${file.name}</div>
          <div class="course-file-meta">${file.meta || 'File'}</div>
        </div>
      </a>
    `).join('');
  }

  // ── Init ──
  renderLessonList();
  renderFiles();
  if (COURSE_VIDEOS.length > 0) {
    // Show the first lesson as a "click to play" placeholder rather than
    // autoplaying on page load.
    nowPlayingEl.innerHTML = `<span>Select a lesson to begin</span>${COURSE_VIDEOS[0].title}`;
  }
});