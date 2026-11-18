# Book Manager: Full Stack CRUD Demo (Angular + Spring Boot + PostgreSQL)

This guide walks through building a small "Book Manager" app:

- **Frontend:** Angular (standalone components, reactive forms, signals)
- **Backend:** Spring Boot REST API (Spring Web, Validation, Spring Data JPA)
- **Database:** PostgreSQL with a single `books` table

```
┌──────────────┐   HTTP/JSON    ┌──────────────────┐ JPA/Hibernate ┌────────────┐
│ Angular      │ ─────────────▶ │ Spring Boot      │ ────────────▶ │ PostgreSQL │
│ :4200        │ ◀───────────── │ :8080            │ ◀──────────── │ :5432      │
└──────────────┘                └──────────────────┘               └────────────┘
   Form + Dashboard              Controller → DTO → DAO              books table
```

## Roadmap

The app is built front to back. You first make the UI, then the API it talks to, then the database layer behind the API.

| # | Step | What you build | Checkpoint (how you know it worked) |
|---|------|----------------|-------------------------------------|
| 1 | [Create the Angular project](#step-1--create-the-angular-project) | New Angular app with `HttpClient` turned on | Angular welcome page loads at `localhost:4200` |
| 2 | [Build the page](#step-2--build-the-page-create-form--dashboard) | `Book` model, `BookService` (HTTP calls), `Books` component with a create form and a dashboard with **Finish** and **Delete** buttons | Form and empty dashboard render, with a "Could not load books" banner, which is expected because there's no API yet |
| 3 | [Create the Spring Boot app and connect to Postgres](#step-3--create-the-spring-boot-app-and-connect-to-postgres) | Postgres in Docker, Spring project (Web, Validation, Spring Data JPA, PostgreSQL Driver), connection settings, CORS for `localhost:4200` | API starts on `localhost:8080` without connection errors |
| 4 | [Define a DTO to validate the request body](#step-4--define-a-dto-to-validate-the-request-body) | `CreateBookRequest` with validation rules, plus an exception handler that returns field errors as a 400 response | Invalid input will be rejected with clear messages once the controller exists in Step 5 |
| 5 | [Define a DAO to interact with Postgres](#step-5--define-a-dao-to-interact-with-postgres) | `Book` JPA entity, `BookDao` repository, `BookController` exposing the REST endpoints | Hibernate creates the `books` table, and the endpoints respond to `curl` |
| ✓ | [Run it end to end](#run-it-end-to-end) | Start all three pieces and walk through the demo script | Add, finish and delete books in the browser, and see the rows in Postgres |

How a request flows through the finished app:

```
Books component ─▶ BookService ─▶ BookController ─▶ CreateBookRequest (validation) ─▶ BookDao ─▶ books table
   (Step 2)          (Step 2)        (Step 5)              (Step 4)                    (Step 5)    (Steps 3 & 5)
```

### REST API we'll build

| Method | Endpoint                  | Purpose                 |
|--------|---------------------------|-------------------------|
| GET    | `/api/books`              | List all books          |
| POST   | `/api/books`              | Create a book           |
| PATCH  | `/api/books/{id}/finish`  | Mark a book as finished |
| DELETE | `/api/books/{id}`         | Delete a book           |

### Prerequisites

- **Node.js** (current LTS) and npm
- **Angular CLI**: `npm install -g @angular/cli`
- **JDK 21** (17+ works)
- **Docker** (easiest way to run Postgres), or a local PostgreSQL install
- An IDE (VS Code for Angular, IntelliJ/VS Code for Spring)

Suggested folder layout:

```
book-manager/
├── book-manager-ui/     # Angular app
└── book-manager-api/    # Spring Boot app
```

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
    // The Spring API returns { field: message } for validation errors (see Step 4)
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

Run `ng serve` again. The form and an empty dashboard will render, with an error banner saying the API isn't reachable — that's expected until the backend exists.

---

## Step 3 – Create the Spring Boot App and Connect to Postgres

### 3.1 Start PostgreSQL

Using Docker:

```bash
docker run --name book-manager-db \
  -e POSTGRES_DB=bookmanager \
  -e POSTGRES_USER=bookuser \
  -e POSTGRES_PASSWORD=bookpass \
  -p 5432:5432 \
  -d postgres:17
```

(If you have Postgres installed locally, create a `bookmanager` database and a user instead.)

### 3.2 Generate the project

Go to <https://start.spring.io> and choose:

- **Project:** Maven
- **Language:** Java
- **Spring Boot:** latest stable release
- **Group:** `com.example`
- **Artifact:** `book-manager-api`
- **Java:** 21
- **Dependencies:**
  - **Spring Web** – REST controllers
  - **Validation** – Jakarta Bean Validation for the DTO
  - **Spring Data JPA** – Hibernate ORM + repository support for the DAO
  - **PostgreSQL Driver**

Click **Generate**, unzip into `book-manager/book-manager-api`, and open it in your IDE.

Target package structure:

```
src/main/java/com/example/bookmanagerapi/
├── BookManagerApiApplication.java
├── config/
│   └── WebConfig.java              # CORS
├── controller/
│   ├── BookController.java
│   └── GlobalExceptionHandler.java
├── dao/
│   └── BookDao.java                # Spring Data JPA repository
├── dto/
│   └── CreateBookRequest.java
└── model/
    └── Book.java                   # JPA entity
src/main/resources/
└── application.properties
```

### 3.3 Configure the database connection

`src/main/resources/application.properties`:

```properties
spring.application.name=book-manager-api

# PostgreSQL connection
spring.datasource.url=jdbc:postgresql://localhost:5432/bookmanager
spring.datasource.username=bookuser
spring.datasource.password=bookpass

# JPA / Hibernate
# "update" lets Hibernate create/alter the books table from the @Entity class on startup
spring.jpa.hibernate.ddl-auto=update
# Print the SQL Hibernate runs (handy during a demo)
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
# Don't keep the DB session open during view rendering (not needed for a REST API)
spring.jpa.open-in-view=false
```

### 3.4 How the `books` table gets created

With JPA there's no SQL script to write. In Step 5 we define a `Book` entity, and because of `ddl-auto=update`, Hibernate creates the table from it at startup. The result is equivalent to:

```sql
CREATE TABLE books (
    id       BIGSERIAL    PRIMARY KEY,   -- from @Id + GenerationType.IDENTITY
    title    VARCHAR(255) NOT NULL,
    author   VARCHAR(255) NOT NULL,
    pages    INTEGER      NOT NULL,
    finished BOOLEAN      NOT NULL
);
```

> `ddl-auto=update` is great for demos but not for production — there you'd use `validate` plus a migration tool like Flyway or Liquibase.

### 3.5 Allow the Angular app to call the API (CORS)

Angular runs on port 4200 and Spring on 8080, so the browser needs CORS permission.

`config/WebConfig.java`:

```java
package com.example.bookmanagerapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PATCH", "DELETE")
                .allowedHeaders("*");
    }
}
```

### 3.6 Verify the connection

```bash
./mvnw spring-boot:run
```

The app should start on port 8080 with no errors. (The `books` table appears once the `Book` entity from Step 5 exists — come back and run this check after Step 5.) Confirm the table was created:

```bash
docker exec -it book-manager-db psql -U bookuser -d bookmanager -c "\d books"
```

---

## Step 4 – Define a DTO to Validate the Request Body

The DTO describes exactly what the client is allowed to send when creating a book. Note it has **no `id` or `finished`** — the server controls those.

`dto/CreateBookRequest.java`:

```java
package com.example.bookmanagerapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateBookRequest(

        @NotBlank(message = "is required")
        @Size(max = 255, message = "must be 255 characters or fewer")
        String title,

        @NotBlank(message = "is required")
        @Size(max = 255, message = "must be 255 characters or fewer")
        String author,

        @NotNull(message = "is required")
        @Positive(message = "must be greater than 0")
        Integer pages
) {}
```

Validation is triggered by annotating the controller parameter with `@Valid` (Step 5). When validation fails, Spring throws `MethodArgumentNotValidException`. Turn that into a clean `400` response that the Angular `describeError()` method understands:

`controller/GlobalExceptionHandler.java`:

```java
package com.example.bookmanagerapi.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return errors;
    }
}
```

Example: posting `{"title": "", "author": "X", "pages": 0}` returns:

```json
{ "title": "is required", "pages": "must be greater than 0" }
```

---

## Step 5 – Define a DAO to Interact with Postgres

With JPA, the "DAO" is a **Spring Data repository**: an interface that Spring implements for you at runtime. Before we can define it, we need a JPA **entity** that maps to the `books` table.

### 5.1 The JPA entity

`model/Book.java` – each instance maps to one row in `books`:

```java
package com.example.bookmanagerapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private int pages;

    @Column(nullable = false)
    private boolean finished = false;

    // JPA requires a no-args constructor
    protected Book() {}

    public Book(String title, String author, int pages) {
        this.title = title;
        this.author = author;
        this.pages = pages;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public int getPages() { return pages; }
    public boolean isFinished() { return finished; }

    public void markFinished() { this.finished = true; }
}
```

Notes:

- JPA entities must be classes (not records) with a no-args constructor.
- `GenerationType.IDENTITY` maps to Postgres' auto-incrementing `BIGSERIAL`/identity column.
- There are no setters for `title`, `author` or `pages` — only `markFinished()` — because the app never edits those fields.
- Jackson serializes the getters, so the JSON matches the Angular `Book` interface: `{ id, title, author, pages, finished }`.

### 5.2 The DAO (Spring Data JPA repository)

`dao/BookDao.java`:

```java
package com.example.bookmanagerapi.dao;

import com.example.bookmanagerapi.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookDao extends JpaRepository<Book, Long> {
}
```

That's the whole DAO. By extending `JpaRepository<Book, Long>`, you inherit the methods we need, with no SQL written:

| Method | SQL Hibernate generates |
|---|---|
| `findAll(Sort.by("id"))` | `SELECT ... FROM books ORDER BY id` |
| `findById(id)` | `SELECT ... FROM books WHERE id = ?` |
| `save(book)` | `INSERT` for a new entity, `UPDATE` for an existing one |
| `existsById(id)` | `SELECT count(*) ... WHERE id = ?` |
| `deleteById(id)` | `DELETE FROM books WHERE id = ?` |

> Need a custom query later? Add a method like `List<Book> findByFinished(boolean finished);` and Spring Data generates the query from the method name.

### 5.3 Expose the DAO through a REST controller

The controller ties everything together: it validates the incoming DTO with `@Valid`, converts it into a `Book` entity, and uses the DAO.

`controller/BookController.java`:

```java
package com.example.bookmanagerapi.controller;

import com.example.bookmanagerapi.dao.BookDao;
import com.example.bookmanagerapi.dto.CreateBookRequest;
import com.example.bookmanagerapi.model.Book;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookDao bookDao;

    public BookController(BookDao bookDao) {
        this.bookDao = bookDao;
    }

    @GetMapping
    public List<Book> getAll() {
        return bookDao.findAll(Sort.by("id"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book create(@Valid @RequestBody CreateBookRequest request) {
        Book book = new Book(request.title().trim(), request.author().trim(), request.pages());
        return bookDao.save(book);
    }

    @PatchMapping("/{id}/finish")
    public ResponseEntity<Book> finish(@PathVariable long id) {
        return bookDao.findById(id)
                .map(book -> {
                    book.markFinished();
                    return ResponseEntity.ok(bookDao.save(book));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        if (!bookDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

> Returning the entity directly keeps the demo short. In larger apps you'd usually map entities to a response DTO (e.g. `BookResponse`) so the API shape isn't tied to the database model.

Restart the API (`./mvnw spring-boot:run`). With `show-sql=true` you'll see Hibernate's `create table books ...` in the console on first start, and every query as you use the app.

---

## Run It End to End

1. **Database:** `docker start book-manager-db` (if not already running)
2. **API:** in `book-manager-api` → `./mvnw spring-boot:run`
3. **UI:** in `book-manager-ui` → `ng serve`
4. Open <http://localhost:4200>

### Demo script

1. Add *Dune* by Frank Herbert, 412 pages → it appears in the dashboard.
2. Try submitting with blank fields → the Angular form blocks it (client-side validation).
3. Click **Finish** → the row is struck through and the counter updates.
4. Click **Delete** → the row disappears.
5. Show the data in Postgres:
   ```bash
   docker exec -it book-manager-db psql -U bookuser -d bookmanager -c "SELECT * FROM books;"
   ```

### Test the API directly (shows server-side validation)

```bash
# Create
curl -i -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Dune","author":"Frank Herbert","pages":412}'

# Invalid request → 400 with field errors from the DTO
curl -i -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"","author":"","pages":0}'

# List
curl http://localhost:8080/api/books

# Finish / Delete
curl -i -X PATCH  http://localhost:8080/api/books/1/finish
curl -i -X DELETE http://localhost:8080/api/books/1
```

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Browser console shows a **CORS error** | Check `WebConfig` allows `http://localhost:4200` and the HTTP method used. |
| `Connection refused` on startup of Spring | Postgres isn't running, or the URL/port in `application.properties` is wrong. |
| `password authentication failed` | Username/password don't match the Docker `-e` values. |
| `relation "books" does not exist` | `spring.jpa.hibernate.ddl-auto=update` missing, or the `Book` class isn't annotated with `@Entity` / isn't under the main application's package. |
| `No default constructor for entity` | The `Book` entity needs a no-args constructor (`protected Book() {}`). |
| `Not a managed type: class ...Book` | The entity is outside the package of `BookManagerApiApplication`, so it isn't scanned. |
| Angular shows "Could not load books" | API isn't running on port 8080, or the `baseUrl` in `BookService` is wrong. |
| `NullInjectorError: No provider for HttpClient` | `provideHttpClient()` wasn't added in `app.config.ts`. |

## Possible Next Steps

- Add an **edit** endpoint (`PUT /api/books/{id}`) with an `UpdateBookRequest` DTO
- Add a **service layer** between controller and DAO for business rules
- Use **Flyway** for versioned migrations and switch `ddl-auto` to `validate`
- Move the API URL into Angular **environment files** or use an `ng serve` proxy config
- Add tests: `@WebMvcTest` for the controller, `@DataJpaTest` + Testcontainers for the repository
