# FG Public School Shorkot Cantt — Digital Library

Front-end screens for a school library management system, built with plain HTML, CSS and JavaScript. There is no backend yet: all data is sample data kept in the browser's `localStorage`, so actions on one screen show up on the others.

## Run it

Serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from the file system also works in most browsers.

**Demo sign-in:** choose a role and a name on the login screen. Every account uses the password `library123`.

## Screens

| Role | Screens |
| --- | --- |
| Public | Landing (`index.html`), Sign in (`login.html`) |
| Librarian (`admin/`) | Dashboard, Books (add/edit/delete), Issue & Return, Members, Member profile, Reservations, Reports (printable), Settings |
| Teacher (`teacher/`) | Dashboard, Catalog, My Books, Reading Lists, Profile |
| Student (`student/`) | Dashboard, Catalog, My Books, Profile |
| Everyone | Book detail (`book.html?id=B001`) |

## How the screens connect

- Issuing or returning a book as the librarian updates copy counts, the member's **My Books** page and dashboard, and the reports.
- A student or teacher can **reserve** a book when every copy is out. The reservation shows up in the librarian's **Reservations** queue, and the next returned copy is held for them.
- Late returns add a fine automatically (Rs 5/day by default). The librarian collects it from the member's profile.
- A teacher's **reading list** appears on the dashboard of every student in that class.
- **Settings** changes the loan period, fine rate and borrowing limits. **Reset demo data** restores the original sample data.

## Project layout

```
index.html  login.html  book.html
admin/      librarian screens
teacher/    teacher screens
student/    student screens
css/        main.css imports variables, base, layout, components, pages
js/data.js  sample data (dates are relative to today)
js/store.js localStorage data layer and library rules
js/auth.js  demo sign-in and role guards
js/ui.js    app shell, icons, tables, modals, toasts
js/pages/   one script per screen
```

## Palette

Academic navy `#1E3A5F` and gold `#F2B134` on a cream background `#FAF7F0`, with Merriweather headings and Inter body text.
