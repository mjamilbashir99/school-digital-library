/* Demo sign-in. There is no real security here — it only decides which screens you see. */
(function () {
  const PASSWORD = 'library123';
  const HOME = {
    admin: 'admin/dashboard.html',
    teacher: 'teacher/dashboard.html',
    student: 'student/dashboard.html'
  };

  // Pages in sub-folders set data-root=".." so links resolve from any depth.
  const root = () => (document.body && document.body.dataset.root) || '.';

  const Auth = {
    PASSWORD,

    url(path) { return root() + '/' + path; },

    current() {
      const session = Store.get('session');
      return session ? Store.user(session.userId) : null;
    },

    login(userId, password) {
      const user = Store.user(userId);
      if (!user) return { ok: false, error: 'Choose your name from the list.' };
      if (password !== PASSWORD) return { ok: false, error: 'That password is not right. The demo password is shown below the form.' };
      Store.set('session', { userId, at: Date.now() });
      return { ok: true, user };
    },

    logout() {
      Store.set('session', null);
      location.href = this.url('login.html');
    },

    homeFor(user) { return this.url(HOME[user.role]); },

    // Call at the top of every protected page. Returns the user, or null after redirecting.
    require(roles) {
      const user = this.current();
      if (!user) {
        location.replace(this.url('login.html'));
        return null;
      }
      if (roles && !roles.includes(user.role)) {
        location.replace(this.homeFor(user));
        return null;
      }
      return user;
    }
  };

  window.Auth = Auth;
})();
