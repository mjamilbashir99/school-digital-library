/* Dashboard shared by students and teachers. */
(function () {
  const role = document.body.dataset.role;
  const me = Auth.require([role]);
  if (!me) return;
  UI.mountShell(me, 'dashboard');

  const { $, esc } = UI;

  function render() {
    const active = Store.activeLoans().filter(l => l.memberId === me.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const overdue = active.filter(l => Store.isOverdue(l));
    const dueSoon = active.filter(l => { const d = UI.dueInfo(l).days; return d >= 0 && d <= 7; });
    const fines = Store.finesDue(me.id);
    const limit = Store.limitFor(me);
    const reservations = Store.pendingReservations().filter(r => r.memberId === me.id);

    $('#welcome').innerHTML = `
      <div>
        <h1>${UI.greeting()}, ${esc(UI.firstName(me.name))}</h1>
        <p>${esc(UI.memberDetail(me))} · Library card ${esc(me.roll)}</p>
      </div>
      <a class="btn btn-gold" href="catalog.html">${UI.icon('search')}Find a book</a>`;

    $('#alert').innerHTML = overdue.length ? `
      <div class="alert">${UI.icon('alert')}<div class="grow"><strong>${UI.plural(overdue.length, 'book is', 'books are')} overdue</strong>
      Please return ${overdue.length === 1 ? 'it' : 'them'} to the library desk. A late fee of ${UI.money(Store.settings().finePerDay)} is added each day.</div>
      <a class="btn btn-danger-outline btn-sm" href="my-books.html">View</a></div>` : '';

    $('#stats').innerHTML = [
      UI.stat({ icon: 'open', label: 'Books with me', value: `${active.length} / ${limit}`, sub: active.length < limit ? `You can borrow ${limit - active.length} more` : 'Borrowing limit reached', href: 'my-books.html' }),
      UI.stat({ icon: 'clock', label: 'Due this week', value: dueSoon.length, sub: dueSoon[0] ? `Next: ${UI.fmtDate(dueSoon[0].dueDate)}` : 'Nothing due soon', tone: 'gold', href: 'my-books.html' }),
      UI.stat({ icon: 'bookmark', label: 'Reservations', value: reservations.length, sub: reservations.length ? 'Waiting for a copy' : 'None active', tone: 'info' }),
      UI.stat({ icon: 'wallet', label: 'Fines due', value: UI.money(fines), sub: fines ? 'Pay at the library desk' : 'All clear', tone: fines ? 'danger' : 'success', href: 'my-books.html?tab=fines' })
    ].join('');

    const loanDays = Store.settings().loanDays;
    $('#loans').innerHTML = active.length ? `<div class="loan-cards">${active.map(l => {
      const b = Store.book(l.bookId);
      const due = UI.dueInfo(l);
      const elapsed = Math.min(100, Math.max(4, (Store.D.diff(l.issueDate, Store.D.today()) / loanDays) * 100));
      return `<div class="loan-card">${UI.cover(b, 'md')}
        <div class="grow">
          <div class="title"><a href="${UI.bookUrl(b.id)}">${esc(b.title)}</a></div>
          <div class="sub">${esc(b.author)}</div>
          <div class="due-row"><span class="muted">Due ${UI.fmtDate(l.dueDate)}</span>${UI.badge(due.text, due.tone)}</div>
          <div class="progress ${due.tone === 'danger' ? 'danger' : due.tone === 'warn' ? 'warn' : ''}"><span style="width:${elapsed}%"></span></div>
        </div></div>`;
    }).join('')}</div>` : UI.empty('open', 'No books with you right now', 'Browse the catalog, then collect your book from the library desk.', '<a class="btn btn-primary" href="catalog.html">Browse catalog</a>');

    $('#reservations').innerHTML = reservations.length ? `<ul class="list">${reservations.map(r => {
      const b = Store.book(r.bookId);
      const pos = Store.queuePosition(r);
      const ready = Store.available(b.id) >= pos;
      return `<li class="list-item">${UI.cover(b, 'sm')}
        <div class="grow"><div class="title truncate"><a href="${UI.bookUrl(b.id)}" style="color:inherit">${esc(b.title)}</a></div>
        <div class="sub">${ready ? 'A copy is waiting for you at the desk' : `#${pos} in the queue · since ${UI.fmtDate(r.date)}`}</div></div>
        ${ready ? UI.badge('Ready', 'success') : ''}
        <button class="icon-btn sm danger" data-cancel="${r.id}" title="Cancel reservation" aria-label="Cancel reservation for ${esc(b.title)}">${UI.icon('x')}</button>
      </li>`;
    }).join('')}</ul>` : '<p class="muted small mb-0">When every copy of a book is out, reserve it from the catalog and you will be next in line.</p>';

    renderLists();
    renderNew();
    UI.refreshNav(me);
  }

  function listCard(list, showClass) {
    const teacher = Store.user(list.teacherId);
    const books = list.bookIds.map(id => Store.book(id)).filter(Boolean);
    return `<article class="reading-list">
      <div class="reading-list-head">
        <div><h3>${esc(list.title)}</h3><div class="by">${showClass ? `Class ${esc(list.className)} · ` : ''}${teacher ? 'from ' + esc(teacher.name) : ''} · ${UI.fmtDate(list.created)}</div></div>
        ${UI.badge(UI.plural(books.length, 'book'), 'gold')}
      </div>
      ${list.note ? `<p class="note">${esc(list.note)}</p>` : ''}
      <div class="mini-shelf">${books.map(UI.miniBook).join('')}</div>
    </article>`;
  }

  function renderLists() {
    if (role === 'student') {
      const lists = Store.listsForClass(me.className).sort((a, b) => b.created.localeCompare(a.created));
      $('#lists-title').textContent = 'Recommended by your teachers';
      $('#lists').innerHTML = lists.length
        ? lists.map(l => listCard(l, false)).join('')
        : UI.empty('list', 'No reading lists yet', `When a teacher shares a list with Class ${me.className}, it appears here.`);
    } else {
      const lists = Store.listsBy(me.id).sort((a, b) => b.created.localeCompare(a.created));
      $('#lists-title').textContent = 'Your reading lists';
      $('#lists-link').hidden = false;
      $('#lists').innerHTML = lists.length
        ? lists.slice(0, 2).map(l => listCard(l, true)).join('')
        : UI.empty('list', 'You have not shared a reading list', 'Pick books for a class and they will see them on their dashboard.', '<a class="btn btn-primary" href="reading-lists.html">Create a reading list</a>');
    }
  }

  function renderNew() {
    const books = Store.books().slice().sort((a, b) => b.added.localeCompare(a.added)).slice(0, 6);
    $('#new').innerHTML = `<div class="mini-shelf">${books.map(UI.miniBook).join('')}</div>`;
  }

  $('#reservations').addEventListener('click', e => {
    const btn = e.target.closest('[data-cancel]');
    if (!btn) return;
    const res = Store.cancelReservation(btn.dataset.cancel);
    UI.toast(res.ok ? 'Reservation cancelled' : res.error, res.ok ? 'success' : 'error');
    render();
  });

  render();
})();
