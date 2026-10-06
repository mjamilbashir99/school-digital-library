/* Book detail — shared by every role, with role-specific actions. */
(function () {
  const me = Auth.require();
  if (!me) return;
  const isAdmin = me.role === 'admin';
  UI.mountShell(me, isAdmin ? 'books' : 'catalog');

  const { $, esc } = UI;
  const root = $('#book-page');
  const book = Store.book(UI.params().get('id'));
  const catalogUrl = UI.url(isAdmin ? 'admin/books.html' : me.role + '/catalog.html');

  if (!book) {
    root.innerHTML = UI.empty('book', 'Book not found', 'It may have been removed from the catalog.', `<a class="btn btn-primary" href="${catalogUrl}">Back to catalog</a>`);
    return;
  }
  document.title = `${book.title} · Digital Library`;

  function patronActions() {
    const loan = Store.activeLoans().find(l => l.memberId === me.id && l.bookId === book.id);
    if (loan) {
      const due = UI.dueInfo(loan);
      return `<div class="alert ${due.tone === 'danger' ? '' : 'alert-info'}">${UI.icon(due.tone === 'danger' ? 'alert' : 'open')}<div><strong>This book is with you</strong>Due back ${UI.fmtDate(loan.dueDate)} — ${esc(due.text.toLowerCase())}.</div></div>`;
    }
    const res = Store.pendingReservations(book.id).find(r => r.memberId === me.id);
    if (res) {
      const pos = Store.queuePosition(res);
      const ready = Store.available(book.id) >= pos;
      return `<div class="alert alert-gold">${UI.icon('bookmark')}<div class="grow"><strong>${ready ? 'Your copy is ready' : `You are #${pos} in the queue`}</strong>${ready ? 'Collect it from the library desk.' : `Reserved on ${UI.fmtDate(res.date)}. We will hold the next returned copy for you.`}</div>
        <button class="btn btn-ghost btn-sm" data-cancel="${res.id}">Cancel</button></div>`;
    }
    const status = Store.bookStatus(book.id);
    if (status === 'available') {
      return `<div class="alert alert-success">${UI.icon('check')}<div><strong>On the shelf now</strong>Find it at shelf ${esc(book.shelf)} and bring it to the library desk with your card.</div></div>`;
    }
    const next = Store.activeLoans().filter(l => l.bookId === book.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    const queue = Store.pendingReservations(book.id).length;
    return `<div class="alert alert-gold">${UI.icon('clock')}<div class="grow"><strong>${status === 'onhold' ? 'Copies are on hold for reservations' : 'All copies are on loan'}</strong>
      ${next ? `Next copy due back ${UI.fmtDate(next.dueDate)}. ` : ''}${queue ? UI.plural(queue, 'person is', 'people are') + ' already waiting.' : 'No one is waiting yet.'}</div></div>
      <div class="row"><button class="btn btn-primary" data-reserve>${UI.icon('bookmark')}Reserve this book</button></div>`;
  }

  function adminActions() {
    return `<div class="row">
      <a class="btn btn-primary" href="${UI.url('admin/issue-return.html?book=' + book.id)}">${UI.icon('repeat')}Issue this book</a>
      <a class="btn btn-outline" href="${UI.url('admin/books.html?edit=' + book.id)}">${UI.icon('edit')}Edit details</a>
    </div>`;
  }

  function adminPanels() {
    const loans = Store.loansForBook(book.id);
    const active = loans.filter(l => !l.returnDate);
    const past = loans.filter(l => l.returnDate).sort((a, b) => b.returnDate.localeCompare(a.returnDate)).slice(0, 8);
    const queue = Store.pendingReservations(book.id);
    return `<div class="grid grid-2 section">
      <section class="card card-flush"><div class="card-head"><h2>Copies on loan</h2><span class="small muted">${active.length} of ${book.copies}</span></div>
        ${UI.table([
          { label: 'Member', render: l => UI.personCell(Store.user(l.memberId)) },
          { label: 'Due', render: l => { const d = UI.dueInfo(l); return `<div class="nowrap">${UI.fmtDate(l.dueDate)}</div>${UI.badge(d.text, d.tone)}`; } }
        ], active, { href: l => UI.memberUrl(l.memberId), empty: UI.empty('check', 'All copies are on the shelf', '') })}
      </section>
      <section class="card card-flush"><div class="card-head"><h2>Reservation queue</h2><span class="small muted">${UI.plural(queue.length, 'person', 'people')}</span></div>
        ${UI.table([
          { label: '#', render: r => Store.queuePosition(r) },
          { label: 'Member', render: r => UI.personCell(Store.user(r.memberId)) },
          { label: 'Since', render: r => UI.fmtDate(r.date) }
        ], queue, { href: r => UI.memberUrl(r.memberId), empty: UI.empty('bookmark', 'No one is waiting', '') })}
      </section>
    </div>
    <section class="card card-flush section"><div class="card-head"><h2>Recent borrowers</h2></div>
      ${UI.table([
        { label: 'Member', render: l => UI.personCell(Store.user(l.memberId)) },
        { label: 'Borrowed', render: l => UI.fmtDate(l.issueDate) },
        { label: 'Returned', render: l => UI.fmtDate(l.returnDate) },
        { label: 'Fine', render: l => l.fine ? UI.money(l.fine) : '<span class="muted">—</span>' }
      ], past, { href: l => UI.memberUrl(l.memberId), empty: UI.empty('clock', 'Not borrowed yet', '') })}
    </section>`;
  }

  function render() {
    const lists = Store.listsWithBook(book.id);
    const related = Store.books().filter(b => b.subject === book.subject && b.id !== book.id).slice(0, 6);
    const count = Store.borrowCounts()[book.id] || 0;

    root.innerHTML = `
      <a class="link-back" href="${catalogUrl}">${UI.icon('arrowLeft')}Back to ${isAdmin ? 'books' : 'catalog'}</a>
      <section class="card" style="padding:28px">
        <div class="book-hero">
          ${UI.cover(book, 'lg')}
          <div>
            <div class="eyebrow">${esc(book.subject)}</div>
            <h1>${esc(book.title)}</h1>
            <div class="author">by ${esc(book.author)}</div>
            <div class="badges">${isAdmin ? UI.stockBadge(book) : UI.availBadge(book)}${UI.badge(UI.levelLabel(book.level), 'info')}${count ? UI.badge(`Borrowed ${UI.plural(count, 'time')}`, 'neutral') : ''}</div>
            ${book.description ? `<p class="desc">${esc(book.description)}</p>` : ''}
            <dl class="kv">
              <dt>Shelf</dt><dd>${esc(book.shelf)}</dd>
              <dt>Accession no.</dt><dd>${esc(book.accession)}</dd>
              <dt>Published</dt><dd>${book.year || '—'}</dd>
              <dt>Copies</dt><dd>${Store.available(book.id)} on the shelf · ${book.copies} total</dd>
            </dl>
            <div class="book-actions">${isAdmin ? adminActions() : patronActions()}</div>
          </div>
        </div>
      </section>
      ${lists.length ? `<section class="card section"><div class="card-head"><h2>On reading lists</h2></div><ul class="list">${lists.map(l => {
        const t = Store.user(l.teacherId);
        return `<li class="list-item"><span class="stat-icon gold" style="width:36px;height:36px">${UI.icon('list')}</span><div class="grow"><div class="title">${esc(l.title)}</div><div class="sub">Class ${esc(l.className)} · ${t ? esc(t.name) : ''}</div></div></li>`;
      }).join('')}</ul></section>` : ''}
      ${isAdmin ? adminPanels() : ''}
      ${related.length ? `<section class="section"><div class="card-head"><h2>More in ${esc(book.subject)}</h2></div><div class="mini-shelf">${related.map(UI.miniBook).join('')}</div></section>` : ''}`;
  }

  root.addEventListener('click', e => {
    if (e.target.closest('[data-reserve]')) {
      const res = Store.reserve(me.id, book.id);
      UI.toast(res.ok ? `Reserved! You are #${res.position} in the queue.` : res.error, res.ok ? 'success' : 'error');
      render();
    }
    const cancel = e.target.closest('[data-cancel]');
    if (cancel) {
      Store.cancelReservation(cancel.dataset.cancel);
      UI.toast('Reservation cancelled');
      render();
    }
  });

  render();
})();
