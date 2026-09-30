(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'issue-return');

  const { $, esc } = UI;
  const params = UI.params();
  const settings = Store.settings();
  let member = Store.user(params.get('member'));
  let book = Store.book(params.get('book'));
  if (member && member.role === 'admin') member = null;

  $('#loan-rule').textContent = `${settings.loanDays}-day loans · ${UI.money(settings.finePerDay)}/day late fee`;

  /* A search box that turns into a "selected" card once something is picked. */
  function picker(el, cfg) {
    function draw() {
      const chosen = cfg.get();
      if (chosen) {
        el.innerHTML = `<div class="selected-box">${cfg.selected(chosen)}<button class="btn btn-ghost btn-sm" type="button" data-change>Change</button></div>`;
        el.querySelector('[data-change]').onclick = () => { cfg.set(null); draw(); el.querySelector('input').focus(); };
        return;
      }
      el.innerHTML = `<div class="search-input">${UI.icon('search')}<input class="input" type="search" placeholder="${cfg.placeholder}" aria-label="${cfg.placeholder}"></div><div class="results" role="listbox"></div>`;
      const input = el.querySelector('input'), results = el.querySelector('.results');
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        const items = q ? cfg.search(q).slice(0, 7) : [];
        results.innerHTML = items.length
          ? items.map(it => `<button type="button" class="result" data-id="${it.id}">${cfg.item(it)}</button>`).join('')
          : (q ? '<div class="result muted small" style="cursor:default">No matches</div>' : '');
      });
      results.addEventListener('click', e => {
        const btn = e.target.closest('[data-id]');
        if (btn) { cfg.set(cfg.find(btn.dataset.id)); draw(); }
      });
    }
    return { draw };
  }

  const memberPicker = picker($('#member-pick'), {
    placeholder: 'Name, roll number or class',
    get: () => member,
    set: v => { member = v; updateSummary(); },
    find: id => Store.user(id),
    search: q => Store.members().filter(u => [u.name, u.roll, u.className, u.subject].join(' ').toLowerCase().includes(q)),
    item: u => `${UI.avatar(u)}<div class="grow"><div class="cell-title">${esc(u.name)}</div><div class="cell-sub">${esc(UI.memberDetail(u))} · ${esc(u.roll)}</div></div>${loanCountBadge(u)}`,
    selected: u => `${UI.avatar(u)}<div class="grow"><div class="cell-title">${esc(u.name)}</div><div class="cell-sub">${esc(UI.memberDetail(u))} · ${esc(u.roll)}${Store.finesDue(u.id) ? ` · <span style="color:var(--danger)">${UI.money(Store.finesDue(u.id))} fines due</span>` : ''}</div></div>${loanCountBadge(u)}`
  });

  const bookPicker = picker($('#book-pick'), {
    placeholder: 'Title, author or accession no.',
    get: () => book,
    set: v => { book = v; updateSummary(); },
    find: id => Store.book(id),
    search: q => Store.books().filter(b => [b.title, b.author, b.accession].join(' ').toLowerCase().includes(q)),
    item: b => `${UI.cover(b, 'sm')}<div class="grow"><div class="cell-title">${esc(b.title)}</div><div class="cell-sub">${esc(b.author)} · ${esc(b.shelf)}</div></div>${UI.stockBadge(b)}`,
    selected: b => `${UI.cover(b, 'sm')}<div class="grow"><div class="cell-title">${esc(b.title)}</div><div class="cell-sub">${esc(b.author)} · ${esc(b.accession)}${Store.pendingReservations(b.id).length ? ` · ${UI.plural(Store.pendingReservations(b.id).length, 'reservation')}` : ''}</div></div>${UI.stockBadge(b)}`
  });

  function loanCountBadge(u) {
    const n = Store.activeLoans().filter(l => l.memberId === u.id).length;
    const limit = Store.limitFor(u);
    return `<span class="badge ${n >= limit ? 'badge-danger' : 'badge-neutral'} plain">${n}/${limit} books</span>`;
  }

  function updateSummary() {
    const due = Store.D.add(Store.D.today(), settings.loanDays);
    $('#due-text').textContent = member && book ? `Due back ${UI.fmtDate(due)}` : 'Pick a member and a book';
    $('#due-sub').textContent = member && book ? `${book.title} → ${member.name}` : `Loan period is ${settings.loanDays} days`;
    $('#issue-btn').disabled = !(member && book);
  }

  $('#issue-btn').addEventListener('click', () => {
    const res = Store.issue(member.id, book.id);
    if (!res.ok) return UI.toast(res.error, 'error');
    UI.toast(`Issued “${res.book.title}” to ${res.member.name}. Due ${UI.fmtDate(res.loan.dueDate)}.`);
    book = null;
    bookPicker.draw();
    memberPicker.draw();
    updateSummary();
    renderReturns();
    UI.refreshNav(me);
  });

  /* ---------- Returns ---------- */
  function renderReturns() {
    const q = $('#return-q').value.trim().toLowerCase();
    const loans = Store.activeLoans()
      .map(l => ({ l, b: Store.book(l.bookId), m: Store.user(l.memberId) }))
      .filter(({ b, m }) => !q || [b.title, b.author, m.name, m.roll, m.className].join(' ').toLowerCase().includes(q))
      .sort((x, y) => x.l.dueDate.localeCompare(y.l.dueDate));

    $('#return-count').textContent = `${UI.plural(Store.activeLoans().length, 'book')} on loan`;
    $('#return-list').innerHTML = loans.length ? `<ul class="list" style="padding:16px 20px 20px">${loans.map(({ l, b, m }) => {
      const due = UI.dueInfo(l);
      const fine = Store.fineFor(l);
      return `<li class="list-item">
        ${UI.cover(b, 'sm')}
        <div class="grow">
          <div class="title truncate">${esc(b.title)}</div>
          <div class="sub"><a href="${UI.memberUrl(m.id)}">${esc(m.name)}</a> · ${esc(UI.memberDetail(m))} · issued ${UI.fmtDate(l.issueDate)}</div>
          <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${UI.badge(due.text, due.tone)}${fine ? UI.badge('Fine ' + UI.money(fine), 'danger') : ''}</div>
        </div>
        <button class="btn btn-outline btn-sm" data-return="${l.id}">Return</button>
      </li>`;
    }).join('')}</ul>` : UI.empty('check', q ? 'No loans match' : 'Nothing on loan', q ? 'Try another name or title.' : 'All books are back on the shelves.');
  }

  $('#return-q').addEventListener('input', renderReturns);
  $('#return-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-return]');
    if (!btn) return;
    const loan = Store.loans().find(l => l.id === btn.dataset.return);
    const b = Store.book(loan.bookId), m = Store.user(loan.memberId);
    const fine = Store.fineFor(loan);
    UI.confirm({
      title: 'Check in this book?',
      message: `<strong>${esc(b.title)}</strong> from ${esc(m.name)}.<br>` + (fine
        ? `It is ${UI.plural(Store.daysOverdue(loan), 'day')} late, so a fine of <strong>${UI.money(fine)}</strong> will be added to ${esc(UI.firstName(m.name))}'s account.`
        : 'It is on time — no fine.'),
      confirmLabel: 'Confirm return',
      onConfirm() {
        const res = Store.returnLoan(loan.id);
        if (!res.ok) return UI.toast(res.error, 'error');
        UI.toast(`“${res.book.title}” is back on the shelf` + (res.fine ? ` · fine ${UI.money(res.fine)}` : ''));
        if (res.nextMember) setTimeout(() => UI.toast(`Hold this copy for ${res.nextMember.name} — next in the reservation queue.`, 'info'), 400);
        renderReturns();
        memberPicker.draw();
        bookPicker.draw();
        UI.refreshNav(me);
      }
    });
  });

  if (member) $('#return-q').value = member.name;
  memberPicker.draw();
  bookPicker.draw();
  updateSummary();
  renderReturns();
})();
