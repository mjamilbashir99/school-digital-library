/* Catalog shared by students and teachers. */
(function () {
  const role = document.body.dataset.role;
  const me = Auth.require([role]);
  if (!me) return;
  UI.mountShell(me, 'catalog');

  const { $, esc } = UI;
  const params = UI.params();

  $('#q').value = params.get('q') || '';
  $('#subject').innerHTML = UI.options(UI.SUBJECTS, params.get('subject'), 'All subjects');
  $('#level').innerHTML = UI.options(Object.entries(UI.LEVELS), params.get('level'), 'All levels');
  $('#sort').innerHTML = UI.options([['title', 'Title A–Z'], ['new', 'Newest first'], ['popular', 'Most borrowed']], 'title');

  function action(book) {
    const holding = Store.activeLoans().some(l => l.memberId === me.id && l.bookId === book.id);
    if (holding) return UI.badge('With you', 'info');
    const res = Store.pendingReservations(book.id).find(r => r.memberId === me.id);
    if (res) return UI.badge(`Reserved · #${Store.queuePosition(res)}`, 'gold');
    if (Store.bookStatus(book.id) === 'available') return '';
    return `<button class="btn btn-outline btn-sm" data-reserve="${book.id}">${UI.icon('bookmark')}Reserve</button>`;
  }

  function render() {
    const q = $('#q').value.trim().toLowerCase();
    const subject = $('#subject').value, level = $('#level').value;
    const onlyAvail = $('#avail').checked;
    const sort = $('#sort').value;
    const counts = Store.borrowCounts();

    let books = Store.books().filter(b =>
      (!q || [b.title, b.author, b.subject].join(' ').toLowerCase().includes(q)) &&
      (!subject || b.subject === subject) &&
      (!level || b.level === level) &&
      (!onlyAvail || Store.bookStatus(b.id) === 'available')
    );
    books.sort(sort === 'new' ? (a, b) => b.added.localeCompare(a.added)
      : sort === 'popular' ? (a, b) => (counts[b.id] || 0) - (counts[a.id] || 0)
      : (a, b) => a.title.localeCompare(b.title));

    $('#count').textContent = UI.plural(books.length, 'book');
    $('#grid').innerHTML = books.length ? books.map(b => `
      <article class="book-card">
        ${UI.cover(b, 'md')}
        <h3><a href="${UI.bookUrl(b.id)}">${esc(b.title)}</a></h3>
        <div class="by">${esc(b.author)}</div>
        <div class="meta">${UI.availBadge(b)}${action(b)}</div>
      </article>`).join('')
      : `<div style="grid-column:1/-1">${UI.empty('search', 'No books found', 'Try a shorter search or clear the filters.')}</div>`;
  }

  ['#q', '#subject', '#level', '#sort', '#avail'].forEach(sel => $(sel).addEventListener('input', render));

  $('#grid').addEventListener('click', e => {
    const btn = e.target.closest('[data-reserve]');
    if (!btn) return;
    const res = Store.reserve(me.id, btn.dataset.reserve);
    if (!res.ok) return UI.toast(res.error, 'error');
    UI.toast(`Reserved! You are #${res.position} in the queue. We'll hold a copy at the desk for you.`);
    render();
  });

  render();
})();
