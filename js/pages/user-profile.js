/* Profile shared by students and teachers. */
(function () {
  const role = document.body.dataset.role;
  const me = Auth.require([role]);
  if (!me) return;
  UI.mountShell(me, 'profile');

  const { $, esc } = UI;
  const s = Store.settings();
  const loans = Store.loansFor(me.id);
  const returned = loans.filter(l => l.returnDate);
  const onTime = returned.length ? Math.round(returned.filter(l => !Store.daysOverdue(l)).length / returned.length * 100) : null;

  const subjects = {};
  loans.forEach(l => { const b = Store.book(l.bookId); if (b) subjects[b.subject] = (subjects[b.subject] || 0) + 1; });
  const favourite = Object.entries(subjects).sort((a, b) => b[1] - a[1])[0];

  $('#profile').innerHTML = `
    <div class="profile-head">
      ${UI.avatar(me, 'lg')}
      <div class="grow">
        <div class="eyebrow">${UI.ROLE_LABEL[me.role]}</div>
        <h1>${esc(me.name)}</h1>
        <div class="meta"><span>${esc(UI.memberDetail(me))}</span>·<span>${esc(s.schoolName)}</span></div>
      </div>
    </div>`;

  $('#details').innerHTML = `<dl class="kv">
    <dt>Library card</dt><dd>${esc(me.roll)}</dd>
    ${me.role === 'student' ? `<dt>Class</dt><dd>${esc(me.className)}</dd>` : `<dt>Subject</dt><dd>${esc(me.subject)}</dd>`}
    <dt>Member since</dt><dd>${UI.fmtDate(me.joined)}</dd>
    <dt>Borrowing limit</dt><dd>${UI.plural(Store.limitFor(me), 'book')} at a time</dd>
    <dt>Loan period</dt><dd>${s.loanDays} days</dd>
    <dt>Late fee</dt><dd>${UI.money(s.finePerDay)} per day</dd>
  </dl>`;

  $('#stats').innerHTML = [
    UI.stat({ icon: 'book', label: 'Books borrowed', value: loans.length, sub: 'Since you joined' }),
    UI.stat({ icon: 'check', label: 'Returned on time', value: onTime == null ? '—' : onTime + '%', tone: 'success', sub: returned.length ? `${UI.plural(returned.length, 'return')}` : 'No returns yet' }),
    UI.stat({ icon: 'star', label: 'Favourite subject', value: favourite ? favourite[0] : '—', tone: 'gold', sub: favourite ? UI.plural(favourite[1], 'book') : 'Borrow a book to find out' }),
    me.role === 'student'
      ? UI.stat({ icon: 'list', label: 'Reading lists for you', value: Store.listsForClass(me.className).length, tone: 'info', sub: `Shared with Class ${me.className}`, href: 'dashboard.html' })
      : UI.stat({ icon: 'list', label: 'Lists you shared', value: Store.listsBy(me.id).length, tone: 'info', sub: 'With your classes', href: 'reading-lists.html' })
  ].join('');
})();
