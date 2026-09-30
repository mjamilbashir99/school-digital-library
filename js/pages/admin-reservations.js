(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'reservations');

  const { $, esc } = UI;
  let tab = 'pending';

  function drawTabs() {
    const all = Store.reservations();
    const count = s => all.filter(r => r.status === s).length;
    UI.tabs($('#tabs'), [
      { key: 'pending', label: 'Waiting', count: count('pending') },
      { key: 'fulfilled', label: 'Issued', count: count('fulfilled') },
      { key: 'cancelled', label: 'Cancelled', count: count('cancelled') }
    ], tab, key => { tab = key; render(); });
  }

  function render() {
    const rows = tab === 'pending'
      ? Store.pendingReservations()
      : Store.reservations().filter(r => r.status === tab).sort((a, b) => b.date.localeCompare(a.date));

    const cols = [
      { label: 'Book', render: r => UI.bookCell(Store.book(r.bookId) || { title: 'Removed book', author: '', subject: '' }) },
      { label: 'Reserved by', render: r => UI.personCell(Store.user(r.memberId)) },
      { label: 'Reserved on', render: r => `<span class="nowrap">${UI.fmtDate(r.date)}</span>` }
    ];
    if (tab === 'pending') {
      cols.push(
        { label: 'Queue', render: r => `#${Store.queuePosition(r)}` },
        { label: 'Copy', render: r => isReady(r) ? UI.badge('Ready to issue', 'success') : UI.badge(nextDue(r.bookId), 'neutral') },
        { label: '<span class="sr-only">Actions</span>', cls: 'actions-cell', render: r => `
          <button class="btn btn-primary btn-sm" data-fulfil="${r.id}" ${isReady(r) ? '' : 'disabled title="No copy on the shelf yet"'}>Issue</button>
          <button class="btn btn-ghost btn-sm" data-cancel="${r.id}">Cancel</button>` }
      );
    }
    $('#table').innerHTML = UI.table(cols, rows, {
      href: r => UI.bookUrl(r.bookId),
      empty: UI.empty('bookmark', tab === 'pending' ? 'No one is waiting' : 'Nothing here', tab === 'pending' ? 'Students and teachers can reserve a book from the catalog when all copies are out.' : '')
    });
  }

  // A reservation is ready when there is a copy on the shelf for its place in the queue.
  function isReady(r) { return Store.available(r.bookId) >= Store.queuePosition(r); }

  function nextDue(bookId) {
    const next = Store.activeLoans().filter(l => l.bookId === bookId).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    return next ? `Next back ${UI.fmtDate(next.dueDate)}` : 'Waiting';
  }

  $('#table').addEventListener('click', e => {
    const f = e.target.closest('[data-fulfil]');
    const c = e.target.closest('[data-cancel]');
    if (f) {
      const res = Store.fulfilReservation(f.dataset.fulfil);
      if (!res.ok) return UI.toast(res.error, 'error');
      UI.toast(`Issued “${res.book.title}” to ${res.member.name}. Due ${UI.fmtDate(res.loan.dueDate)}.`);
    }
    if (c) {
      const r = Store.reservations().find(x => x.id === c.dataset.cancel);
      UI.confirm({
        title: 'Cancel reservation?',
        message: `${esc(Store.user(r.memberId).name)} will lose their place in the queue for <strong>${esc(Store.book(r.bookId).title)}</strong>.`,
        confirmLabel: 'Cancel reservation',
        danger: true,
        onConfirm() {
          Store.cancelReservation(r.id);
          UI.toast('Reservation cancelled');
          drawTabs(); render(); UI.refreshNav(me);
        }
      });
      return;
    }
    if (f) { drawTabs(); render(); UI.refreshNav(me); }
  });

  drawTabs();
  render();
})();
