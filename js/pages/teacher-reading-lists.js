(function () {
  const me = Auth.require(['teacher']);
  if (!me) return;
  UI.mountShell(me, 'reading-lists');

  const { $, esc } = UI;

  function card(list, mine) {
    const books = list.bookIds.map(id => Store.book(id)).filter(Boolean);
    const teacher = Store.user(list.teacherId);
    return `<article class="reading-list">
      <div class="reading-list-head">
        <div>
          <h3>${esc(list.title)}</h3>
          <div class="by">Class ${esc(list.className)} · ${mine ? 'shared' : 'by ' + esc(teacher.name) + ' ·'} ${UI.fmtDate(list.created)}</div>
        </div>
        ${mine ? `<div>
          <button class="icon-btn sm" data-edit="${list.id}" title="Edit" aria-label="Edit ${esc(list.title)}">${UI.icon('edit')}</button>
          <button class="icon-btn sm danger" data-delete="${list.id}" title="Delete" aria-label="Delete ${esc(list.title)}">${UI.icon('trash')}</button>
        </div>` : UI.badge(UI.plural(books.length, 'book'), 'gold')}
      </div>
      ${list.note ? `<p class="note">${esc(list.note)}</p>` : ''}
      <div class="mini-shelf">${books.map(UI.miniBook).join('')}</div>
    </article>`;
  }

  function render() {
    const mine = Store.listsBy(me.id).sort((a, b) => b.created.localeCompare(a.created));
    const others = Store.lists().filter(l => l.teacherId !== me.id).sort((a, b) => b.created.localeCompare(a.created));
    $('#mine').innerHTML = mine.length
      ? `<div class="list-grid">${mine.map(l => card(l, true)).join('')}</div>`
      : `<div class="card">${UI.empty('list', 'No reading lists yet', 'Choose books for one of your classes. Students in that class will see the list on their dashboard.', '<button class="btn btn-primary" data-new>Create your first list</button>')}</div>`;
    $('#others').innerHTML = others.length
      ? `<div class="list-grid">${others.map(l => card(l, false)).join('')}</div>`
      : '<p class="muted">No lists from colleagues yet.</p>';
  }

  function openForm(list) {
    UI.formModal({
      title: list ? 'Edit reading list' : 'New reading list',
      submitLabel: list ? 'Save list' : 'Share with class',
      wide: true,
      values: list || {},
      intro: list ? '' : '<p class="muted small">Students in the class you choose will see this list on their dashboard straight away.</p>',
      fields: [
        { name: 'title', label: 'List title', required: true, placeholder: 'e.g. Summer reading' },
        { name: 'className', label: 'Class', type: 'select', options: Store.classes().map(c => [c, 'Class ' + c]), required: true },
        { name: 'note', label: 'Note for students', type: 'textarea', full: true, placeholder: 'What should they look out for?' },
        {
          name: 'bookIds', label: 'Books', type: 'checklist', required: true,
          options: Store.books().slice().sort((a, b) => a.title.localeCompare(b.title)).map(b => [b.id, b.title, `${b.author} · ${b.subject} · ${b.level}`])
        }
      ],
      onSubmit(data) {
        const res = Store.saveList(Object.assign(list ? { id: list.id } : { teacherId: me.id }, data));
        UI.toast(list ? 'Reading list updated' : `Shared “${res.list.title}” with Class ${res.list.className}`);
        render();
      }
    });
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-new]')) openForm(null);
    const edit = e.target.closest('[data-edit]');
    if (edit) openForm(Store.lists().find(l => l.id === edit.dataset.edit));
    const del = e.target.closest('[data-delete]');
    if (del) {
      const list = Store.lists().find(l => l.id === del.dataset.delete);
      UI.confirm({
        title: 'Delete reading list?',
        message: `“${esc(list.title)}” will disappear from Class ${esc(list.className)}'s dashboards.`,
        confirmLabel: 'Delete list',
        danger: true,
        onConfirm() { Store.deleteList(list.id); UI.toast('Reading list deleted'); render(); }
      });
    }
  });

  render();
})();
