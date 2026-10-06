/* Seed data for the demo library.
   Loan dates are stored as day offsets from today so the demo always
   has current, due-soon and overdue loans whenever it is opened. */
window.SDL_SEED = (function () {
  // title, author, subject, level, year, copies, description
  const BOOKS = [
    ['A Brief History of Time', 'Stephen Hawking', 'Science', 'Secondary', 1988, 2, 'From the Big Bang to black holes — a landmark tour of how the universe works, written for curious readers.'],
    ['Cosmos', 'Carl Sagan', 'Science', 'Secondary', 1980, 2, 'A sweeping journey through space and the history of science that shaped our understanding of it.'],
    ['A Short History of Nearly Everything', 'Bill Bryson', 'Science', 'Secondary', 2003, 2, 'A funny, fact-packed account of how scientists figured out the world, from atoms to the Earth\'s age.'],
    ['The Magic School Bus: Inside the Human Body', 'Joanna Cole', 'Science', 'Primary', 1989, 3, 'Ms. Frizzle\'s class takes a field trip through the human body in this favourite picture book.'],
    ['Silent Spring', 'Rachel Carson', 'Science', 'Secondary', 1962, 1, 'The book that launched the modern environmental movement by exposing the dangers of pesticides.'],
    ['The Number Devil', 'Hans Magnus Enzensberger', 'Mathematics', 'Middle', 1997, 2, 'A boy who hates maths meets a devil who shows him, dream by dream, how beautiful numbers can be.'],
    ['Math Curse', 'Jon Scieszka', 'Mathematics', 'Primary', 1995, 2, 'A girl discovers that everything in her day can be turned into a maths problem.'],
    ['Fermat\'s Last Theorem', 'Simon Singh', 'Mathematics', 'Secondary', 1997, 1, 'The 350-year hunt for a proof that obsessed mathematicians, told as a true detective story.'],
    ['The Joy of x', 'Steven Strogatz', 'Mathematics', 'Secondary', 2012, 1, 'Short, friendly chapters that reveal the big ideas of maths hiding in everyday life.'],
    ['To Kill a Mockingbird', 'Harper Lee', 'English Literature', 'Secondary', 1960, 3, 'Scout Finch watches her father defend a man wrongly accused, in a classic about justice and courage.'],
    ['Animal Farm', 'George Orwell', 'English Literature', 'Secondary', 1945, 3, 'Farm animals overthrow their owner, only to find power corrupts — a sharp fable about politics.'],
    ['Lord of the Flies', 'William Golding', 'English Literature', 'Secondary', 1954, 2, 'Stranded schoolboys try to govern themselves on an island, with dark results.'],
    ['The Old Man and the Sea', 'Ernest Hemingway', 'English Literature', 'Secondary', 1952, 1, 'An ageing fisherman battles a giant marlin in this short novel about endurance and pride.'],
    ['Great Expectations', 'Charles Dickens', 'English Literature', 'Secondary', 1861, 2, 'Orphan Pip rises from humble beginnings and learns what truly makes a gentleman.'],
    ['Little Women', 'Louisa May Alcott', 'English Literature', 'Middle', 1868, 2, 'The four March sisters grow up, dream big and look after one another.'],
    ['Charlotte\'s Web', 'E. B. White', 'Fiction', 'Primary', 1952, 3, 'A clever spider spins words into her web to save her friend Wilbur the pig.'],
    ['Matilda', 'Roald Dahl', 'Fiction', 'Primary', 1988, 3, 'A brilliant girl with a love of books stands up to her awful parents and headmistress.'],
    ['The Hobbit', 'J. R. R. Tolkien', 'Fiction', 'Middle', 1937, 2, 'Bilbo Baggins is swept into an adventure with dwarves, a wizard and a dragon.'],
    ['Wonder', 'R. J. Palacio', 'Fiction', 'Middle', 2012, 2, 'Auggie starts school for the first time and teaches everyone to choose kindness.'],
    ['Harry Potter and the Philosopher\'s Stone', 'J. K. Rowling', 'Fiction', 'Middle', 1997, 2, 'An orphan discovers he is a wizard and begins his first year at Hogwarts.'],
    ['The Secret Garden', 'Frances Hodgson Burnett', 'Fiction', 'Middle', 1911, 2, 'A lonely girl finds a hidden garden and brings it — and herself — back to life.'],
    ['Treasure Island', 'Robert Louis Stevenson', 'Fiction', 'Middle', 1883, 2, 'Young Jim Hawkins sails in search of buried treasure and meets Long John Silver.'],
    ['Bang-e-Dra', 'Allama Muhammad Iqbal', 'Urdu Literature', 'Secondary', 1924, 3, 'Iqbal\'s first Urdu poetry collection, including many poems students learn by heart.'],
    ['Umrao Jaan Ada', 'Mirza Hadi Ruswa', 'Urdu Literature', 'Secondary', 1899, 1, 'One of the earliest Urdu novels, set in the culture of nineteenth-century Lucknow.'],
    ['Aangan', 'Khadija Mastoor', 'Urdu Literature', 'Secondary', 1962, 1, 'A family courtyard becomes the stage for the years leading up to Partition.'],
    ['Raja Gidh', 'Bano Qudsia', 'Urdu Literature', 'Secondary', 1981, 1, 'A celebrated Urdu novel exploring love, obsession and what is lawful and unlawful.'],
    ['I Am Malala', 'Malala Yousafzai', 'History', 'Middle', 2013, 3, 'The girl from Swat who stood up for education and became the youngest Nobel laureate.'],
    ['The Diary of a Young Girl', 'Anne Frank', 'History', 'Middle', 1947, 2, 'The diary Anne kept while hiding from the Nazis — honest, funny and heartbreaking.'],
    ['Jinnah of Pakistan', 'Stanley Wolpert', 'History', 'Secondary', 1984, 1, 'A detailed biography of Quaid-e-Azam Muhammad Ali Jinnah and the making of Pakistan.'],
    ['Sapiens', 'Yuval Noah Harari', 'History', 'Secondary', 2014, 2, 'A brief history of humankind, from hunter-gatherers to the modern world.'],
    ['Guns, Germs, and Steel', 'Jared Diamond', 'History', 'Secondary', 1997, 1, 'Why did some societies conquer others? A big-picture look at geography and history.'],
    ['Prisoners of Geography', 'Tim Marshall', 'Geography', 'Secondary', 2015, 2, 'Ten maps that explain how mountains, rivers and seas shape world politics.'],
    ['National Geographic Kids World Atlas', 'National Geographic Kids', 'Geography', 'Primary', 2018, 2, 'Colourful maps, photos and facts about every country on Earth.'],
    ['Hello World', 'Hannah Fry', 'Computer Science', 'Secondary', 2018, 1, 'How algorithms make decisions about our lives — and how to stay in charge of them.'],
    ['Hello Ruby: Adventures in Coding', 'Linda Liukas', 'Computer Science', 'Primary', 2015, 2, 'A little girl with a big imagination introduces young readers to computational thinking.'],
    ['Code', 'Charles Petzold', 'Computer Science', 'Secondary', 1999, 1, 'From flashlights and Morse code to microprocessors — how computers really work.'],
    ['Python Crash Course', 'Eric Matthes', 'Computer Science', 'Secondary', 2015, 2, 'A hands-on introduction to programming in Python, with games and projects.'],
    ['Stories of the Prophets', 'Ibn Kathir', 'Islamic Studies', 'Middle', null, 3, 'Classic accounts of the lives of the Prophets, from Adam to Isa (peace be upon them).'],
    ['Muhammad: His Life Based on the Earliest Sources', 'Martin Lings', 'Islamic Studies', 'Secondary', 1983, 1, 'A widely read biography of the Prophet Muhammad (PBUH) drawn from early sources.'],
    ['The Way Things Work Now', 'David Macaulay', 'General Knowledge', 'Middle', 2016, 2, 'Woolly mammoths help explain the machines and technology all around us.'],
    ['Children\'s Encyclopedia', 'DK', 'General Knowledge', 'Primary', null, 2, 'A first encyclopedia packed with pictures on science, nature, history and more.']
  ];

  const SHELF = {
    'Science': 'SCI', 'Mathematics': 'MTH', 'English Literature': 'ENG', 'Fiction': 'FIC',
    'Urdu Literature': 'URD', 'History': 'HIS', 'Geography': 'GEO',
    'Computer Science': 'CS', 'Islamic Studies': 'ISL', 'General Knowledge': 'GK'
  };

  // name, subject
  const TEACHERS = [
    ['Imran Qureshi', 'Science'],
    ['Sana Malik', 'English'],
    ['Bilal Ahmed', 'Mathematics'],
    ['Hina Raza', 'Urdu'],
    ['Usman Tariq', 'Computer Science'],
    ['Farah Siddiqui', 'History'],
    ['Kamran Javed', 'Geography'],
    ['Nadia Hussain', 'Islamic Studies']
  ];

  const CLASSES = ['6A', '7A', '8A', '9A', '10A', '10B'];
  const STUDENTS = [
    'Ali Hassan', 'Fatima Zahra', 'Ahmed Raza', 'Ayesha Noor',
    'Hamza Sheikh', 'Zainab Iqbal', 'Omar Farooq', 'Maryam Aslam',
    'Hassan Ali', 'Khadija Tariq', 'Bilal Khan', 'Mahnoor Butt',
    'Saad Mehmood', 'Iqra Javed', 'Usman Ghani', 'Hira Shah',
    'Taha Rizvi', 'Amna Latif', 'Daniyal Akhtar', 'Sara Nadeem',
    'Rayyan Malik', 'Eman Chaudhry', 'Faizan Anwar', 'Laiba Saleem'
  ];

  // bookId, memberId, issued (days from today), returned (days from today or null), finePaid
  const LOANS = [
    // returned — borrowing history
    ['B016', 'S003', -100, -88, true],
    ['B020', 'S018', -90, -75, true],
    ['B001', 'S012', -80, -70, true],
    ['B020', 'S002', -70, -52, false],
    ['B016', 'S001', -60, -50, true],
    ['B019', 'S022', -65, -55, true],
    ['B017', 'S010', -55, -45, true],
    ['B028', 'T001', -50, -40, true],
    ['B011', 'S001', -50, -38, true],
    ['B019', 'S003', -45, -28, true],
    ['B030', 'S009', -42, -33, true],
    ['B024', 'S007', -40, -30, true],
    ['B003', 'T003', -38, -26, true],
    ['B010', 'S005', -35, -24, true],
    ['B016', 'S014', -30, -18, true],
    ['B011', 'S020', -25, -14, true],
    ['B027', 'S011', -22, -9, true],
    ['B018', 'S009', -20, -6, true],
    ['B002', 'S017', -26, -8, false],
    // active — on loan now (loan period 14 days)
    ['B013', 'S012', -25, null],
    ['B020', 'S005', -22, null],
    ['B021', 'S018', -19, null],
    ['B019', 'S002', -16, null],
    ['B017', 'S022', -13, null],
    ['B024', 'S010', -12, null],
    ['B016', 'S001', -10, null],
    ['B036', 'T005', -9, null],
    ['B020', 'S014', -8, null],
    ['B030', 'T002', -7, null],
    ['B003', 'S020', -6, null],
    ['B001', 'S003', -5, null],
    ['B028', 'S009', -4, null],
    ['B011', 'S007', -3, null],
    ['B010', 'S003', -2, null],
    ['B018', 'S015', -1, null]
  ];

  // bookId, memberId, days from today, status
  const RESERVATIONS = [
    ['B020', 'S001', -3, 'pending'],
    ['B020', 'S011', -1, 'pending'],
    ['B013', 'S019', -2, 'pending'],
    ['B024', 'T004', -4, 'pending'],
    ['B027', 'S011', -24, 'fulfilled'],
    ['B005', 'S017', -15, 'cancelled']
  ];

  const LISTS = [
    {
      teacherId: 'T002', className: '8A', title: 'Novels for the winter term',
      note: 'Pick any two. We will discuss themes of friendship and courage in class.',
      bookIds: ['B019', 'B018', 'B015', 'B028', 'B021'], created: -12
    },
    {
      teacherId: 'T001', className: '10A', title: 'Big ideas in science',
      note: 'Optional reading to go beyond the textbook before board exams.',
      bookIds: ['B001', 'B003', 'B002', 'B005'], created: -20
    },
    {
      teacherId: 'T005', className: '9A', title: 'Start programming',
      note: 'Begin with Python Crash Course, then read Hello World for the bigger picture.',
      bookIds: ['B037', 'B034', 'B036'], created: -6
    },
    {
      teacherId: 'T006', className: '6A', title: 'Stories of brave young people',
      note: 'Read along with our unit on heroes from history.',
      bookIds: ['B027', 'B028', 'B017'], created: -9
    }
  ];

  const SETTINGS = {
    schoolName: 'FG Public School Shorkot Cantt',
    loanDays: 14,
    finePerDay: 5,
    maxStudent: 3,
    maxTeacher: 6
  };

  const pad = (n, w) => String(n).padStart(w, '0');

  function build(D) {
    const today = D.today();
    const at = (offset, minutes) => D.parse(D.add(today, offset)).getTime() - 2 * 3600e3 + (minutes || 0) * 60e3;

    const books = BOOKS.map((b, i) => ({
      id: 'B' + pad(i + 1, 3),
      title: b[0], author: b[1], subject: b[2], level: b[3], year: b[4], copies: b[5], description: b[6],
      accession: 'ACC-' + (1001 + i),
      shelf: SHELF[b[2]] + '-' + (1 + (i % 4)),
      added: D.add(today, -(BOOKS.length - i) * 7)
    }));

    const users = [{ id: 'L001', name: 'Ayesha Khan', role: 'admin', title: 'Head Librarian', joined: D.add(today, -1400) }];
    TEACHERS.forEach((t, i) => users.push({
      id: 'T' + pad(i + 1, 3), name: t[0], role: 'teacher', subject: t[1],
      roll: 'STF-' + pad(11 + i * 3, 3), joined: D.add(today, -900 + i * 40)
    }));
    STUDENTS.forEach((name, i) => users.push({
      id: 'S' + pad(i + 1, 3), name, role: 'student', className: CLASSES[Math.floor(i / 4)],
      roll: 'GPS-' + pad(1001 + i, 4), joined: D.add(today, -600 + i * 9)
    }));

    const loans = LOANS.map((l, i) => {
      const issueDate = D.add(today, l[2]);
      const dueDate = D.add(issueDate, SETTINGS.loanDays);
      const returnDate = l[3] == null ? null : D.add(today, l[3]);
      const late = returnDate ? Math.max(0, D.diff(dueDate, returnDate)) : 0;
      const fine = late * SETTINGS.finePerDay;
      return {
        id: 'L' + pad(i + 1, 4), bookId: l[0], memberId: l[1],
        issueDate, dueDate, returnDate, fine, finePaid: fine === 0 ? true : !!l[4]
      };
    });

    const reservations = RESERVATIONS.map((r, i) => ({
      id: 'R' + pad(i + 1, 3), bookId: r[0], memberId: r[1], date: D.add(today, r[2]), status: r[3]
    }));

    const lists = LISTS.map((l, i) => Object.assign({}, l, {
      id: 'RL' + pad(i + 1, 3), created: D.add(today, l.created), bookIds: l.bookIds.slice()
    }));

    // Recent activity derived from the seeded loans and reservations.
    const byId = (arr, id) => arr.find(x => x.id === id);
    const events = [];
    LOANS.forEach((l, i) => {
      const book = byId(books, l[0]), member = byId(users, l[1]);
      events.push({ at: at(l[2], 30 + i), type: 'issue', text: `Issued “${book.title}” to ${member.name}` });
      if (l[3] != null) events.push({ at: at(l[3], 90 + i), type: 'return', text: `${member.name} returned “${book.title}”` });
    });
    RESERVATIONS.forEach((r, i) => {
      const book = byId(books, r[0]), member = byId(users, r[1]);
      events.push({ at: at(r[2], 200 + i), type: 'reserve', text: `${member.name} reserved “${book.title}”` });
    });
    const activity = events.sort((a, b) => b.at - a.at).slice(0, 30);

    return { books, users, loans, reservations, lists, activity, settings: Object.assign({}, SETTINGS) };
  }

  return { build };
})();
