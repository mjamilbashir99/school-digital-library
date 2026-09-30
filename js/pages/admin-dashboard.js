(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'dashboard');

  const { $, esc } = UI;

  $('#today').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#greeting').textContent = `${UI.greeting()}, ${UI.firstName(me.name)}`;

  const s = Store.stats();
  const pct = s.copies ? Math.round((s.issued / s.copies) * 100) : 0;
  $('#stats').innerHTML = [
    UI.stat({ icon: 'book', label: 'Book titles', value: s.titles, sub: `${s.copies} copies in the collection`, href: 'books.html' }),
    UI.stat({ icon: 'repeat', label: 'On loan now', value: s.issued, sub: `${pct}% of all copies`, tone: 'gold', href: 'issue-return.html' }),
    UI.stat({ icon: 'alert', label: 'Overdue', value: s.overdue, sub: s.overdue ? 'Need a reminder' : 'Everything is on time', tone: 'danger', href: 'reports.html' }),
    UI.stat({ icon: 'users', label: 'Members', value: s.students + s.teachers, sub: `${s.students} students · ${s.teachers} teachers`, tone: 'success', href: 'members.html' }),
    UI.stat({ icon: 'wallet', label: 'Fines outstanding', value: UI.money(s.finesDue), sub: `${UI.money(s.collected)} collected so far`, tone: 'info', href: 'reports.html' })
  ].join('');

  // Overdue loans, worst first
  const overdue = Store.activeLoans().filter(l => Store.isOverdue(l)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  $('#overdue').innerHTML = overdue.length ? `<ul class="list">${overdue.slice(0, 6).map(l => {
    const book = Store.book(l.bookId), member = Store.user(l.memberId);
    return `<li class="list-item">
      ${UI.cover(book, 'sm')}
      <div class="grow">
        <div class="title truncate"><a href="${UI.bookUrl(book.id)}" style="color:inherit">${esc(book.title)}</a></div>
        <div class="sub"><a href="${UI.memberUrl(member.id)}">${esc(member.name)}</a> · ${esc(UI.memberDetail(member))} · fine ${UI.money(Store.fineFor(l))}</div>
      </div>
      ${UI.badge(UI.dueInfo(l).text, 'danger')}
      <a class="btn btn-outline btn-sm" href="issue-return.html?member=${member.id}">Return</a>
    </li>`;
  }).join('')}</ul>` : UI.empty('check', 'No overdue books', 'Every book on loan is within its due date.');

  // Activity feed
  const activity = Store.activity().slice(0, 8);
  $('#activity').innerHTML = activity.map(a => `
    <li class="list-item"><span class="dot ${a.type}"></span>
      <div class="grow"><div class="small">${esc(a.text)}</div><div class="sub">${UI.fmtTime(a.at)}</div></div>
    </li>`).join('') || '<li class="muted small">No activity yet.</li>';

  // Borrowing by subject (all loans)
  const bySubject = {};
  Store.loans().forEach(l => {
    const book = Store.book(l.bookId);
    if (book) bySubject[book.subject] = (bySubject[book.subject] || 0) + 1;
  });
  const rows = Object.entries(bySubject).sort((a, b) => b[1] - a[1]);
  const max = rows.length ? rows[0][1] : 1;
  $('#subjects').innerHTML = rows.map(([subject, n]) => `
    <div class="bar-row"><span class="label">${esc(subject)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(n / max) * 100}%"></div></div>
      <span class="value">${n}</span></div>`).join('');

  // Reservation queue
  const queue = Store.pendingReservations();
  $('#queue').innerHTML = queue.length ? `<ul class="list">${queue.slice(0, 5).map(r => {
    const book = Store.book(r.bookId), member = Store.user(r.memberId);
    const ready = Store.available(book.id) >= Store.queuePosition(r);
    return `<li class="list-item">${UI.avatar(member)}
      <div class="grow"><div class="title">${esc(member.name)}</div><div class="sub truncate">${esc(book.title)} · since ${UI.fmtDate(r.date)}</div></div>
      ${ready ? UI.badge('Copy ready', 'success') : UI.badge('Waiting', 'neutral')}
    </li>`;
  }).join('')}</ul>` : UI.empty('bookmark', 'No reservations', 'When a member reserves a book that is out, it shows up here.');
})();
