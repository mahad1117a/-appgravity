// Apps Gravity — Full Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('adminLoginView');
  const dashboardView = document.getElementById('adminDashboardView');
  const loginForm = document.getElementById('adminLoginForm');
  const loginError = document.getElementById('adminLoginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const toast = document.getElementById('adminToast');

  let csrfToken = '';

  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.className) node.className = opts.className;
    if (opts.text !== undefined) node.textContent = opts.text;
    if (opts.type) node.type = opts.type;
    if (opts.placeholder) node.placeholder = opts.placeholder;
    if (opts.value !== undefined) node.value = opts.value;
    if (opts.name) node.name = opts.name;
    if (opts.required) node.required = true;
    return node;
  }

  function emptyState(msg) { return el('div', { className: 'admin-empty', text: msg }); }
  function formatDate(iso) { try { return new Date(iso).toLocaleString(); } catch { return iso || ''; } }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  async function fetchCSRFToken() {
    try {
      const res = await fetch('/api/csrf-token');
      const data = await res.json();
      if (data.success) csrfToken = data.csrfToken;
    } catch (err) { console.warn('CSRF fetch failed:', err); }
  }

  async function api(method, url, body) {
    if (!csrfToken && method !== 'GET') await fetchCSRFToken();
    const opts = { method, headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['X-CSRF-Token'] = csrfToken;
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { showLogin(); throw new Error('Unauthorized'); }
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function showLogin() {
    loginView.style.display = 'block';
    dashboardView.style.display = 'none';
  }

  function showDashboard() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    loadDashboardData();
  }

  async function checkSession() {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      data.authenticated ? showDashboard() : showLogin();
    } catch { showLogin(); }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const password = document.getElementById('adminPasswordInput').value;
    if (!csrfToken) await fetchCSRFToken();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        document.getElementById('adminPasswordInput').value = '';
        showDashboard();
      } else {
        loginError.textContent = data.error || 'Login failed.';
      }
    } catch { loginError.textContent = 'Network error.'; }
  });

  logoutBtn.addEventListener('click', async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {}
    showLogin();
  });

  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });

  function setCount(id, n) {
    const node = document.getElementById(id);
    if (node) node.textContent = n;
  }

  function buildForm(title, fields, onSubmit) {
    const form = el('form', { className: 'admin-form' });
    form.appendChild(el('h3', { text: title }));
    const inputs = {};

    fields.forEach(f => {
      const wrap = el('div');
      if (f.full) wrap.style.gridColumn = '1 / -1';
      wrap.appendChild(el('label', { text: f.label }));
      let input;
      if (f.type === 'textarea') {
        input = el('textarea', { name: f.name, placeholder: f.placeholder || '' });
        if (f.tall) input.classList.add('tall');
        if (f.value) input.value = f.value;
      } else if (f.type === 'select') {
        input = el('select', { name: f.name });
        (f.options || []).forEach(opt => {
          const o = el('option', { text: opt.label, value: opt.value });
          if (f.value === opt.value) o.selected = true;
          input.appendChild(o);
        });
      } else {
        input = el('input', { type: f.type || 'text', name: f.name, placeholder: f.placeholder || '', value: f.value || '' });
      }
      inputs[f.name] = input;
      wrap.appendChild(input);
      form.appendChild(wrap);
    });

    const actions = el('div', { className: 'admin-form-actions' });
    const submit = el('button', { className: 'admin-submit-btn', text: 'Save', type: 'submit' });
    actions.appendChild(submit);
    form.appendChild(actions);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submit.disabled = true;
      const data = {};
      fields.forEach(f => { data[f.name] = inputs[f.name].value; });
      try {
        await onSubmit(data);
        showToast('Saved successfully');
        loadDashboardData();
      } catch (err) {
        alert(err.message);
      } finally { submit.disabled = false; }
    });

    return form;
  }

  function renderStats(data) {
    const stats = document.getElementById('adminStats');
    stats.innerHTML = '';
    [
      { num: data.analytics?.totalViews || 0, label: 'Page Views' },
      { num: data.messages?.length || 0, label: 'Messages' },
      { num: data.courses?.length || 0, label: 'Courses' },
      { num: data.posts?.length || 0, label: 'Posts' },
      { num: data.customKnowledge?.length || 0, label: 'AI Entries' },
      { num: data.analytics?.newMessages || 0, label: 'New Messages' }
    ].forEach(item => {
      const card = el('div', { className: 'admin-stat-card' });
      card.appendChild(el('div', { className: 'admin-stat-num', text: String(item.num) }));
      card.appendChild(el('div', { className: 'admin-stat-label', text: item.label }));
      stats.appendChild(card);
    });
  }

  function renderOverview(data) {
    const panel = document.getElementById('panel-overview');
    panel.innerHTML = '';
    panel.appendChild(el('div', { className: 'admin-list-title', text: '📊 Popular Pages' }));
    if (!data.analytics?.topPages?.length) {
      panel.appendChild(emptyState('No page view data yet.'));
    } else {
      data.analytics.topPages.forEach(p => {
        const card = el('div', { className: 'admin-card' });
        const top = el('div', { className: 'admin-card-top' });
        top.appendChild(el('div', { className: 'admin-card-title', text: p.page }));
        top.appendChild(el('div', { className: 'admin-card-meta', text: `${p.views} views` }));
        card.appendChild(top);
        panel.appendChild(card);
      });
    }
    panel.appendChild(el('div', { className: 'admin-list-title', text: '🔎 Top Chat Queries' }));
    if (!data.analytics?.topQueries?.length) {
      panel.appendChild(emptyState('No chat queries logged yet.'));
    } else {
      data.analytics.topQueries.forEach(q => {
        const card = el('div', { className: 'admin-card' });
        card.appendChild(el('div', { className: 'admin-card-body', text: `"${q.query}" — ${q.count} times` }));
        panel.appendChild(card);
      });
    }
  }

  function renderMessages(messages) {
    const panel = document.getElementById('panel-messages');
    panel.innerHTML = '';
    setCount('messagesCount', messages.length);
    if (!messages.length) { panel.appendChild(emptyState('No contact messages yet.')); return; }
    messages.forEach(m => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: `${m.name} · ${m.email}` }));
      top.appendChild(el('div', { className: 'admin-card-meta', text: formatDate(m.createdAt) }));
      card.appendChild(top);
      card.appendChild(el('span', { className: `admin-badge status-${m.status || 'new'}`, text: m.status || 'new' }));
      if (m.service) card.appendChild(el('span', { className: 'admin-badge', text: m.service }));
      card.appendChild(el('div', { className: 'admin-card-body', text: m.message }));
      const replyBtn = el('a', { className: 'admin-action-btn', text: '✉️ Reply via Email', href: `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: Contact Inquiry - Apps Gravity')}` });
      replyBtn.style.display = 'inline-block';
      replyBtn.style.textDecoration = 'none';
      actions.appendChild(replyBtn);
      if (m.status !== 'resolved') {
        const btn = el('button', { className: 'admin-action-btn', text: 'Mark Resolved' });
        btn.addEventListener('click', async () => { await api('PATCH', `/api/admin/messages/${m.id}`, { status: 'resolved' }); loadDashboardData(); });
        actions.appendChild(btn);
      }
      const readBtn = el('button', { className: 'admin-action-btn', text: 'Mark Read' });
      readBtn.addEventListener('click', async () => { await api('PATCH', `/api/admin/messages/${m.id}`, { status: 'read' }); loadDashboardData(); });
      actions.appendChild(readBtn);
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Delete' });
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this message?')) return;
        await api('DELETE', `/api/admin/messages/${m.id}`);
        loadDashboardData();
      });
      actions.appendChild(delBtn);
      card.appendChild(actions);
      panel.appendChild(card);
    });
  }

  function renderCourses(courses) {
    const panel = document.getElementById('panel-courses');
    panel.innerHTML = '';
    setCount('coursesCount', courses.length);
    panel.appendChild(buildForm('Add New Course', [
      { name: 'title', label: 'Course Title *' },
      { name: 'category', label: 'Category', placeholder: 'medical, analytics, programming' },
      { name: 'badge', label: 'Badge Text' },
      { name: 'meta', label: 'Meta Line' },
      { name: 'desc', label: 'Description', type: 'textarea', tall: true, full: true },
      { name: 'driveUrl', label: 'Google Drive URL' },
      { name: 'youtubeUrl', label: 'YouTube URL' },
      { name: 'pageUrl', label: 'Course Page URL' },
      { name: 'features', label: 'Features (comma-separated)', full: true }
    ], async (data) => {
      await api('POST', '/api/admin/courses', {
        ...data,
        features: data.features ? data.features.split(',').map(s => s.trim()).filter(Boolean) : []
      });
    }));
    panel.appendChild(el('div', { className: 'admin-list-title', text: 'Existing Courses' }));
    if (!courses.length) { panel.appendChild(emptyState('No courses yet.')); return; }
    courses.forEach(c => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: c.title }));
      top.appendChild(el('span', { className: 'admin-badge', text: c.category || 'general' }));
      card.appendChild(top);
      card.appendChild(el('div', { className: 'admin-card-body', text: c.desc || '' }));
      const actions = el('div', { className: 'admin-actions' });
      const editBtn = el('button', { className: 'admin-edit-btn', text: 'Edit' });
      editBtn.addEventListener('click', () => {
        const form = buildForm('Edit Course', [
          { name: 'title', label: 'Title', value: c.title },
          { name: 'category', label: 'Category', value: c.category || '' },
          { name: 'badge', label: 'Badge', value: c.badge || '' },
          { name: 'meta', label: 'Meta', value: c.meta || '' },
          { name: 'desc', label: 'Description', type: 'textarea', tall: true, value: c.desc || '', full: true },
          { name: 'driveUrl', label: 'Drive URL', value: c.driveUrl || '' },
          { name: 'youtubeUrl', label: 'YouTube URL', value: c.youtubeUrl || '' },
          { name: 'pageUrl', label: 'Page URL', value: c.pageUrl || '' },
          { name: 'features', label: 'Features (comma-separated)', value: (c.features || []).join(', '), full: true }
        ], async (data) => {
          await api('PUT', `/api/admin/courses/${c.id}`, {
            ...data,
            features: data.features ? data.features.split(',').map(s => s.trim()).filter(Boolean) : []
          });
          form.remove();
          card.style.display = '';
        });
        card.after(form);
        card.style.display = 'none';
      });
      actions.appendChild(editBtn);
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Delete' });
      delBtn.addEventListener('click', async () => {
        if (!confirm(`Delete "${c.title}"?`)) return;
        await api('DELETE', `/api/admin/courses/${c.id}`);
        loadDashboardData();
      });
      actions.appendChild(delBtn);
      card.appendChild(actions);
      panel.appendChild(card);
    });
  }

  function renderPosts(posts) {
    const panel = document.getElementById('panel-posts');
    panel.innerHTML = '';
    setCount('postsCount', posts.length);
    panel.appendChild(buildForm('Create New Post', [
      { name: 'title', label: 'Title *' },
      { name: 'excerpt', label: 'Excerpt' },
      { name: 'content', label: 'Content', type: 'textarea', tall: true, full: true },
      { name: 'status', label: 'Status', type: 'select', options: [
        { label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }
      ]}
    ], async (data) => { await api('POST', '/api/admin/posts', data); }));
    panel.appendChild(el('div', { className: 'admin-list-title', text: 'All Posts' }));
    if (!posts.length) { panel.appendChild(emptyState('No posts yet.')); return; }
    posts.forEach(p => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: p.title }));
      top.appendChild(el('span', { className: `admin-badge status-${p.status}`, text: p.status }));
      card.appendChild(top);
      card.appendChild(el('div', { className: 'admin-card-meta', text: formatDate(p.updatedAt || p.createdAt) }));
      card.appendChild(el('div', { className: 'admin-card-body', text: p.excerpt || (p.content || '').slice(0, 150) }));
      const actions = el('div', { className: 'admin-actions' });
      const editBtn = el('button', { className: 'admin-edit-btn', text: 'Edit' });
      editBtn.addEventListener('click', () => {
        const form = buildForm('Edit Post', [
          { name: 'title', label: 'Title *', value: p.title },
          { name: 'excerpt', label: 'Excerpt', value: p.excerpt || '' },
          { name: 'content', label: 'Content', type: 'textarea', tall: true, value: p.content || '', full: true },
          { name: 'status', label: 'Status', type: 'select', value: p.status, options: [
            { label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }
          ]}
        ], async (data) => {
          await api('PUT', `/api/admin/posts/${p.id}`, data);
          form.remove();
          card.style.display = '';
        });
        card.after(form);
        card.style.display = 'none';
      });
      actions.appendChild(editBtn);
      const toggleBtn = el('button', { className: 'admin-action-btn', text: p.status === 'published' ? 'Unpublish' : 'Publish' });
      toggleBtn.addEventListener('click', async () => {
        await api('PUT', `/api/admin/posts/${p.id}`, { status: p.status === 'published' ? 'draft' : 'published' });
        loadDashboardData();
      });
      actions.appendChild(toggleBtn);
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Delete' });
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this post?')) return;
        await api('DELETE', `/api/admin/posts/${p.id}`);
        loadDashboardData();
      });
      actions.appendChild(delBtn);
      card.appendChild(actions);
      panel.appendChild(card);
    });
  }

  function renderKnowledge(entries) {
    const panel = document.getElementById('panel-knowledge');
    panel.innerHTML = '';
    setCount('knowledgeCount', entries.length);
    panel.appendChild(buildForm('Add AI Q&A Entry', [
      { name: 'category', label: 'Category', placeholder: 'Custom' },
      { name: 'keywords', label: 'Trigger Keywords (comma-separated) *', full: true },
      { name: 'answer', label: 'AI Answer *', type: 'textarea', tall: true, full: true }
    ], async (data) => {
      await api('POST', '/api/admin/knowledge', {
        category: data.category,
        keywords: data.keywords.split(',').map(s => s.trim()).filter(Boolean),
        answer: data.answer
      });
    }));
    panel.appendChild(el('div', { className: 'admin-list-title', text: 'Custom Knowledge Entries' }));
    if (!entries.length) { panel.appendChild(emptyState('No custom entries yet.')); return; }
    entries.forEach(entry => {
      const card = el('div', { className: 'admin-card' });
      card.appendChild(el('span', { className: 'admin-badge', text: entry.category || 'Custom' }));
      card.appendChild(el('div', { className: 'admin-card-meta', text: `Keywords: ${(entry.keywords || []).join(', ')}` }));
      card.appendChild(el('div', { className: 'admin-card-body', text: entry.answer }));
      const actions = el('div', { className: 'admin-actions' });
      const editBtn = el('button', { className: 'admin-edit-btn', text: 'Edit' });
      editBtn.addEventListener('click', () => {
        const form = buildForm('Edit AI Q&A Entry', [
          { name: 'category', label: 'Category', value: entry.category || 'Custom' },
          { name: 'keywords', label: 'Trigger Keywords (comma-separated) *', value: (entry.keywords || []).join(', '), full: true },
          { name: 'answer', label: 'AI Answer *', type: 'textarea', tall: true, value: entry.answer || '', full: true }
        ], async (data) => {
          await api('PUT', `/api/admin/knowledge/${entry.id}`, {
            category: data.category,
            keywords: data.keywords ? data.keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
            answer: data.answer
          });
          form.remove();
          card.style.display = '';
        });
        card.after(form);
        card.style.display = 'none';
      });
      actions.appendChild(editBtn);
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Delete' });
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this entry?')) return;
        await api('DELETE', `/api/admin/knowledge/${entry.id}`);
        loadDashboardData();
      });
      actions.appendChild(delBtn);
      card.appendChild(actions);
      panel.appendChild(card);
    });
  }

  function renderChatHistory(chats) {
    const panel = document.getElementById('panel-chat');
    panel.innerHTML = '';
    setCount('chatCount', chats.length);
    if (!chats.length) { panel.appendChild(emptyState('No chat history yet.')); return; }
    chats.forEach(c => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: c.message }));
      top.appendChild(el('div', { className: 'admin-card-meta', text: formatDate(c.timestamp) }));
      card.appendChild(top);
      card.appendChild(el('span', { className: 'admin-badge', text: c.action || 'unknown' }));
      card.appendChild(el('div', { className: 'admin-card-body', text: c.replyPreview || '' }));
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Delete' });
      delBtn.addEventListener('click', async () => {
        await api('DELETE', `/api/admin/chat/${c.id}`);
        loadDashboardData();
      });
      card.appendChild(delBtn);
      panel.appendChild(card);
    });
  }

  function renderQuotes(quotes) {
    const panel = document.getElementById('panel-quotes');
    panel.innerHTML = '';
    setCount('quotesCount', quotes.length);
    if (!quotes.length) { panel.appendChild(emptyState('No quote requests yet.')); return; }
    quotes.forEach(q => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: `$${q.estimatedCost} · ~${q.estimatedWeeks} weeks` }));
      top.appendChild(el('div', { className: 'admin-card-meta', text: formatDate(q.created) }));
      card.appendChild(top);
      [q.projectType, q.platform, ...(q.features || [])].filter(Boolean).forEach(f => {
        card.appendChild(el('span', { className: 'admin-badge', text: f }));
      });
      const body = el('div', { className: 'admin-card-body' });
      if (q.clientInfo?.name || q.clientInfo?.email) {
        body.appendChild(el('div', { text: `👤 ${q.clientInfo.name || 'Anonymous'} ${q.clientInfo.email ? '· ' + q.clientInfo.email : ''}` }));
      }
      if (q.clientInfo?.message) body.appendChild(el('div', { text: q.clientInfo.message }));
      card.appendChild(body);
      panel.appendChild(card);
    });
  }

  function renderCourseRequests(requests) {
    const panel = document.getElementById('panel-courseRequests');
    panel.innerHTML = '';
    setCount('courseRequestsCount', requests.length);
    if (!requests.length) { panel.appendChild(emptyState('No course requests yet.')); return; }
    requests.forEach(r => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: r.courseTopic }));
      top.appendChild(el('div', { className: 'admin-card-meta', text: formatDate(r.date) }));
      card.appendChild(top);
      const body = el('div', { className: 'admin-card-body' });
      if (r.requesterEmail) body.appendChild(el('div', { text: `✉️ ${r.requesterEmail}` }));
      if (r.notes) body.appendChild(el('div', { text: r.notes }));
      card.appendChild(body);
      panel.appendChild(card);
    });
  }

  function renderReviews(reviews) {
    const panel = document.getElementById('panel-reviews');
    panel.innerHTML = '';
    setCount('reviewsCount', reviews.length);
    if (!reviews.length) { panel.appendChild(emptyState('No reviews yet.')); return; }
    reviews.forEach(rv => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: `${rv.name} — ${'⭐'.repeat(rv.rating || 5)}` }));
      top.appendChild(el('div', { className: 'admin-card-meta', text: `${rv.role || ''} · ${rv.date || ''}` }));
      card.appendChild(top);
      card.appendChild(el('div', { className: 'admin-card-body', text: rv.comment }));
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Delete review' });
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this review?')) return;
        await api('DELETE', `/api/admin/reviews/${rv.id}`);
        loadDashboardData();
      });
      card.appendChild(delBtn);
      panel.appendChild(card);
    });
  }

  function renderUsers(users) {
    const panel = document.getElementById('panel-users');
    panel.innerHTML = '';
    setCount('usersCount', users.length);
    panel.appendChild(buildForm('Add User', [
      { name: 'name', label: 'Name *' },
      { name: 'email', label: 'Email *' },
      { name: 'role', label: 'Role', type: 'select', options: [
        { label: 'Admin', value: 'admin' }, { label: 'Editor', value: 'editor' }, { label: 'Student', value: 'student' }
      ]}
    ], async (data) => { await api('POST', '/api/admin/users', data); }));
    panel.appendChild(el('div', { className: 'admin-list-title', text: 'All Users' }));
    users.forEach(u => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: u.name }));
      top.appendChild(el('span', { className: 'admin-badge', text: u.role }));
      card.appendChild(top);
      card.appendChild(el('div', { className: 'admin-card-body', text: u.email }));
      const actions = el('div', { className: 'admin-actions' });
      ['admin', 'editor', 'student'].forEach(role => {
        if (role === u.role) return;
        const btn = el('button', { className: 'admin-action-btn', text: `Set ${role}` });
        btn.addEventListener('click', async () => { await api('PUT', `/api/admin/users/${u.id}`, { role }); loadDashboardData(); });
        actions.appendChild(btn);
      });
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Remove' });
      delBtn.addEventListener('click', async () => {
        if (!confirm(`Remove ${u.name}?`)) return;
        await api('DELETE', `/api/admin/users/${u.id}`);
        loadDashboardData();
      });
      actions.appendChild(delBtn);
      card.appendChild(actions);
      panel.appendChild(card);
    });
  }

  function renderFiles(files) {
    const panel = document.getElementById('panel-files');
    panel.innerHTML = '';
    setCount('filesCount', files.length);

    const uploadForm = el('form', { className: 'admin-form' });
    uploadForm.appendChild(el('h3', { text: 'Upload File (images, PDFs — max 10MB)' }));
    const fileInput = el('input', { type: 'file', name: 'file' });
    fileInput.accept = 'image/*,.pdf,.doc,.docx';
    uploadForm.appendChild(fileInput);
    const uploadBtn = el('button', { className: 'admin-submit-btn', text: 'Upload', type: 'submit' });
    uploadForm.appendChild(el('div', { className: 'admin-form-actions' })).appendChild(uploadBtn);
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = fileInput.files[0];
      if (!file) return alert('Choose a file first.');
      if (file.size > 10 * 1024 * 1024) return alert('File too large (max 10MB).');
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        try {
          await api('POST', '/api/admin/files', { filename: file.name, contentBase64: base64, mimeType: file.type });
          showToast('File uploaded');
          loadDashboardData();
        } catch (err) { alert(err.message); }
      };
      reader.readAsDataURL(file);
    });
    panel.appendChild(uploadForm);

    panel.appendChild(el('div', { className: 'admin-list-title', text: 'Uploaded Files' }));
    if (!files.length) { panel.appendChild(emptyState('No files uploaded yet.')); return; }
    files.forEach(f => {
      const card = el('div', { className: 'admin-card' });
      const top = el('div', { className: 'admin-card-top' });
      top.appendChild(el('div', { className: 'admin-card-title', text: f.originalName }));
      top.appendChild(el('div', { className: 'admin-card-meta', text: formatDate(f.uploadedAt) }));
      card.appendChild(top);
      card.appendChild(el('div', { className: 'admin-card-body', text: `${f.mimeType} · ${Math.round(f.size / 1024)} KB` }));
      const link = el('a', { className: 'admin-action-btn', text: 'Open file', href: f.url });
      link.style.display = 'inline-block';
      link.style.marginTop = '0.5rem';
      card.appendChild(link);
      const delBtn = el('button', { className: 'admin-delete-btn', text: 'Delete' });
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this file?')) return;
        await api('DELETE', `/api/admin/files/${f.id}`);
        loadDashboardData();
      });
      card.appendChild(delBtn);
      panel.appendChild(card);
    });
  }

  function renderSettings(settings) {
    const panel = document.getElementById('panel-settings');
    panel.innerHTML = '';
    panel.appendChild(buildForm('Website Settings', [
      { name: 'siteName', label: 'Site Name', value: settings.siteName || '' },
      { name: 'founderName', label: 'Founder Name', value: settings.founderName || '' },
      { name: 'heroLine1', label: 'Hero Line 1', value: settings.heroLine1 || '' },
      { name: 'heroLine2', label: 'Hero Line 2', value: settings.heroLine2 || '' },
      { name: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea', value: settings.heroSubtitle || '', full: true },
      { name: 'contactEmail', label: 'Contact Email', value: settings.contactEmail || '' },
      { name: 'githubUrl', label: 'GitHub URL', value: settings.githubUrl || '' },
      { name: 'logoUrl', label: 'Logo URL / Path', value: settings.logoUrl || '' },
      { name: 'seoTitle', label: 'SEO Title', value: settings.seoTitle || '' },
      { name: 'seoDescription', label: 'SEO Description', type: 'textarea', value: settings.seoDescription || '', full: true },
      { name: 'seoKeywords', label: 'SEO Keywords', value: settings.seoKeywords || '', full: true }
    ], async (data) => { await api('PUT', '/api/admin/settings', data); }));
  }

  function renderBackup() {
    const panel = document.getElementById('panel-backup');
    panel.innerHTML = '';
    const card = el('div', { className: 'admin-form' });
    card.appendChild(el('h3', { text: '💾 Backup & Restore' }));
    card.appendChild(el('p', { className: 'admin-card-body', text: 'Download a full JSON backup of all site data, or restore from a previous backup file.' }));

    const dlBtn = el('button', { className: 'admin-submit-btn', text: 'Download Backup' });
    dlBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/admin/backup');
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `apps-gravity-backup-${Date.now()}.json`;
        a.click();
        showToast('Backup downloaded');
      } catch { alert('Backup failed.'); }
    });
    card.appendChild(dlBtn);

    const restoreForm = el('form', { className: 'admin-form-actions' });
    restoreForm.style.marginTop = '1rem';
    const restoreInput = el('input', { type: 'file', name: 'backup' });
    restoreInput.accept = '.json';
    restoreForm.appendChild(restoreInput);
    const restoreBtn = el('button', { className: 'admin-action-btn', text: 'Restore from Backup', type: 'submit' });
    restoreForm.appendChild(restoreBtn);
    restoreForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = restoreInput.files[0];
      if (!file) return;
      if (!confirm('This will overwrite all current data. Continue?')) return;
      const text = await file.text();
      try {
        const backup = JSON.parse(text);
        await api('POST', '/api/admin/restore', backup);
        showToast('Backup restored');
        loadDashboardData();
      } catch (err) { alert(err.message || 'Invalid backup file.'); }
    });
    card.appendChild(restoreForm);
    panel.appendChild(card);
  }

  async function loadDashboardData() {
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) { showLogin(); return; }
      const data = await res.json();
      if (!data.success) return;
      renderStats(data);
      renderOverview(data);
      renderMessages(data.messages || []);
      renderCourses(data.courses || []);
      renderPosts(data.posts || []);
      renderKnowledge(data.customKnowledge || []);
      renderChatHistory(data.chatHistory || []);
      renderQuotes(data.quotes || []);
      renderCourseRequests(data.courseRequests || []);
      renderReviews(data.reviews || []);
      renderUsers(data.users || []);
      renderFiles(data.files || []);
      renderSettings(data.settings || {});
      renderBackup();
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    }
  }

  fetchCSRFToken().then(checkSession);
});
