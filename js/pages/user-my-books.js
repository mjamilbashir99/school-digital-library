/* "My Books" shared by students and teachers: current loans, history and fines. */
(function () {
  const role = document.body.dataset.role;
  const me = Auth.require([role]);
  if (!me) return;
  UI.mountShell(me, 'my-books');

  const { $ } = UI;
  const loans = Store.loansFor(me.id);
  const current = loans.filter(l => !l.returnDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const history = loans.filter(l => l.returnDate).sort((a, b) => b.returnDate.localeCompare(a.returnDate));
  const fined = loans.filter(l => Store.fineFor(l) > 0).sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  let tab = ['current', 'history', 'fines'].includes(UI.params().get('tab')) ? UI.params().get('tab') : 'current';

  const s = Store.settings();
  $('#rules').textContent = `Borrow up to ${Store.limitFor(me)} books for ${s.loanDays} days. Late returns cost ${UI.money(s.finePerDay)} a day.`;

  UI.tabs($('#tabs'), [
    { key: 'current', label: 'With me now', count: current.length },
    { key: 'history', label: 'History', count: history.length },
    { key: 'fines', label: 'Fines', count: fined.length }
  ], tab, key => { tab = key; render(); });

  function render() {
    const el = $('#panel');
    if (tab === 'current') {
      el.innerHTML = `<div class="card card-flush">${UI.table([
        { label: 'Book', render: l => UI.bookCell(Store.book(l.bookId)) },
        { label: 'Borrowed', render: l => `<span class="nowrap">${UI.fmtDate(l.issueDate)}</span>` },
        { label: 'Due back', render: l => `<span class="nowrap">${UI.fmtDate(l.dueDate)}</span>` },
        { label: 'Status', render: l => { const d = UI.dueInfo(l); return UI.badge(d.text, d.tone); } },
        { label: 'Late fee', cls: 't-right', render: l => Store.fineFor(l) ? `<span style="color:var(--danger);font-weight:600">${UI.money(Store.fineFor(l))}</span>` : '<span class="muted">—</span>' }
      ], current, {
        href: l => UI.bookUrl(l.bookId),
        empty: UI.empty('open', 'No books with you', 'Find something to read in the catalog.', '<a class="btn btn-primary" href="catalog.html">Browse catalog</a>')
      })}</div>
      <p class="hint mt-24">Returns and renewals are handled at the library desk.</p>`;
    } else if (tab === 'history') {
      el.innerHTML = `<div class="card card-flush">${UI.table([
        { label: 'Book', render: l => UI.bookCell(Store.book(l.bookId)) },
        { label: 'Borrowed', render: l => UI.fmtDate(l.issueDate) },
        { label: 'Returned', render: l => UI.fmtDate(l.returnDate) },
        { label: 'On time?', render: l => Store.daysOverdue(l) ? UI.badge(UI.plural(Store.daysOverdue(l), 'day') + ' late', 'warn') : UI.badge('On time', 'success') }
      ], history, { href: l => UI.bookUrl(l.bookId), empty: UI.empty('clock', 'No history yet', 'Books you return will be listed here.') })}</div>`;
    } else {
      const due = Store.finesDue(me.id);
      const paid = loans.filter(l => l.returnDate && l.finePaid).reduce((t, l) => t + (l.fine || 0), 0);
      el.innerHTML = `
        <div class="stats">
          ${UI.stat({ icon: 'wallet', label: 'To pay', value: UI.money(due), sub: due ? 'Pay at the library desk' : 'Nothing owed', tone: due ? 'danger' : 'success' })}
          ${UI.stat({ icon: 'check', label: 'Paid so far', value: UI.money(paid), tone: 'info' })}
        </div>
        <div class="card card-flush">${UI.table([
          { label: 'Book', render: l => UI.bookCell(Store.book(l.bookId)) },
          { label: 'Days late', render: l => Store.daysOverdue(l) },
          { label: 'Amount', render: l => `<span class="strong">${UI.money(Store.fineFor(l))}</span>` },
          { label: 'Status', render: l => !l.returnDate ? UI.badge('Still growing — return the book', 'danger') : l.finePaid ? UI.badge('Paid', 'success') : UI.badge('Unpaid', 'warn') }
        ], fined, { empty: UI.empty('check', 'No fines', 'You have always returned books on time. Well done!') })}</div>`;
    }
  }

  render();
})();
