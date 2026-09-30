(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'reports');

  const { $, esc } = UI;
  const D = Store.D;
  const today = D.today();
  const monthAgo = D.add(today, -30);
  const loans = Store.loans();

  $('#generated').textContent = `Generated ${UI.fmtDate(today)} · ${Store.settings().schoolName}`;
  $('#print').addEventListener('click', () => window.print());

  const issued30 = loans.filter(l => l.issueDate >= monthAgo).length;
  const returned30 = loans.filter(l => l.returnDate && l.returnDate >= monthAgo).length;
  const returnedAll = loans.filter(l => l.returnDate);
  const onTime = returnedAll.length ? Math.round(returnedAll.filter(l => Store.daysOverdue(l) === 0).length / returnedAll.length * 100) : 100;
  const s = Store.stats();

  $('#stats').innerHTML = [
    UI.stat({ icon: 'repeat', label: 'Issued · last 30 days', value: issued30, sub: `${returned30} returned in the same period`, tone: 'gold' }),
    UI.stat({ icon: 'check', label: 'Returned on time', value: onTime + '%', sub: `Across ${UI.plural(returnedAll.length, 'return')}`, tone: 'success' }),
    UI.stat({ icon: 'alert', label: 'Overdue now', value: s.overdue, sub: `${s.issued} books on loan`, tone: 'danger' }),
    UI.stat({ icon: 'wallet', label: 'Fines collected', value: UI.money(s.collected), sub: `${UI.money(s.finesDue)} outstanding`, tone: 'info' })
  ].join('');

  // Overdue
  const overdue = Store.activeLoans().filter(l => Store.isOverdue(l)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  $('#overdue').innerHTML = UI.table([
    { label: 'Member', render: l => UI.personCell(Store.user(l.memberId)) },
    { label: 'Book', render: l => `<div class="cell-title">${esc(Store.book(l.bookId).title)}</div><div class="cell-sub">${esc(Store.book(l.bookId).accession)}</div>` },
    { label: 'Due', render: l => `<span class="nowrap">${UI.fmtDate(l.dueDate)}</span>` },
    { label: 'Late', render: l => UI.badge(UI.plural(Store.daysOverdue(l), 'day'), 'danger') },
    { label: 'Fine so far', cls: 't-right', render: l => `<span class="strong">${UI.money(Store.fineFor(l))}</span>` }
  ], overdue, { href: l => UI.memberUrl(l.memberId), empty: UI.empty('check', 'No overdue books', 'Every loan is within its due date.') });

  // Bar chart helper
  const bars = (rows, label) => {
    const max = rows.length ? rows[0][1] : 1;
    return rows.map(([name, n]) => `<div class="bar-row"><span class="label" title="${esc(name)}">${esc(name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(n / max) * 100}%"></div></div><span class="value" title="${label}">${n}</span></div>`).join('');
  };

  // Most borrowed
  const counts = Store.borrowCounts();
  const top = Object.entries(counts).map(([id, n]) => [Store.book(id), n]).filter(x => x[0]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  $('#popular').innerHTML = bars(top.map(([b, n]) => [b.title, n]), 'loans');

  // By class
  const byClass = {};
  Store.classes().forEach(c => { byClass['Class ' + c] = 0; });
  let teacherLoans = 0;
  loans.forEach(l => {
    const m = Store.user(l.memberId);
    if (!m) return;
    if (m.role === 'student') byClass['Class ' + m.className] = (byClass['Class ' + m.className] || 0) + 1;
    else teacherLoans++;
  });
  const classRows = Object.entries(byClass).sort((a, b) => b[1] - a[1]);
  if (teacherLoans) classRows.push(['Teachers', teacherLoans]);
  classRows.sort((a, b) => b[1] - a[1]);
  $('#by-class').innerHTML = bars(classRows, 'loans');

  // Outstanding fines by member
  const owing = Store.members().map(m => [m, Store.finesDue(m.id)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  $('#fines').innerHTML = UI.table([
    { label: 'Member', render: ([m]) => UI.personCell(m) },
    { label: 'Amount', cls: 't-right', render: ([, amt]) => `<span class="strong" style="color:var(--danger)">${UI.money(amt)}</span>` }
  ], owing, { href: ([m]) => UI.memberUrl(m.id), empty: UI.empty('wallet', 'No fines outstanding', '') });
})();
