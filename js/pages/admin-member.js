(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'members');

  const { $, esc } = UI;
  const member = Store.user(UI.params().get('id'));
  const root = $('#member-page');

  if (!member || member.role === 'admin') {
    root.innerHTML = UI.empty('user', 'Member not found', 'This member may have been removed.', '<a class="btn btn-primary" href="members.html">Back to members</a>');
    return;
  }
  document.title = `${member.name} · Greenfield Library`;

  function render() {
    const loans = Store.loansFor(member.id);
    const active = loans.filter(l => !l.returnDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const history = loans.filter(l => l.returnDate).sort((a, b) => b.returnDate.localeCompare(a.returnDate));
    const reservations = Store.pendingReservations().filter(r => r.memberId === member.id);
    const finesDue = Store.finesDue(member.id);
    const settled = loans.filter(l => l.returnDate && !l.finePaid).reduce((s, l) => s + l.fine, 0);
    const overdue = active.filter(l => Store.isOverdue(l)).length;
    const limit = Store.limitFor(member);

    root.innerHTML = `
      <a class="link-back" href="members.html${member.role === 'teacher' ? '?tab=teachers' : ''}">${UI.icon('arrowLeft')}All members</a>
      <section class="card">
        <div class="profile-head">
          ${UI.avatar(member, 'lg')}
          <div class="grow">
            <div class="eyebrow">${UI.ROLE_LABEL[member.role]}</div>
            <h1>${esc(member.name)}</h1>
            <div class="meta"><span>${esc(UI.memberDetail(member))}</span>·<span>Card ${esc(member.roll)}</span>·<span>Member since ${UI.fmtDate(member.joined)}</span></div>
          </div>
          <div class="actions" style="display:flex;gap:10px;flex-wrap:wrap">
            ${settled ? `<button class="btn btn-outline" id="collect">${UI.icon('wallet')}Collect ${UI.money(settled)}</button>` : ''}
            <a class="btn btn-primary" href="issue-return.html?member=${member.id}">${UI.icon('repeat')}Issue a book</a>
          </div>
        </div>
      </section>

      <section class="stats mt-24">
        ${UI.stat({ icon: 'open', label: 'On loan', value: `${active.length} / ${limit}`, sub: `${limit - active.length} more allowed` })}
        ${UI.stat({ icon: 'alert', label: 'Overdue', value: overdue, sub: overdue ? 'Send a reminder' : 'All on time', tone: 'danger' })}
        ${UI.stat({ icon: 'book', label: 'Books borrowed', value: loans.length, sub: 'All time', tone: 'success' })}
        ${UI.stat({ icon: 'wallet', label: 'Fines due', value: UI.money(finesDue), sub: finesDue > settled ? `${UI.money(finesDue - settled)} still accruing` : 'Pay at the desk', tone: 'gold' })}
      </section>

      <div class="grid grid-main">
        <section class="card card-flush">
          <div class="card-head"><h2>Books on loan</h2></div>
          ${UI.table([
            { label: 'Book', render: l => UI.bookCell(Store.book(l.bookId)) },
            { label: 'Issued', render: l => `<span class="nowrap">${UI.fmtDate(l.issueDate)}</span>` },
            { label: 'Due', render: l => { const d = UI.dueInfo(l); return `<div class="nowrap">${UI.fmtDate(l.dueDate)}</div>${UI.badge(d.text, d.tone)}`; } },
            { label: '<span class="sr-only">Actions</span>', cls: 'actions-cell', render: l => `<button class="btn btn-outline btn-sm" data-return="${l.id}">Return</button>` }
          ], active, { href: l => UI.bookUrl(l.bookId), empty: UI.empty('open', 'No books on loan', '') })}
        </section>
        <section class="card">
          <div class="card-head"><h2>Reservations</h2></div>
          ${reservations.length ? `<ul class="list">${reservations.map(r => {
            const b = Store.book(r.bookId);
            return `<li class="list-item">${UI.cover(b, 'sm')}<div class="grow"><div class="title truncate">${esc(b.title)}</div><div class="sub">#${Store.queuePosition(r)} in queue · since ${UI.fmtDate(r.date)}</div></div>
              <button class="icon-btn sm danger" data-cancel="${r.id}" title="Cancel reservation" aria-label="Cancel reservation">${UI.icon('x')}</button></li>`;
          }).join('')}</ul>` : '<p class="muted small mb-0">No active reservations.</p>'}
        </section>
      </div>

      <section class="card card-flush section">
        <div class="card-head"><h2>Borrowing history</h2><span class="small muted">${UI.plural(history.length, 'return')}</span></div>
        ${UI.table([
          { label: 'Book', render: l => UI.bookCell(Store.book(l.bookId)) },
          { label: 'Issued', render: l => UI.fmtDate(l.issueDate) },
          { label: 'Returned', render: l => UI.fmtDate(l.returnDate) },
          { label: 'Late', render: l => { const d = Store.daysOverdue(l); return d ? UI.plural(d, 'day') : '<span class="muted">On time</span>'; } },
          { label: 'Fine', render: l => l.fine ? `${UI.money(l.fine)} ${l.finePaid ? UI.badge('Paid', 'success') : UI.badge('Unpaid', 'danger')}` : '<span class="muted">—</span>' }
        ], history, { href: l => UI.bookUrl(l.bookId), empty: UI.empty('clock', 'No history yet', 'Returned books will be listed here.') })}
      </section>`;
  }

  root.addEventListener('click', e => {
    const ret = e.target.closest('[data-return]');
    const cancel = e.target.closest('[data-cancel]');
    if (e.target.closest('#collect')) {
      const res = Store.payFines(member.id);
      UI.toast(res.ok ? `Collected ${UI.money(res.amount)} from ${member.name}` : res.error, res.ok ? 'success' : 'error');
      render();
    }
    if (ret) {
      const loan = Store.loans().find(l => l.id === ret.dataset.return);
      const fine = Store.fineFor(loan);
      UI.confirm({
        title: 'Check in this book?',
        message: `<strong>${esc(Store.book(loan.bookId).title)}</strong>` + (fine ? `<br>A late fine of <strong>${UI.money(fine)}</strong> will be added.` : '<br>It is on time — no fine.'),
        confirmLabel: 'Confirm return',
        onConfirm() {
          const res = Store.returnLoan(loan.id);
          UI.toast(`“${res.book.title}” returned` + (res.fine ? ` · fine ${UI.money(res.fine)}` : ''));
          if (res.nextMember) setTimeout(() => UI.toast(`Hold this copy for ${res.nextMember.name} (reservation).`, 'info'), 400);
          render();
          UI.refreshNav(me);
        }
      });
    }
    if (cancel) {
      Store.cancelReservation(cancel.dataset.cancel);
      UI.toast('Reservation cancelled');
      render();
      UI.refreshNav(me);
    }
  });

  render();
})();
