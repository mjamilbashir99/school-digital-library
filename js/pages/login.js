(function () {
  const { $, esc } = UI;
  UI.hydrateIcons();

  const ROLES = [
    { key: 'student', label: 'Student', icon: 'cap', pick: 'Your name' },
    { key: 'teacher', label: 'Teacher', icon: 'briefcase', pick: 'Your name' },
    { key: 'admin', label: 'Librarian', icon: 'library', pick: 'Librarian account' }
  ];
  let role = ROLES.some(r => r.key === UI.params().get('role')) ? UI.params().get('role') : 'student';

  const current = Auth.current();
  if (current) {
    $('#signed-in').innerHTML = `<div class="alert alert-info">${UI.icon('info')}<div class="grow">You are signed in as <strong style="display:inline">${esc(current.name)}</strong>.
      <a href="${Auth.homeFor(current)}">Continue to your dashboard →</a></div></div>`;
  }

  function drawTabs() {
    $('#role-tabs').innerHTML = ROLES.map(r => `<button type="button" class="role-tab ${r.key === role ? 'active' : ''}" data-role="${r.key}" role="tab" aria-selected="${r.key === role}">${UI.icon(r.icon)}${r.label}</button>`).join('');
  }

  function fillUsers() {
    const cfg = ROLES.find(r => r.key === role);
    $('#user-label').textContent = cfg.pick;
    const select = $('#user');
    if (role === 'student') {
      select.innerHTML = '<option value="">Choose your name…</option>' + Store.classes().map(c =>
        `<optgroup label="Class ${esc(c)}">${Store.members('student').filter(s => s.className === c).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</optgroup>`).join('');
    } else if (role === 'teacher') {
      select.innerHTML = '<option value="">Choose your name…</option>' + Store.members('teacher').map(t => `<option value="${t.id}">${esc(t.name)} — ${esc(t.subject)}</option>`).join('');
    } else {
      select.innerHTML = Store.users().filter(u => u.role === 'admin').map(u => `<option value="${u.id}">${esc(u.name)} — ${esc(u.title)}</option>`).join('');
    }
    $('#login-error').hidden = true;
  }

  $('#role-tabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-role]');
    if (!btn) return;
    role = btn.dataset.role;
    drawTabs();
    fillUsers();
  });

  $('#fill').addEventListener('click', () => { $('#password').value = Auth.PASSWORD; $('#password').focus(); });

  $('#login-form').addEventListener('submit', e => {
    e.preventDefault();
    const res = Auth.login($('#user').value, $('#password').value);
    if (!res.ok) {
      $('#login-error').textContent = res.error;
      $('#login-error').hidden = false;
      return;
    }
    location.href = Auth.homeFor(res.user);
  });

  drawTabs();
  fillUsers();
})();
