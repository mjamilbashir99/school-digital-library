(function () {
  const me = Auth.require(['admin']);
  if (!me) return;
  UI.mountShell(me, 'books');

  const { $, esc } = UI;
  const params = UI.params();

  $('#q').value = params.get('q') || '';
  $('#subject').innerHTML = UI.options(UI.SUBJECTS, params.get('subject'), 'All subjects');
  $('#level').innerHTML = UI.options(Object.entries(UI.LEVELS), '', 'All levels');
  $('#stock').innerHTML = UI.options([['in', 'Copies on shelf'], ['out', 'All copies issued']], '', 'Any availability');

  function render() {
    const q = $('#q').value.trim().toLowerCase();
    const subject = $('#subject').value, level = $('#level').value, stock = $('#stock').value;
    const all = Store.books();
    const rows = all.filter(b =>
      (!q || [b.title, b.author, b.accession, b.subject].join(' ').toLowerCase().includes(q)) &&
      (!subject || b.subject === subject) &&
      (!level || b.level === level) &&
      (!stock || (stock === 'in' ? Store.available(b.id) > 0 : Store.available(b.id) === 0))
    ).sort((a, b) => a.title.localeCompare(b.title));

    $('#count').textContent = `Showing ${rows.length} of ${all.length} titles`;
    $('#table').innerHTML = UI.table([
      { label: 'Book', render: b => UI.bookCell(b) },
      { label: 'Subject', render: b => esc(b.subject) },
      { label: 'Level', render: b => esc(b.level) },
      { label: 'Shelf', render: b => `<span class="nowrap">${esc(b.shelf)}</span><div class="cell-sub">${esc(b.accession)}</div>` },
      { label: 'Copies', render: b => UI.stockBadge(b) },
      { label: 'Queue', render: b => { const n = Store.pendingReservations(b.id).length; return n ? UI.badge(UI.plural(n, 'reservation'), 'info') : '<span class="muted">—</span>'; } },
      { label: '<span class="sr-only">Actions</span>', cls: 'actions-cell', render: b => `
          <button class="icon-btn sm" data-edit="${b.id}" title="Edit" aria-label="Edit ${esc(b.title)}">${UI.icon('edit')}</button>
          <button class="icon-btn sm danger" data-delete="${b.id}" title="Delete" aria-label="Delete ${esc(b.title)}">${UI.icon('trash')}</button>` }
    ], rows, {
      href: b => UI.bookUrl(b.id),
      empty: UI.empty('search', 'No books match', 'Try a different search or clear the filters.')
    });
  }

  function openForm(book) {
    UI.formModal({
      title: book ? 'Edit book' : 'Add a new book',
      submitLabel: book ? 'Save changes' : 'Add to catalog',
      values: book || { copies: 1, level: 'Middle' },
      fields: [
        { name: 'title', label: 'Title', required: true, full: true },
        { name: 'author', label: 'Author', required: true },
        { name: 'year', label: 'Year published', type: 'number', placeholder: 'e.g. 2015' },
        { name: 'subject', label: 'Subject', type: 'select', options: UI.SUBJECTS, required: true },
        { name: 'level', label: 'Reading level', type: 'select', options: Object.entries(UI.LEVELS), required: true },
        { name: 'copies', label: 'Number of copies', type: 'number', min: 1, required: true },
        { name: 'shelf', label: 'Shelf location', placeholder: 'e.g. SCI-2' },
        { name: 'description', label: 'Short description', type: 'textarea', full: true }
      ],
      onSubmit(data) {
        if (data.copies < 1) return 'A book needs at least one copy.';
        data.year = data.year === '' ? null : data.year;
        if (!data.shelf) data.shelf = data.subject.slice(0, 3).toUpperCase() + '-1';
        const res = Store.saveBook(book ? Object.assign({ id: book.id }, data) : data);
        if (!res.ok) return res.error;
        UI.toast(book ? `Saved changes to “${res.book.title}”` : `Added “${res.book.title}” (${res.book.accession})`);
        render();
      }
    });
  }

  ['#q', '#subject', '#level', '#stock'].forEach(sel => $(sel).addEventListener('input', render));
  $('#add-book').addEventListener('click', () => openForm(null));

  $('#table').addEventListener('click', e => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-delete]');
    if (edit) openForm(Store.book(edit.dataset.edit));
    if (del) {
      const book = Store.book(del.dataset.delete);
      UI.confirm({
        title: 'Delete this book?',
        message: `“${esc(book.title)}” and its ${UI.plural(book.copies, 'copy', 'copies')} will be removed from the catalog. Borrowing history is kept.`,
        confirmLabel: 'Delete book',
        danger: true,
        onConfirm() {
          const res = Store.deleteBook(book.id);
          UI.toast(res.ok ? `Deleted “${book.title}”` : res.error, res.ok ? 'success' : 'error');
          render();
        }
      });
    }
  });

  render();
  if (params.get('new')) openForm(null);
  if (params.get('edit') && Store.book(params.get('edit'))) openForm(Store.book(params.get('edit')));
})();
