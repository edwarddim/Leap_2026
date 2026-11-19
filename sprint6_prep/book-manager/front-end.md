# Book Manager, Part 1: Front End (Angular)

This is the front-end half of the Book Manager demo, a small full-stack CRUD app:

- **Frontend (this guide):** Angular (standalone components, reactive forms, signals)
- **Backend ([back-end.md](back-end.md)):** Spring Boot REST API with Spring Data JPA, PostgreSQL, and the Google Books API

```
┌──────────────┐   HTTP/JSON    ┌──────────────────┐ JPA/Hibernate ┌────────────┐
│ Angular      │ ─────────────▶ │ Spring Boot      │ ────────────▶ │ PostgreSQL │
│ :4200        │ ◀───────────── │ :8080            │ ◀──────────── │ :5432      │
└──────────────┘                └──────────────────┘               └────────────┘
   Form + Dashboard        Controller → DTO → Service → DAO          books table
                                         │   ▲
                          HTTPS + API key│   │ JSON         (back end, Step 4)
                                         ▼   │
                                ┌──────────────────┐
                                │ Google Books API │
                                └──────────────────┘
```

## Roadmap

You first build the page, then add a book search that uses the back end's Google Books feature. The page shows a "Could not load books" banner until the back end is running.

| # | Step | What you build | Checkpoint (how you know it worked) |
|---|------|----------------|-------------------------------------|
| 1 | [Create the Angular project](#step-1--create-the-angular-project) | New Angular app with `HttpClient` turned on | Angular welcome page loads at `localhost:4200` |
| 2 | [Build the page](#step-2--build-the-page-create-form--dashboard) | `Book` model, `BookService` (HTTP calls), `Books` component with a create form and a dashboard with **Finish** and **Delete** buttons | Form and empty dashboard render. With the back end running, you can add, finish and delete books |
| 3 | [Add Google Books search to the form](#step-3--add-google-books-search-to-the-form) | A "Find a Book" search box whose **Use** button fills in the form (needs back-end Step 4) | Searching "dune" lists results, and **Use** fills in the form |
| ✓ | [Run it end to end](#run-it-end-to-end) | Start the database, API and UI, then walk through the demo script | Add, finish and delete books in the browser, and see the rows in Postgres |

How a request flows from the page to the database:

```
Books component ─▶ BookService ─▶ HTTP ─▶ Spring API (back-end.md) ─▶ PostgreSQL / Google Books
 (Step 2.3)        (Step 2.2)
```

## Project Structure

The Angular app lives next to the Spring app in one `book-manager/` folder:

```
book-manager/
├── book-manager-ui/                 # Angular app (this guide)
└── book-manager-api/                # Spring Boot app (back-end.md)
```

Files marked ★ are ones you create or edit in this guide. Everything else comes from `ng new`, and generated folders like `node_modules/` are left out.

```
book-manager-ui/
├── angular.json
├── package.json
├── tsconfig.json
├── public/                          # static assets (favicon, images)
└── src/
    ├── index.html
    ├── main.ts                      # bootstraps App with appConfig
    ├── styles.css                   # global styles
    └── app/
        ├── app.ts                   ★ root component, renders <app-books />   (Step 2.4)
        ├── app.config.ts            ★ adds provideHttpClient()                (Step 1)
        ├── app.routes.ts
        └── books/
            ├── book.model.ts        ★ Book, CreateBookRequest, BookSuggestion (Steps 2.1, 3)
            ├── book.service.ts      ★ HTTP calls to the Spring API            (Steps 2.2, 3)
            ├── books.ts             ★ form, dashboard + search logic          (Steps 2.3, 3)
            ├── books.html           ★ form, dashboard + search template       (Steps 2.3, 3)
            └── books.css            ★ component styles                        (Steps 2.3, 3)
```

## API the Front End Calls

These endpoints are built in [back-end.md](back-end.md). `BookService` calls them at `http://localhost:8080`.

| Method | Endpoint                  | Purpose                 |
|--------|---------------------------|-------------------------|
| GET    | `/api/books`              | List all books          |
| POST   | `/api/books`              | Create a book           |
| PATCH  | `/api/books/{id}/finish`  | Mark a book as finished |
| DELETE | `/api/books/{id}`         | Delete a book           |
| GET    | `/api/books/search?q=...` | Search Google Books for book details (back end, Step 4) |

## Prerequisites

- **Node.js** (current LTS) and npm
- **Angular CLI**: `npm install -g @angular/cli`
- An IDE (VS Code works well)
- The back end from [back-end.md](back-end.md), to load and save real data (the page still renders without it)

Create the Angular project inside the `book-manager/` folder, as shown in [Project Structure](#project-structure).

---

## Step 1 – Create the Angular Project

```bash
mkdir book-manager && cd book-manager
ng new book-manager-ui --style=css --ssr=false
```

When prompted, accept the defaults (routing is not required for this demo).

Run it to confirm everything works:

```bash
cd book-manager-ui
ng serve
```

Open <http://localhost:4200>. You should see the Angular welcome page.

### Enable HttpClient

Open `src/app/app.config.ts` and add `provideHttpClient()`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

> Keep any other providers the CLI generated (e.g. zone/zoneless change detection or error listeners) — just add `provideHttpClient()` to the list.

---

## Step 2 – Build the Page: Create Form + Dashboard

We'll create three pieces:

1. A **model** describing a book
2. A **service** that calls the Spring API
3. A **component** with the create form and the dashboard

### 2.1 The model

Create `src/app/books/book.model.ts`:

```ts
export interface Book {
  id: number;
  title: string;
  author: string;
  pages: number;
  finished: boolean;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  pages: number;
}
```

### 2.2 The service

Create `src/app/books/book.service.ts`:

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, CreateBookRequest } from './book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/books';

  getAll(): Observable<Book[]> {
    return this.http.get<Book[]>(this.baseUrl);
  }

  create(request: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(this.baseUrl, request);
  }

  finish(id: number): Observable<Book> {
    return this.http.patch<Book>(`${this.baseUrl}/${id}/finish`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### 2.3 The component

Generate the component:

```bash
ng generate component books
```

> Recent Angular CLIs generate `books.ts`, `books.html`, `books.css` with a class named `Books`. Older versions generate `books.component.ts` with a class named `BooksComponent` — adjust names below if so.

#### `src/app/books/books.ts`

```ts
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Book } from './book.model';
import { BookService } from './book.service';

@Component({
  selector: 'app-books',
  imports: [ReactiveFormsModule],
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);

  books = signal<Book[]>([]);
  error = signal<string | null>(null);

  totalCount = computed(() => this.books().length);
  finishedCount = computed(() => this.books().filter(b => b.finished).length);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    author: ['', [Validators.required, Validators.maxLength(255)]],
    pages: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAll().subscribe({
      next: books => this.books.set(books),
      error: () => this.error.set('Could not load books. Is the API running?'),
    });
  }

  addBook(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.bookService.create(this.form.getRawValue()).subscribe({
      next: created => {
        this.books.update(list => [...list, created]);
        this.form.reset();
        this.error.set(null);
      },
      error: err => this.error.set(this.describeError(err)),
    });
  }

  finish(book: Book): void {
    this.bookService.finish(book.id).subscribe({
      next: updated =>
        this.books.update(list => list.map(b => (b.id === updated.id ? updated : b))),
      error: err => this.error.set(this.describeError(err)),
    });
  }

  remove(book: Book): void {
    this.bookService.delete(book.id).subscribe({
      next: () => this.books.update(list => list.filter(b => b.id !== book.id)),
      error: err => this.error.set(this.describeError(err)),
    });
  }

  private describeError(err: any): string {
    // The Spring API returns { field: message } for validation errors (see back-end.md, Step 2)
    if (err?.status === 400 && err.error && typeof err.error === 'object') {
      return Object.entries(err.error).map(([f, m]) => `${f}: ${m}`).join(', ');
    }
    return 'Something went wrong. Please try again.';
  }
}
```

#### `src/app/books/books.html`

```html
<h1>📚 Book Manager</h1>

@if (error()) {
  <p class="error">{{ error() }}</p>
}

<section class="card">
  <h2>Add a Book</h2>
  <form [formGroup]="form" (ngSubmit)="addBook()">
    <label>
      Title
      <input formControlName="title" placeholder="Dune" />
    </label>
    @if (form.controls.title.touched && form.controls.title.invalid) {
      <small class="error">Title is required.</small>
    }

    <label>
      Author
      <input formControlName="author" placeholder="Frank Herbert" />
    </label>
    @if (form.controls.author.touched && form.controls.author.invalid) {
      <small class="error">Author is required.</small>
    }

    <label>
      Pages
      <input type="number" formControlName="pages" min="1" />
    </label>
    @if (form.controls.pages.touched && form.controls.pages.invalid) {
      <small class="error">Pages must be at least 1.</small>
    }

    <button type="submit" [disabled]="form.invalid">Add Book</button>
  </form>
</section>

<section class="card">
  <h2>Dashboard</h2>
  <p class="stats">{{ finishedCount() }} of {{ totalCount() }} books finished</p>

  @if (books().length === 0) {
    <p>No books yet — add one above.</p>
  } @else {
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Pages</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (book of books(); track book.id) {
          <tr [class.finished]="book.finished">
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.pages }}</td>
            <td>{{ book.finished ? '✅ Finished' : '📖 Reading' }}</td>
            <td>
              <button (click)="finish(book)" [disabled]="book.finished">Finish</button>
              <button class="danger" (click)="remove(book)">Delete</button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  }
</section>
```

#### `src/app/books/books.css`

```css
:host { display: block; max-width: 800px; margin: 2rem auto; font-family: system-ui, sans-serif; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem 1.5rem; margin-bottom: 1.5rem; }
form { display: flex; flex-direction: column; gap: 0.5rem; }
label { display: flex; flex-direction: column; font-weight: 600; }
input { padding: 0.4rem; font-size: 1rem; }
button { padding: 0.4rem 0.8rem; cursor: pointer; margin-right: 0.25rem; }
button.danger { background: #c62828; color: white; border: none; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
tr.finished td { color: #777; text-decoration: line-through; }
tr.finished td:last-child, tr.finished td:nth-child(4) { text-decoration: none; }
.error { color: #c62828; }
.stats { color: #555; }
```

### 2.4 Show the component on the root page

Replace `src/app/app.ts`:

```ts
import { Component } from '@angular/core';
import { Books } from './books/books';

@Component({
  selector: 'app-root',
  imports: [Books],
  template: `<app-books />`,
})
export class App {}
```

> You can delete `app.html` / `app.css` since we're using an inline template, or keep `templateUrl` and put `<app-books />` in `app.html`.

Run `ng serve` again. The form and an empty dashboard will render, with an error banner saying the API isn't reachable — that's expected until the back end from [back-end.md](back-end.md) is running.

---

## Step 3 – Add Google Books Search to the Form

This step adds a "Find a Book" search box above the form. Clicking **Use** on a result fills in the title, author and pages.

> **Needs the back end's Step 4.** The search box calls `GET /api/books/search`, which the Spring API gets from Google Books. Complete [back-end.md, Step 4](back-end.md#step-4--look-up-books-with-the-google-books-api) first. The browser never talks to Google directly, and the API key stays on the server.

### 3.1 The model: `book.model.ts`

Add the interface:

```ts
export interface BookSuggestion {
  googleId: string;
  title: string;
  author: string;
  pages: number | null;
  thumbnailUrl: string | null;
}
```

### 3.2 The service: `book.service.ts`

Import `BookSuggestion` from `./book.model`, then add a method:

```ts
  search(query: string): Observable<BookSuggestion[]> {
    return this.http.get<BookSuggestion[]>(`${this.baseUrl}/search`, { params: { q: query } });
  }
```

### 3.3 The component logic: `books.ts`

Update the imports and add these members to the `Books` class:

```ts
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Book, BookSuggestion } from './book.model';

  // ...inside the Books class:
  searchControl = new FormControl('', { nonNullable: true });
  suggestions = signal<BookSuggestion[]>([]);
  searching = signal(false);

  searchGoogle(): void {
    const query = this.searchControl.value.trim();
    if (!query) return;
    this.searching.set(true);
    this.bookService.search(query).subscribe({
      next: results => {
        this.suggestions.set(results);
        this.searching.set(false);
      },
      error: () => {
        this.error.set('Book search is unavailable right now.');
        this.searching.set(false);
      },
    });
  }

  useSuggestion(s: BookSuggestion): void {
    this.form.patchValue({
      title: s.title,
      author: s.author,
      pages: s.pages ?? this.form.controls.pages.value,
    });
    this.suggestions.set([]);
  }
```

### 3.4 The template: `books.html`

Add this section above the "Add a Book" card:

```html
<section class="card">
  <h2>Find a Book</h2>
  <div class="search-row">
    <input [formControl]="searchControl" placeholder="Search Google Books by title or author"
           (keyup.enter)="searchGoogle()" />
    <button type="button" (click)="searchGoogle()" [disabled]="searching()">
      {{ searching() ? 'Searching…' : 'Search' }}
    </button>
  </div>

  @if (suggestions().length > 0) {
    <ul class="suggestions">
      @for (s of suggestions(); track s.googleId) {
        <li>
          @if (s.thumbnailUrl) {
            <img [src]="s.thumbnailUrl" [alt]="s.title" />
          }
          <div class="info">
            <strong>{{ s.title }}</strong>
            <span>{{ s.author }}@if (s.pages) { · {{ s.pages }} pages }</span>
          </div>
          <button type="button" (click)="useSuggestion(s)">Use</button>
        </li>
      }
    </ul>
  }
</section>
```

### 3.5 The styles: `books.css`

Add:

```css
.search-row { display: flex; gap: 0.5rem; }
.search-row input { flex: 1; }
.suggestions { list-style: none; padding: 0; margin: 1rem 0 0; }
.suggestions li { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.suggestions img { width: 40px; height: 60px; object-fit: cover; }
.suggestions .info { flex: 1; display: flex; flex-direction: column; }
```

`[formControl]` comes from `ReactiveFormsModule`, which the component already imports.

---

## Run It End to End

1. **Database and API:** start them as described in [back-end.md, Run the Back End](back-end.md#run-the-back-end)
2. **UI:** in `book-manager-ui`, run `ng serve`
3. Open <http://localhost:4200>

### Demo script

1. Search for "dune" in **Find a Book** and click **Use** on a result. The form fills in with the title, author and pages. Click **Add Book** and it appears in the dashboard.
2. Add another book by typing it in manually, such as *Project Hail Mary* by Andy Weir, 496 pages.
3. Try submitting with blank fields → the Angular form blocks it (client-side validation).
4. Click **Finish** → the row is struck through and the counter updates.
5. Click **Delete** → the row disappears.
6. Show the data in Postgres:
   ```bash
   docker exec -it book-manager-db psql -U bookuser -d bookmanager -c "SELECT * FROM books;"
   ```

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Angular shows "Could not load books" | The API isn't running on port 8080, or the `baseUrl` in `BookService` is wrong. |
| Browser console shows a **CORS error** | The back end's `WebConfig` must allow `http://localhost:4200` and the HTTP method used. See [back-end.md, Step 1.5](back-end.md#15-allow-the-angular-app-to-call-the-api-cors). |
| `NullInjectorError: No provider for HttpClient` | `provideHttpClient()` wasn't added in `app.config.ts`. |
| "Book search is unavailable right now." | The back end's search failed. Check the Google Books rows in [back-end.md, Troubleshooting](back-end.md#troubleshooting). |
| Clicking **Use** doesn't fill in pages | That book has no page count in Google Books. The Pages field keeps its current value. |

## Possible Next Steps

- Move the API URL into Angular **environment files**, or use an `ng serve` proxy config
- Add an **edit** form that uses a `PUT /api/books/{id}` endpoint
- Add component tests for `Books` with a mocked `BookService`
