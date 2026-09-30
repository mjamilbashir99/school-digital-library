(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'settings');

  const { $ } = UI;
  const form = $('#settings-form');
  const fields = ['schoolName', 'loanDays', 'finePerDay', 'maxStudent', 'maxTeacher'];

  function fill() {
    const s = Store.settings();
    fields.forEach(f => { form.elements[f].value = s[f]; });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = {};
    for (const f of fields) {
      const raw = form.elements[f].value.trim();
      if (f === 'schoolName') { values[f] = raw || 'Greenfield Public School'; continue; }
      const n = Number(raw);
      if (!Number.isInteger(n) || n < (f === 'finePerDay' ? 0 : 1)) {
        UI.toast('Please enter whole numbers (loan days and limits must be at least 1).', 'error');
        form.elements[f].focus();
        return;
      }
      values[f] = n;
    }
    Store.saveSettings(values);
    UI.toast('Settings saved. New loans will use these rules.');
  });

  $('#librarian').innerHTML = `${UI.avatar(me, 'lg')}<div><div class="eyebrow">Signed in</div><h2 class="mb-0">${UI.esc(me.name)}</h2><div class="muted small">${UI.esc(me.title)} · since ${UI.fmtDate(me.joined)}</div></div>`;

  $('#reset').addEventListener('click', () => {
    UI.confirm({
      title: 'Reset all demo data?',
      message: 'Every book, member, loan, reservation and reading list goes back to the original sample data. Changes you have made will be lost.',
      confirmLabel: 'Reset data',
      danger: true,
      onConfirm() {
        Store.reset();
        UI.toast('Demo data restored');
        setTimeout(() => location.reload(), 700);
      }
    });
  });

  fill();
})();
