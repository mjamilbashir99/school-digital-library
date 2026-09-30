(function () {
  const { $ } = UI;
  UI.hydrateIcons();

  const s = Store.stats();
  $('#n-titles').textContent = s.titles;
  $('#n-copies').textContent = s.copies;
  $('#n-members').textContent = s.students + s.teachers;
  $('#n-issued').textContent = s.issued;

  const user = Auth.current();
  if (user) {
    const btn = $('#header-cta');
    btn.textContent = 'Go to dashboard';
    btn.href = Auth.homeFor(user);
  }
})();
