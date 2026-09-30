/* Store: all library state lives in localStorage under "sdl_*" keys.
   Every screen reads from here, so an action on one screen shows up on all others. */
(function () {
  const PREFIX = 'sdl_';
  const memory = {}; // fallback when localStorage is blocked (private mode, file:// quirks)

  function read(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return key in memory ? memory[key] : null;
    }
  }

  function write(key, value) {
    try {
      if (value == null) localStorage.removeItem(PREFIX + key);
      else localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      memory[key] = value;
    }
  }

  const toISO = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  // Dates are plain "YYYY-MM-DD" strings, parsed at noon to dodge DST edges.
  const D = {
    today: () => toISO(new Date()),
    parse: iso => new Date(iso + 'T12:00:00'),
    add(iso, days) { const d = D.parse(iso); d.setDate(d.getDate() + days); return toISO(d); },
    diff: (from, to) => Math.round((D.parse(to) - D.parse(from)) / 86400000)
  };

  function nextId(prefix, items, width) {
    const max = items.reduce((m, it) => Math.max(m, parseInt(it.id.slice(prefix.length), 10) || 0), 0);
    return prefix + String(max + 1).padStart(width, '0');
  }

  const fail = error => ({ ok: false, error });
  const COLLECTIONS = ['books', 'users', 'loans', 'reservations', 'lists', 'activity', 'settings'];

  const Store = {
    D,
    get: read,
    set: write,

    init() {
      if (!read('books')) this.reset();
    },

    reset() {
      const data = SDL_SEED.build(D);
      COLLECTIONS.forEach(k => write(k, data[k]));
    },

    /* ---------- Settings ---------- */
    settings() { return read('settings'); },
    saveSettings(values) {
      write('settings', Object.assign(this.settings(), values));
      this.log('Library settings were updated', 'settings');
    },

    /* ---------- Books ---------- */
    books() { return read('books') || []; },
    book(id) { return this.books().find(b => b.id === id) || null; },

    saveBook(data) {
      const books = this.books();
      if (data.id) {
        const i = books.findIndex(b => b.id === data.id);
        if (i < 0) return fail('Book not found.');
        const onLoan = this.activeLoans().filter(l => l.bookId === data.id).length;
        if (data.copies < onLoan) return fail(`${onLoan} copies are on loan, so copies can't be set lower than that.`);
        books[i] = Object.assign(books[i], data);
        write('books', books);
        this.log(`Updated details of “${books[i].title}”`, 'book');
        return { ok: true, book: books[i] };
      }
      const lastAcc = books.reduce((m, b) => Math.max(m, parseInt(b.accession.slice(4), 10) || 0), 1000);
      const book = Object.assign({
        id: nextId('B', books, 3),
        accession: 'ACC-' + (lastAcc + 1),
        added: D.today()
      }, data);
      books.push(book);
      write('books', books);
      this.log(`Added “${book.title}” to the catalog`, 'book');
      return { ok: true, book };
    },

    deleteBook(id) {
      const book = this.book(id);
      if (!book) return fail('Book not found.');
      if (this.activeLoans().some(l => l.bookId === id)) return fail('This book has copies on loan. Return them before deleting.');
      write('books', this.books().filter(b => b.id !== id));
      write('reservations', this.reservations().map(r => (r.bookId === id && r.status === 'pending' ? Object.assign(r, { status: 'cancelled' }) : r)));
      write('lists', this.lists().map(l => Object.assign(l, { bookIds: l.bookIds.filter(b => b !== id) })));
      this.log(`Removed “${book.title}” from the catalog`, 'book');
      return { ok: true };
    },

    subjects() { return [...new Set(this.books().map(b => b.subject))].sort(); },

    /* ---------- Users ---------- */
    users() { return read('users') || []; },
    user(id) { return this.users().find(u => u.id === id) || null; },
    members(role) { return this.users().filter(u => u.role !== 'admin' && (!role || u.role === role)); },
    classes() { return [...new Set(this.members('student').map(s => s.className))].sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b)); },

    saveUser(data) {
      const users = this.users();
      if (data.id) {
        const i = users.findIndex(u => u.id === data.id);
        users[i] = Object.assign(users[i], data);
        write('users', users);
        return { ok: true, user: users[i] };
      }
      const isStudent = data.role === 'student';
      const prefix = isStudent ? 'S' : 'T';
      const same = users.filter(u => u.id[0] === prefix);
      const id = nextId(prefix, same, 3);
      const n = parseInt(id.slice(1), 10);
      const user = Object.assign({
        id,
        roll: isStudent ? 'GPS-' + String(1000 + n).padStart(4, '0') : 'STF-' + String(10 + n * 3).padStart(3, '0'),
        joined: D.today()
      }, data);
      users.push(user);
      write('users', users);
      this.log(`New ${data.role} ${user.name} joined the library`, 'member');
      return { ok: true, user };
    },

    limitFor(user) {
      const s = this.settings();
      return user.role === 'teacher' ? s.maxTeacher : s.maxStudent;
    },

    /* ---------- Loans ---------- */
    loans() { return read('loans') || []; },
    activeLoans() { return this.loans().filter(l => !l.returnDate); },
    loansFor(memberId) { return this.loans().filter(l => l.memberId === memberId); },
    loansForBook(bookId) { return this.loans().filter(l => l.bookId === bookId); },

    daysOverdue(loan) {
      const end = loan.returnDate || D.today();
      return Math.max(0, D.diff(loan.dueDate, end));
    },
    isOverdue(loan) { return !loan.returnDate && this.daysOverdue(loan) > 0; },

    // Returned loans carry a fixed fine; active overdue loans keep accruing.
    fineFor(loan) {
      if (loan.returnDate) return loan.fine || 0;
      return this.daysOverdue(loan) * this.settings().finePerDay;
    },

    finesDue(memberId) {
      return this.loans()
        .filter(l => !memberId || l.memberId === memberId)
        .reduce((sum, l) => sum + (l.returnDate ? (l.finePaid ? 0 : l.fine) : this.fineFor(l)), 0);
    },

    finesCollected() {
      return this.loans().filter(l => l.returnDate && l.finePaid).reduce((s, l) => s + (l.fine || 0), 0);
    },

    payFines(memberId) {
      let amount = 0;
      const loans = this.loans().map(l => {
        if (l.memberId === memberId && l.returnDate && !l.finePaid && l.fine > 0) {
          amount += l.fine;
          return Object.assign(l, { finePaid: true });
        }
        return l;
      });
      if (!amount) return fail('No settled fines to collect. Fines on books still on loan are collected when they come back.');
      write('loans', loans);
      this.log(`Collected Rs ${amount} in fines from ${this.user(memberId).name}`, 'fine');
      return { ok: true, amount };
    },

    available(bookId) {
      const book = this.book(bookId);
      if (!book) return 0;
      return book.copies - this.activeLoans().filter(l => l.bookId === bookId).length;
    },

    // Copies on the shelf that are not already held for someone in the reservation queue.
    freeCopies(bookId) {
      return Math.max(0, this.available(bookId) - this.pendingReservations(bookId).length);
    },

    // What a student or teacher sees: available / on hold for a reservation / all issued.
    bookStatus(bookId) {
      if (this.freeCopies(bookId) > 0) return 'available';
      return this.available(bookId) > 0 ? 'onhold' : 'out';
    },

    issue(memberId, bookId) {
      const member = this.user(memberId);
      const book = this.book(bookId);
      if (!member || member.role === 'admin') return fail('Choose a student or teacher first.');
      if (!book) return fail('Choose a book to issue.');

      const mine = this.activeLoans().filter(l => l.memberId === memberId);
      if (mine.some(l => l.bookId === bookId)) return fail(`${member.name} already has a copy of this book.`);
      const limit = this.limitFor(member);
      if (mine.length >= limit) return fail(`${member.name} has reached the borrowing limit of ${limit} books.`);

      const available = this.available(bookId);
      if (available <= 0) return fail('All copies are on loan. Place a reservation instead.');

      const queue = this.pendingReservations(bookId);
      const ownRes = queue.find(r => r.memberId === memberId);
      if (!ownRes && available <= queue.length) {
        return fail(`The copy on the shelf is held for ${this.user(queue[0].memberId).name}, who reserved it first.`);
      }

      const s = this.settings();
      const loans = this.loans();
      const today = D.today();
      const loan = {
        id: nextId('L', loans, 4), bookId, memberId,
        issueDate: today, dueDate: D.add(today, s.loanDays), returnDate: null, fine: 0, finePaid: true
      };
      loans.push(loan);
      write('loans', loans);

      if (ownRes) {
        write('reservations', this.reservations().map(r => (r.id === ownRes.id ? Object.assign(r, { status: 'fulfilled' }) : r)));
      }
      this.log(`Issued “${book.title}” to ${member.name}`, 'issue');
      return { ok: true, loan, book, member };
    },

    returnLoan(loanId) {
      const loans = this.loans();
      const loan = loans.find(l => l.id === loanId);
      if (!loan || loan.returnDate) return fail('This loan is already closed.');
      loan.returnDate = D.today();
      loan.fine = this.daysOverdue(loan) * this.settings().finePerDay;
      loan.finePaid = loan.fine === 0;
      write('loans', loans);

      const book = this.book(loan.bookId);
      const member = this.user(loan.memberId);
      this.log(`${member.name} returned “${book.title}”` + (loan.fine ? ` (fine Rs ${loan.fine})` : ''), 'return');

      const next = this.pendingReservations(loan.bookId)[0];
      return { ok: true, loan, book, member, fine: loan.fine, nextMember: next ? this.user(next.memberId) : null };
    },

    /* ---------- Reservations ---------- */
    reservations() { return read('reservations') || []; },
    pendingReservations(bookId) {
      return this.reservations()
        .filter(r => r.status === 'pending' && (!bookId || r.bookId === bookId))
        .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    },
    queuePosition(res) {
      return this.pendingReservations(res.bookId).findIndex(r => r.id === res.id) + 1;
    },

    reserve(memberId, bookId) {
      const member = this.user(memberId);
      const book = this.book(bookId);
      if (this.activeLoans().some(l => l.memberId === memberId && l.bookId === bookId)) return fail('You already have this book.');
      if (this.pendingReservations(bookId).some(r => r.memberId === memberId)) return fail('You have already reserved this book.');
      if (this.freeCopies(bookId) > 0) return fail('A copy is on the shelf right now. Collect it from the library desk.');

      const all = this.reservations();
      const res = { id: nextId('R', all, 3), bookId, memberId, date: D.today(), status: 'pending' };
      all.push(res);
      write('reservations', all);
      this.log(`${member.name} reserved “${book.title}”`, 'reserve');
      return { ok: true, reservation: res, position: this.queuePosition(res) };
    },

    cancelReservation(id) {
      const all = this.reservations();
      const res = all.find(r => r.id === id);
      if (!res || res.status !== 'pending') return fail('This reservation is no longer active.');
      res.status = 'cancelled';
      write('reservations', all);
      this.log(`Reservation for “${this.book(res.bookId).title}” by ${this.user(res.memberId).name} was cancelled`, 'cancel');
      return { ok: true };
    },

    fulfilReservation(id) {
      const res = this.reservations().find(r => r.id === id);
      if (!res) return fail('Reservation not found.');
      return this.issue(res.memberId, res.bookId);
    },

    /* ---------- Reading lists ---------- */
    lists() { return read('lists') || []; },
    listsForClass(className) { return this.lists().filter(l => l.className === className); },
    listsBy(teacherId) { return this.lists().filter(l => l.teacherId === teacherId); },
    listsWithBook(bookId) { return this.lists().filter(l => l.bookIds.includes(bookId)); },

    saveList(data) {
      const lists = this.lists();
      if (data.id) {
        const i = lists.findIndex(l => l.id === data.id);
        lists[i] = Object.assign(lists[i], data);
        write('lists', lists);
        return { ok: true, list: lists[i] };
      }
      const list = Object.assign({ id: nextId('RL', lists, 3), created: D.today() }, data);
      lists.push(list);
      write('lists', lists);
      this.log(`${this.user(list.teacherId).name} shared the reading list “${list.title}” with class ${list.className}`, 'list');
      return { ok: true, list };
    },

    deleteList(id) {
      write('lists', this.lists().filter(l => l.id !== id));
      return { ok: true };
    },

    /* ---------- Activity & stats ---------- */
    activity() { return (read('activity') || []).sort((a, b) => b.at - a.at); },
    log(text, type) {
      const items = read('activity') || [];
      items.unshift({ at: Date.now(), text, type });
      write('activity', items.slice(0, 60));
    },

    borrowCounts() {
      return this.loans().reduce((m, l) => { m[l.bookId] = (m[l.bookId] || 0) + 1; return m; }, {});
    },

    stats() {
      const books = this.books();
      const active = this.activeLoans();
      return {
        titles: books.length,
        copies: books.reduce((s, b) => s + Number(b.copies), 0),
        issued: active.length,
        overdue: active.filter(l => this.isOverdue(l)).length,
        students: this.members('student').length,
        teachers: this.members('teacher').length,
        finesDue: this.finesDue(),
        collected: this.finesCollected(),
        pending: this.pendingReservations().length
      };
    }
  };

  window.Store = Store;
  Store.init();
})();
