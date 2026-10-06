/* Shared UI: app shell, icons, formatting, covers, modals, toasts and tables. */
(function () {
  const ICONS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    open: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    chart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    print: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M16 15h2"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>'
  };

  const SUBJECT_COLORS = {
    'Science': '#2C6E9B',
    'Mathematics': '#5B4A8B',
    'English Literature': '#1E3A5F',
    'Fiction': '#A34A35',
    'Urdu Literature': '#2E7D5B',
    'History': '#7F5427',
    'Geography': '#2F7472',
    'Computer Science': '#334155',
    'Islamic Studies': '#4E6B2A',
    'General Knowledge': '#8E3A5E'
  };
  const SUBJECTS = Object.keys(SUBJECT_COLORS);

  const LEVELS = { Primary: 'Primary (1–5)', Middle: 'Middle (6–8)', Secondary: 'Secondary (9–10)' };
  const ROLE_LABEL = { admin: 'Librarian', teacher: 'Teacher', student: 'Student' };
  const AVATAR_COLORS = ['#1E3A5F', '#2C6E9B', '#2E7D5B', '#7F5427', '#5B4A8B', '#A34A35', '#2F7472', '#B9800F'];

  // key, label, icon, path
  const NAV = {
    admin: [
      ['dashboard', 'Dashboard', 'home', 'admin/dashboard.html'],
      ['books', 'Books', 'book', 'admin/books.html'],
      ['issue-return', 'Issue & Return', 'repeat', 'admin/issue-return.html'],
      ['members', 'Members', 'users', 'admin/members.html'],
      ['reservations', 'Reservations', 'bookmark', 'admin/reservations.html'],
      ['reports', 'Reports', 'chart', 'admin/reports.html'],
      ['settings', 'Settings', 'sliders', 'admin/settings.html']
    ],
    teacher: [
      ['dashboard', 'Dashboard', 'home', 'teacher/dashboard.html'],
      ['catalog', 'Catalog', 'library', 'teacher/catalog.html'],
      ['my-books', 'My Books', 'open', 'teacher/my-books.html'],
      ['reading-lists', 'Reading Lists', 'list', 'teacher/reading-lists.html'],
      ['profile', 'Profile', 'user', 'teacher/profile.html']
    ],
    student: [
      ['dashboard', 'Dashboard', 'home', 'student/dashboard.html'],
      ['catalog', 'Catalog', 'library', 'student/catalog.html'],
      ['my-books', 'My Books', 'open', 'student/my-books.html'],
      ['profile', 'Profile', 'user', 'student/profile.html']
    ]
  };

  function icon(name, cls) {
    return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const UI = {
    icon, esc, SUBJECTS, SUBJECT_COLORS, LEVELS, ROLE_LABEL,

    url: path => Auth.url(path),
    params: () => new URLSearchParams(location.search),
    $: (sel, el) => (el || document).querySelector(sel),
    $$: (sel, el) => Array.from((el || document).querySelectorAll(sel)),

    /* ---------- Formatting ---------- */
    fmtDate(iso) {
      if (!iso) return '—';
      return Store.D.parse(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    fmtTime(ts) {
      const d = new Date(ts);
      const day = Store.D.diff(Store.D.today(), d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
      const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      if (day === 0) return 'Today, ' + time;
      if (day === -1) return 'Yesterday, ' + time;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    },
    money: n => 'Rs ' + Number(n || 0).toLocaleString('en-US'),
    plural: (n, word, many) => `${n} ${n === 1 ? word : (many || word + 's')}`,
    levelLabel: level => LEVELS[level] || level,
    greeting() {
      const h = new Date().getHours();
      return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    },
    firstName: name => name.split(' ')[0],
    memberDetail(user) {
      if (user.role === 'student') return `Class ${user.className}`;
      if (user.role === 'teacher') return `${user.subject} teacher`;
      return user.title || 'Librarian';
    },

    // Due-date text and badge tone for a loan.
    dueInfo(loan) {
      if (loan.returnDate) return { text: 'Returned ' + UI.fmtDate(loan.returnDate), tone: 'neutral', days: 0 };
      const days = Store.D.diff(Store.D.today(), loan.dueDate);
      if (days < 0) return { text: `${UI.plural(-days, 'day')} overdue`, tone: 'danger', days };
      if (days === 0) return { text: 'Due today', tone: 'warn', days };
      if (days <= 3) return { text: `Due in ${UI.plural(days, 'day')}`, tone: 'warn', days };
      return { text: `Due in ${days} days`, tone: 'success', days };
    },

    /* ---------- Small pieces ---------- */
    badge: (text, tone) => `<span class="badge badge-${tone || 'info'}">${esc(text)}</span>`,

    availBadge(book) {
      const status = Store.bookStatus(book.id);
      if (status === 'available') return UI.badge('Available', 'success');
      if (status === 'onhold') return UI.badge('On hold', 'warn');
      return UI.badge('All issued', 'neutral');
    },

    stockBadge(book) {
      const avail = Store.available(book.id);
      const tone = avail === 0 ? 'danger' : avail < book.copies ? 'gold' : 'success';
      return `<span class="badge badge-${tone}">${avail} of ${book.copies} in</span>`;
    },

    initials: name => name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(),

    avatar(user, size) {
      const n = parseInt(user.id.slice(1), 10) || 0;
      const color = user.role === 'admin' ? '#B9800F' : AVATAR_COLORS[n % AVATAR_COLORS.length];
      return `<span class="avatar ${size === 'lg' ? 'avatar-lg' : ''}" style="background:${color}" aria-hidden="true">${esc(UI.initials(user.name))}</span>`;
    },

    cover(book, size) {
      size = size || 'md';
      const color = SUBJECT_COLORS[book.subject] || '#1E3A5F';
      if (size === 'sm') return `<span class="cover cover-sm" style="--c:${color}" aria-hidden="true"></span>`;
      return `<div class="cover cover-${size}" style="--c:${color}" aria-hidden="true">
        <span class="cover-subject">${esc(book.subject)}</span>
        <span class="cover-title">${esc(book.title)}</span>
        <span class="cover-author">${esc(book.author)}</span>
      </div>`;
    },

    bookUrl: id => UI.url('book.html?id=' + encodeURIComponent(id)),
    memberUrl: id => UI.url('admin/member.html?id=' + encodeURIComponent(id)),

    bookCell(book, sub) {
      return `<div class="cell-book">${UI.cover(book, 'sm')}<div><div class="cell-title">${esc(book.title)}</div><div class="cell-sub">${esc(sub == null ? book.author : sub)}</div></div></div>`;
    },
    personCell(user, sub) {
      return `<div class="cell-person">${UI.avatar(user)}<div><div class="cell-title">${esc(user.name)}</div><div class="cell-sub">${esc(sub == null ? UI.memberDetail(user) : sub)}</div></div></div>`;
    },

    stat({ icon: ic, label, value, sub, tone, href }) {
      const tag = href ? 'a' : 'div';
      return `<${tag} class="stat" ${href ? `href="${href}"` : ''}>
        <div class="stat-icon ${tone || ''}">${icon(ic)}</div>
        <div><div class="stat-label">${esc(label)}</div><div class="stat-value">${esc(value)}</div>${sub ? `<div class="stat-sub">${esc(sub)}</div>` : ''}</div>
      </${tag}>`;
    },

    empty(ic, title, text, action) {
      return `<div class="empty">${icon(ic)}<h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}${action || ''}</div>`;
    },

    miniBook(book) {
      return `<a class="mini-book" href="${UI.bookUrl(book.id)}">${UI.cover(book, 'md')}<span class="t">${esc(book.title)}</span></a>`;
    },

    // cols: [{ label, render(row), cls }]
    table(cols, rows, opts) {
      opts = opts || {};
      if (!rows.length) return opts.empty || UI.empty('book', 'Nothing to show', '');
      const head = cols.map(c => `<th class="${c.cls || ''}">${c.label}</th>`).join('');
      const body = rows.map(r => `<tr${opts.href ? ` data-href="${opts.href(r)}"` : ''}>${cols.map(c => `<td class="${c.cls || ''}">${c.render(r)}</td>`).join('')}</tr>`).join('');
      return `<div class="table-wrap"><table class="table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    },

    tabs(el, items, active, onChange) {
      el.innerHTML = items.map(t => `<button type="button" class="tab ${t.key === active ? 'active' : ''}" data-tab="${t.key}">${esc(t.label)}${t.count != null ? `<span class="count">${t.count}</span>` : ''}</button>`).join('');
      el.onclick = e => {
        const btn = e.target.closest('[data-tab]');
        if (!btn) return;
        UI.$$('.tab', el).forEach(t => t.classList.toggle('active', t === btn));
        onChange(btn.dataset.tab);
      };
    },

    options(list, selected, placeholder) {
      const opts = list.map(o => {
        const [value, label] = Array.isArray(o) ? o : [o, o];
        return `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
      }).join('');
      return (placeholder != null ? `<option value="">${esc(placeholder)}</option>` : '') + opts;
    },

    /* ---------- Shell ---------- */
    mountShell(user, active) {
      const main = document.querySelector('main.content');
      const s = Store.settings();
      const counts = navCounts(user);
      const nav = NAV[user.role].map(([key, label, ic, path]) =>
        `<a href="${UI.url(path)}" class="${key === active ? 'active' : ''}" ${key === active ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${counts[key] ? `<span class="nav-badge">${counts[key]}</span>` : ''}</a>`
      ).join('');
      const searchPath = user.role === 'admin' ? 'admin/books.html' : user.role + '/catalog.html';
      const profilePath = user.role === 'admin' ? 'admin/settings.html' : user.role + '/profile.html';
      const q = UI.params().get('q') || '';

      const app = document.createElement('div');
      app.className = 'app';
      app.innerHTML = `
        <aside class="sidebar" aria-label="Main navigation">
          <a class="brand" href="${Auth.homeFor(user)}">
            <img src="${UI.url('assets/images/logo.png')}" alt="FG Public School logo">
            <div><div class="brand-name">Digital Library</div><div class="brand-sub">${esc(s.schoolName)}</div></div>
          </a>
          <nav class="nav">
            <div class="nav-label">${ROLE_LABEL[user.role]} menu</div>
            ${nav}
          </nav>
          <div class="sidebar-foot"><strong>Academic year 2026–27</strong>Library open 8:00 am – 3:30 pm</div>
        </aside>
        <div class="nav-backdrop" data-close-nav></div>
        <div class="main-area">
          <header class="topbar">
            <button class="icon-btn menu-btn" type="button" aria-label="Open menu" data-open-nav>${icon('menu')}</button>
            <form class="top-search search-input" role="search" action="${UI.url(searchPath)}" method="get">
              ${icon('search')}
              <label class="sr-only" for="top-q">Search the catalog</label>
              <input class="input" id="top-q" name="q" type="search" placeholder="Search books, authors, subjects…" value="${esc(q)}">
            </form>
            <div class="top-right">
              <a class="user-chip" href="${UI.url(profilePath)}" title="${user.role === 'admin' ? 'Settings' : 'My profile'}">
                ${UI.avatar(user)}
                <div class="meta"><div class="name">${esc(user.name)}</div><div class="role">${esc(UI.memberDetail(user))}</div></div>
              </a>
              <button class="icon-btn" type="button" data-logout title="Sign out" aria-label="Sign out">${icon('logout')}</button>
            </div>
          </header>
        </div>`;
      main.parentNode.insertBefore(app, main);
      app.querySelector('.main-area').appendChild(main);

      UI.hydrateIcons();
      app.querySelector('[data-open-nav]').addEventListener('click', () => document.body.classList.add('nav-open'));
      app.querySelector('[data-close-nav]').addEventListener('click', () => document.body.classList.remove('nav-open'));
      app.querySelector('[data-logout]').addEventListener('click', () => Auth.logout());
      document.addEventListener('keydown', e => { if (e.key === 'Escape') document.body.classList.remove('nav-open'); });
    },

    // Static markup can ask for an icon with <span data-icon="plus"></span>.
    hydrateIcons(root) {
      UI.$$('[data-icon]', root).forEach(el => { el.outerHTML = icon(el.dataset.icon); });
    },

    // Re-render the nav badges after an action changes counts.
    refreshNav(user) {
      const counts = navCounts(user);
      UI.$$('.nav a').forEach(a => {
        const item = NAV[user.role].find(n => a.getAttribute('href') === UI.url(n[3]));
        if (!item) return;
        let badge = a.querySelector('.nav-badge');
        const n = counts[item[0]];
        if (n && !badge) { badge = document.createElement('span'); badge.className = 'nav-badge'; a.appendChild(badge); }
        if (badge) { if (n) badge.textContent = n; else badge.remove(); }
      });
    },

    /* ---------- Toasts ---------- */
    toast(message, type) {
      type = type || 'success';
      let box = document.querySelector('.toasts');
      if (!box) {
        box = document.createElement('div');
        box.className = 'toasts';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        document.body.appendChild(box);
      }
      const el = document.createElement('div');
      el.className = 'toast ' + type;
      el.innerHTML = icon(type === 'error' ? 'alert' : type === 'info' ? 'info' : 'check') + `<div>${esc(message)}</div>`;
      box.appendChild(el);
      setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; }, type === 'error' ? 5200 : 3800);
      setTimeout(() => el.remove(), type === 'error' ? 5600 : 4200);
    },

    /* ---------- Modals ---------- */
    // actions: [{ label, cls, onClick(close) → false keeps it open, form: id for submit buttons }]
    modal({ title, body, actions, wide }) {
      actions = actions || [];
      const back = document.createElement('div');
      back.className = 'modal-backdrop';
      back.innerHTML = `
        <div class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-head"><h2 id="modal-title">${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
          <div class="modal-body">${body}</div>
          ${actions.length ? `<div class="modal-foot">${actions.map((a, i) =>
            `<button class="btn ${a.cls || 'btn-outline'}" ${a.form ? `type="submit" form="${a.form}"` : `type="button" data-action="${i}"`}>${a.label}</button>`).join('')}</div>` : ''}
        </div>`;
      const previous = document.activeElement;
      const onKey = e => { if (e.key === 'Escape') close(); };
      function close() {
        back.remove();
        document.removeEventListener('keydown', onKey);
        if (previous && previous.focus) previous.focus();
      }
      back.addEventListener('click', e => {
        if (e.target === back || e.target.closest('[data-close]')) return close();
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = actions[+btn.dataset.action];
        if (!action.onClick || action.onClick(close) !== false) close();
      });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(back);
      const focusable = back.querySelector('.modal-body input, .modal-body select, .modal-body textarea') || back.querySelector('.modal-foot .btn:last-child');
      if (focusable) focusable.focus();
      return { el: back, close };
    },

    confirm({ title, message, confirmLabel, danger, onConfirm }) {
      return UI.modal({
        title,
        body: `<p>${message}</p>`,
        actions: [
          { label: 'Cancel' },
          { label: confirmLabel || 'Confirm', cls: danger ? 'btn-danger' : 'btn-primary', onClick: onConfirm }
        ]
      });
    },

    // fields: [{ name, label, type: text|number|select|textarea|checklist, options, required, full, min, placeholder, hint }]
    // onSubmit(data) returns an error string to keep the modal open.
    formModal({ title, fields, values, submitLabel, onSubmit, intro, wide }) {
      values = values || {};
      const id = 'form-' + Date.now();
      const body = `${intro || ''}<div class="form-error" hidden></div>
        <form id="${id}" class="form-grid" novalidate>${fields.map(f => fieldHTML(f, values[f.name])).join('')}</form>`;
      const m = UI.modal({ title, body, wide, actions: [{ label: 'Cancel' }, { label: submitLabel || 'Save', cls: 'btn-primary', form: id }] });
      const form = m.el.querySelector('form');
      const errBox = m.el.querySelector('.form-error');

      UI.$$('[data-filter]', form).forEach(input => {
        input.addEventListener('input', () => {
          const q = input.value.trim().toLowerCase();
          UI.$$('.check-item', input.nextElementSibling).forEach(item => {
            item.hidden = q && !item.textContent.toLowerCase().includes(q);
          });
        });
      });

      form.addEventListener('submit', e => {
        e.preventDefault();
        const data = {};
        fields.forEach(f => {
          if (f.type === 'checklist') data[f.name] = UI.$$(`input[name="${f.name}"]:checked`, form).map(i => i.value);
          else {
            const raw = form.elements[f.name].value.trim();
            data[f.name] = f.type === 'number' ? (raw === '' ? '' : Number(raw)) : raw;
          }
        });
        const missing = fields.find(f => f.required && (data[f.name] === '' || (Array.isArray(data[f.name]) && !data[f.name].length)));
        const error = missing ? `${missing.label} is required.` : onSubmit(data);
        if (typeof error === 'string') {
          errBox.textContent = error;
          errBox.hidden = false;
          return;
        }
        m.close();
      });
      return m;
    }
  };

  function fieldHTML(f, value) {
    const v = value == null ? (f.value == null ? '' : f.value) : value;
    const fid = 'fld-' + f.name;
    const label = `<label for="${fid}">${esc(f.label)}${f.required ? ' <span style="color:var(--danger)">*</span>' : ''}</label>`;
    const hint = f.hint ? `<span class="hint">${esc(f.hint)}</span>` : '';
    const cls = `field ${f.full ? 'full' : ''}`;
    if (f.type === 'select') {
      return `<div class="${cls}">${label}<select class="select" id="${fid}" name="${f.name}">${UI.options(f.options, v, f.placeholder)}</select>${hint}</div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="${cls}">${label}<textarea class="textarea" id="${fid}" name="${f.name}" placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>${hint}</div>`;
    }
    if (f.type === 'checklist') {
      const chosen = Array.isArray(v) ? v : [];
      return `<div class="field full"><label for="${fid}">${esc(f.label)}${f.required ? ' <span style="color:var(--danger)">*</span>' : ''}</label>
        <input class="input input-sm" id="${fid}" type="search" placeholder="Filter…" data-filter>
        <div class="checklist">${f.options.map(([val, text, sub]) =>
          `<label class="check-item"><input type="checkbox" name="${f.name}" value="${esc(val)}" ${chosen.includes(val) ? 'checked' : ''}><span>${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</span></label>`).join('')}</div>${hint}</div>`;
    }
    return `<div class="${cls}">${label}<input class="input" id="${fid}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} placeholder="${esc(f.placeholder || '')}">${hint}</div>`;
  }

  function navCounts(user) {
    if (user.role === 'admin') {
      const s = Store.stats();
      return { reservations: s.pending, 'issue-return': s.overdue };
    }
    return { 'my-books': Store.activeLoans().filter(l => l.memberId === user.id).length };
  }

  // Clicking a table row with data-href navigates, unless a button or link inside was clicked.
  document.addEventListener('click', e => {
    const row = e.target.closest('tr[data-href]');
    if (row && !e.target.closest('a, button, input, select')) location.href = row.dataset.href;
  });

  window.UI = UI;
})();
