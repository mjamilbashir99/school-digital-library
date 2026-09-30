(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'members');

  const { $, esc } = UI;
  let tab = UI.params().get('tab') === 'teachers' ? 'teacher' : 'student';

  function drawTabs() {
    UI.tabs($('#tabs'), [
      { key: 'student', label: 'Students', count: Store.members('student').length },
      { key: 'teacher', label: 'Teachers', count: Store.members('teacher').length }
    ], tab, key => { tab = key; setup(); });
  }

  function setup() {
    $('#class-filter').hidden = tab !== 'student';
    $('#class-filter').innerHTML = UI.options(Store.classes().map(c => [c, 'Class ' + c]), '', 'All classes');
    $('#add-member-label').textContent =tab === 'student' ? 'Add student' : 'Add teacher';
    render();
  }

  function render() {
    const q = $('#q').value.trim().toLowerCase();
    const cls = tab === 'student' ? $('#class-filter').value : '';
    const active = Store.activeLoans();
    const rows = Store.members(tab).filter(u =>
      (!q || [u.name, u.roll, u.className, u.subject].join(' ').toLowerCase().includes(q)) &&
      (!cls || u.className === cls)
    ).sort((a, b) => (a.className || '').localeCompare(b.className || '', undefined, { numeric: true }) || a.name.localeCompare(b.name));

    $('#count').textContent = UI.plural(rows.length, tab);
    $('#table').innerHTML = UI.table([
      { label: 'Name', render: u => UI.personCell(u, u.roll) },
      { label: tab === 'student' ? 'Class' : 'Subject', render: u => esc(tab === 'student' ? u.className : u.subject) },
      { label: 'On loan', render: u => {
        const n = active.filter(l => l.memberId === u.id).length;
        return `<span class="strong">${n}</span><span class="muted"> / ${Store.limitFor(u)}</span>`;
      } },
      { label: 'Status', render: u => {
        const late = active.filter(l => l.memberId === u.id && Store.isOverdue(l)).length;
        return late ? UI.badge(`${late} overdue`, 'danger') : UI.badge('Good standing', 'success');
      } },
      { label: 'Fines due', render: u => { const f = Store.finesDue(u.id); return f ? `<span style="color:var(--danger);font-weight:600">${UI.money(f)}</span>` : '<span class="muted">—</span>'; } },
      { label: 'Member since', render: u => `<span class="nowrap">${UI.fmtDate(u.joined)}</span>` }
    ], rows, {
      href: u => UI.memberUrl(u.id),
      empty: UI.empty('users', 'No members found', 'Try another name, roll number or class.')
    });
  }

  $('#q').addEventListener('input', render);
  $('#class-filter').addEventListener('input', render);

  $('#add-member').addEventListener('click', () => {
    const isStudent = tab === 'student';
    UI.formModal({
      title: isStudent ? 'Add a student' : 'Add a teacher',
      submitLabel: 'Add member',
      fields: [
        { name: 'name', label: 'Full name', required: true, full: true },
        isStudent
          ? { name: 'className', label: 'Class', type: 'select', options: Store.classes(), required: true, full: true, hint: 'A library card number is generated automatically.' }
          : { name: 'subject', label: 'Subject', type: 'select', options: ['English', 'Mathematics', 'Science', 'Urdu', 'Computer Science', 'History', 'Geography', 'Islamic Studies', 'Art'], required: true, full: true }
      ],
      onSubmit(data) {
        const res = Store.saveUser(Object.assign({ role: tab }, data));
        UI.toast(`${res.user.name} added · card ${res.user.roll}`);
        drawTabs();
        render();
      }
    });
  });

  drawTabs();
  setup();
})();
