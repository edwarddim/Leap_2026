# Book Manager, Part 2: Back End (Spring Boot + PostgreSQL)

This is the back-end half of the Book Manager demo, a small full-stack CRUD app:

- **Frontend ([front-end.md](front-end.md)):** Angular
- **Backend (this guide):** Spring Boot REST API (Spring Web, Validation, Spring Data JPA)
- **Database:** PostgreSQL with a single `books` table
- **External API:** Google Books API, called from Spring with an API key to look up book details

```
┌──────────────┐   HTTP/JSON    ┌──────────────────┐ JPA/Hibernate ┌────────────┐
│ Angular      │ ─────────────▶ │ Spring Boot      │ ────────────▶ │ PostgreSQL │
│ :4200        │ ◀───────────── │ :8080            │ ◀──────────── │ :5432      │
└──────────────┘                └──────────────────┘               └────────────┘
   Form + Dashboard        Controller → DTO → Service → DAO          books table
                                         │   ▲
                          HTTPS + API key│   │ JSON         (Step 4)
                                         ▼   │
                                ┌──────────────────┐
                                │ Google Books API │
                                └──────────────────┘
```

## Roadmap

You first set up the Spring app and its database connection, then the validation, then the data layer and endpoints, and finally the call to Google Books.

| # | Step | What you build | Checkpoint (how you know it worked) |
|---|------|----------------|-------------------------------------|
| 1 | [Create the Spring Boot app and connect to Postgres](#step-1--create-the-spring-boot-app-and-connect-to-postgres) | Postgres in Docker, Spring project (Web, Validation, Spring Data JPA, PostgreSQL Driver), connection settings, CORS for `localhost:4200` | API starts on `localhost:8080` without connection errors |
| 2 | [Define a DTO to validate the request body](#step-2--define-a-dto-to-validate-the-request-body) | `CreateBookRequest` with validation rules, plus an exception handler that returns field errors as a 400 response | Invalid input will be rejected with clear messages once the controller exists in Step 3 |
| 3 | [Define a DAO to interact with Postgres](#step-3--define-a-dao-to-interact-with-postgres) | `Book` JPA entity, `BookDao` repository, `BookService` with the business logic, `BookController` exposing the REST endpoints | Hibernate creates the `books` table, and <http://localhost:8080/api/books> shows `[]` in the browser |
| 4 | [Look up books with the Google Books API](#step-4--look-up-books-with-the-google-books-api) | Google Cloud API key read from an environment variable, `GoogleBooksClient` (`RestClient`), `BookSearchService`, `GET /api/books/search` endpoint | <http://localhost:8080/api/books/search?q=dune> shows suggestions in the browser |
| ✓ | [Run the back end](#run-the-back-end) | Start Postgres and the API together | The front end from [front-end.md](front-end.md) can load and save books |

How a request flows through the API:

```
HTTP request ─▶ BookController ─▶ CreateBookRequest ─▶ BookService ─▶ BookDao ─▶ books table
                  (Step 3.4)       (validation)          (Step 3.3)    (Step 3.2)   (Steps 1 & 3)
                                     (Step 2)
               BookController ─▶ BookSearchService ─▶ GoogleBooksClient ─▶ Google Books API
                  (Step 4.5)        (Step 4.5)            (Step 4.4)
```

## Project Structure

The Spring app lives next to the Angular app in one `book-manager/` folder:

```
book-manager/
├── book-manager-ui/                 # Angular app (front-end.md)
└── book-manager-api/                # Spring Boot app (this guide)
```

Files marked ★ are ones you create or edit in this guide. Everything else comes from Spring Initializr, and generated folders like `target/` are left out.

```
book-manager-api/
├── pom.xml                          # dependencies: Web, Validation, Data JPA, PostgreSQL
├── mvnw / mvnw.cmd                  # Maven wrapper (./mvnw spring-boot:run)
└── src/
    ├── main/
    │   ├── java/com/example/bookmanagerapi/
    │   │   ├── BookManagerApiApplication.java      ★ main class + @ConfigurationPropertiesScan (Step 4.3)
    │   │   ├── client/
    │   │   │   ├── GoogleBooksProperties.java       ★ google.books.* settings         (Step 4.3)
    │   │   │   ├── GoogleBooksResponse.java         ★ Google's JSON as records        (Step 4.4)
    │   │   │   ├── GoogleBooksClient.java           ★ RestClient call to Google       (Step 4.4)
    │   │   │   └── GoogleBooksUnavailableException.java ★ Google failure → 503        (Step 4.4)
    │   │   ├── config/
    │   │   │   └── WebConfig.java                  ★ CORS for localhost:4200         (Step 1.5)
    │   │   ├── controller/
    │   │   │   ├── BookController.java             ★ REST endpoints + search         (Steps 3.4, 4.5)
    │   │   │   └── GlobalExceptionHandler.java     ★ validation errors → 400         (Step 2)
    │   │   ├── dto/
    │   │   │   ├── CreateBookRequest.java          ★ validated request body          (Step 2)
    │   │   │   └── BookSuggestion.java             ★ search result sent to Angular   (Step 4.5)
    │   │   ├── service/
    │   │   │   ├── BookService.java                ★ business logic                  (Step 3.3)
    │   │   │   ├── BookSearchService.java          ★ Google results → suggestions    (Step 4.5)
    │   │   │   └── BookNotFoundException.java      ★ missing book → 404              (Step 3.3)
    │   │   ├── dao/
    │   │   │   └── BookDao.java                    ★ Spring Data JPA repository      (Step 3.2)
    │   │   └── model/
    │   │       └── Book.java                       ★ JPA entity → books table        (Step 3.1)
    │   └── resources/
    │       └── application.properties              ★ Postgres, JPA + Google settings (Steps 1.3, 4.2)
    └── test/java/com/example/bookmanagerapi/
        └── BookManagerApiApplicationTests.java
```

## REST API We'll Build

| Method | Endpoint                  | Purpose                 |
|--------|---------------------------|-------------------------|
| GET    | `/api/books`              | List all books          |
| POST   | `/api/books`              | Create a book           |
| PATCH  | `/api/books/{id}/finish`  | Mark a book as finished |
| DELETE | `/api/books/{id}`         | Delete a book           |
| GET    | `/api/books/search?q=...` | Search Google Books for book details (Step 4) |

## Prerequisites

- **JDK 21** (17+ works)
- **Docker** (easiest way to run Postgres), or a local PostgreSQL install
- An IDE (IntelliJ or VS Code)
- A **Google account** to create a Google Books API key in the Google Cloud Console (Step 4)

Create the Spring project inside the `book-manager/` folder, as shown in [Project Structure](#project-structure).

---

## Step 1 – Create the Spring Boot App and Connect to Postgres

### 1.1 Start PostgreSQL

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

### 1.2 Generate the project

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

Target package structure (also shown in full in [Project Structure](#project-structure)):

```
src/main/java/com/example/bookmanagerapi/
├── BookManagerApiApplication.java
├── client/                         # Google Books integration (added in Step 4)
├── config/
│   └── WebConfig.java              # CORS
├── controller/
│   ├── BookController.java
│   └── GlobalExceptionHandler.java
├── dao/
│   └── BookDao.java                # Spring Data JPA repository
├── dto/
│   └── CreateBookRequest.java
├── model/
│   └── Book.java                   # JPA entity
└── service/
    ├── BookService.java            # business logic, used by the controller
    └── BookNotFoundException.java  # becomes a 404 response
src/main/resources/
└── application.properties
```

### 1.3 Configure the database connection

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

### 1.4 How the `books` table gets created

With JPA there's no SQL script to write. In Step 3 we define a `Book` entity, and because of `ddl-auto=update`, Hibernate creates the table from it at startup. The result is equivalent to:

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

### 1.5 Allow the Angular app to call the API (CORS)

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
                .allowedMethods("GET", "POST", "PATCH", "DELETE");
    }
}
```

### 1.6 Verify the connection

```bash
./mvnw spring-boot:run
```

The app should start on port 8080 with no errors. (The `books` table appears once the `Book` entity from Step 3 exists — come back and run this check after Step 3.) Confirm the table was created:

```bash
docker exec -it book-manager-db psql -U bookuser -d bookmanager -c "\d books"
```

---

## Step 2 – Define a DTO to Validate the Request Body

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

Validation is triggered by annotating the controller parameter with `@Valid` (Step 3). When validation fails, Spring throws `MethodArgumentNotValidException`. Turn that into a clean `400` response that the Angular `describeError()` method ([front-end.md, Step 2.3](front-end.md#23-the-component)) understands:

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

## Step 3 – Define a DAO to Interact with Postgres

With JPA, the "DAO" is a **Spring Data repository**: an interface that Spring implements for you at runtime. Before we can define it, we need a JPA **entity** that maps to the `books` table.

### 3.1 The JPA entity

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

### 3.2 The DAO (Spring Data JPA repository)

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

### 3.3 Add a service layer

The controller shouldn't talk to the DAO directly. A **service** sits between them and holds the business logic: turning the DTO into an entity, marking a book finished, and deciding what happens when a book doesn't exist. That leaves the controller with just the HTTP work, and the logic can be tested without a web layer.

```
BookController  ──▶  BookService  ──▶  BookDao  ──▶  Postgres
  (HTTP only)      (business logic)   (data access)
```

> This is the Spring backend's `BookService`. It is separate from the Angular `BookService` in [front-end.md, Step 2](front-end.md#step-2--build-the-page-create-form--dashboard), which only makes HTTP calls.

First, add an exception for a missing book. `@ResponseStatus` tells Spring to turn it into a `404 Not Found` response automatically.

`service/BookNotFoundException.java`:

```java
package com.example.bookmanagerapi.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class BookNotFoundException extends RuntimeException {

    public BookNotFoundException(long id) {
        super("Book " + id + " not found");
    }
}
```

`service/BookService.java`:

```java
package com.example.bookmanagerapi.service;

import com.example.bookmanagerapi.dao.BookDao;
import com.example.bookmanagerapi.dto.CreateBookRequest;
import com.example.bookmanagerapi.model.Book;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BookService {

    private final BookDao bookDao;

    public BookService(BookDao bookDao) {
        this.bookDao = bookDao;
    }

    @Transactional(readOnly = true)
    public List<Book> getAllBooks() {
        return bookDao.findAll(Sort.by("id"));
    }

    public Book createBook(CreateBookRequest request) {
        Book book = new Book(request.title().trim(), request.author().trim(), request.pages());
        return bookDao.save(book);
    }

    public Book finishBook(long id) {
        Book book = bookDao.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
        book.markFinished();
        // No save() needed: inside a transaction, JPA detects the change
        // and issues the UPDATE when the method returns ("dirty checking").
        return book;
    }

    public void deleteBook(long id) {
        if (!bookDao.existsById(id)) {
            throw new BookNotFoundException(id);
        }
        bookDao.deleteById(id);
    }
}
```

Notes:

- `@Transactional` on the class runs each public method in one database transaction. If anything fails partway through, the changes are rolled back.
- `readOnly = true` on the read method tells Hibernate it can skip checking for changes, which is a small speed-up.
- The service throws `BookNotFoundException` instead of returning `Optional` or `boolean`, so the controller doesn't need any if/else logic for missing books.

### 3.4 Expose the service through a REST controller

The controller now only handles HTTP: it maps routes, validates the incoming DTO with `@Valid`, sets status codes, and hands everything else to `BookService`. It no longer knows the DAO exists.

`controller/BookController.java`:

```java
package com.example.bookmanagerapi.controller;

import com.example.bookmanagerapi.dto.CreateBookRequest;
import com.example.bookmanagerapi.model.Book;
import com.example.bookmanagerapi.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<Book> getAll() {
        return bookService.getAllBooks();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book create(@Valid @RequestBody CreateBookRequest request) {
        return bookService.createBook(request);
    }

    @PatchMapping("/{id}/finish")
    public Book finish(@PathVariable long id) {
        return bookService.finishBook(id);          // 404 if missing
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        bookService.deleteBook(id);                 // 404 if missing
    }
}
```

> Returning the entity directly keeps the demo short. In larger apps you'd usually map entities to a response DTO (e.g. `BookResponse`) so the API shape isn't tied to the database model.

Restart the API (`./mvnw spring-boot:run`). With `show-sql=true` you'll see Hibernate's `create table books ...` in the console on first start, and every query as you use the app.

## Step 4 – Look Up Books with the Google Books API

Typing in a book's details by hand is tedious. In this step the Spring API calls the **Google Books API** to search for books by title or author. The front end then uses a search result to fill in the create form ([front-end.md, Step 3](front-end.md#step-3--add-google-books-search-to-the-form)).

The browser never talks to Google, and it never sees the API key. Angular calls our Spring API, and Spring calls Google with the key, which stays on the server.

```
Angular ──GET /api/books/search?q=dune──▶ BookController ─▶ BookSearchService ─▶ GoogleBooksClient ──HTTPS + key──▶ Google Books API
        ◀──── [BookSuggestion, ...] ─────                     (maps the results)     (RestClient)    ◀── Google's JSON ──
```

What we'll add:

| File | Package | Purpose |
|---|---|---|
| `GoogleBooksProperties.java` | `client` | Reads the base URL, API key and result count from `application.properties` |
| `GoogleBooksResponse.java` | `client` | Records matching the parts of Google's JSON we use |
| `GoogleBooksClient.java` | `client` | Makes the HTTP call to Google with `RestClient` |
| `GoogleBooksUnavailableException.java` | `client` | Turns Google failures into a `503` response |
| `BookSuggestion.java` | `dto` | The small, clean result our API returns to Angular |
| `BookSearchService.java` | `service` | Calls the client and maps Google's data to `BookSuggestion` |
| `BookController.java` (edit) | `controller` | New `GET /api/books/search?q=...` endpoint |

No new dependencies are needed. `RestClient` is part of Spring Web, and Jackson (already included) handles the JSON.

### 4.1 Get a Google Books API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Open **APIs & Services → Library**, search for **Books API**, and click **Enable**.
3. Open **APIs & Services → Credentials**, then click **Create credentials → API key**.
4. **Recommended:** click **Edit API key**. Under **API restrictions**, choose **Restrict key** and select **Books API**, so the key can't be used for anything else.
5. Copy the key.

### 4.2 Store the key outside the code

Never put the key directly in `application.properties` or commit it to Git. Instead, read it from an environment variable.

Add to `src/main/resources/application.properties`:

```properties
# Google Books API
google.books.base-url=https://www.googleapis.com/books/v1
# Read from an environment variable. The empty default lets the app start without one,
# so the rest of the app still works and only search fails, with a clear error.
google.books.api-key=${GOOGLE_BOOKS_API_KEY:}
google.books.max-results=5
```

Set the variable in the terminal where you start the API:

```bash
# macOS / Linux
export GOOGLE_BOOKS_API_KEY=your-key-here

# Windows PowerShell
$env:GOOGLE_BOOKS_API_KEY="your-key-here"
```

> In IntelliJ, add it under **Run → Edit Configurations → Environment variables** instead.

### 4.3 Bind the settings to a properties record

`client/GoogleBooksProperties.java`:

```java
package com.example.bookmanagerapi.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "google.books")
public record GoogleBooksProperties(String baseUrl, String apiKey, int maxResults) {}
```

Spring fills this record from the `google.books.*` settings. `base-url` maps to `baseUrl`, `api-key` to `apiKey`, and `max-results` to `maxResults`. To have Spring find it, add `@ConfigurationPropertiesScan` to the main class:

`BookManagerApiApplication.java`:

```java
package com.example.bookmanagerapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BookManagerApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookManagerApiApplication.class, args);
    }
}
```

### 4.4 Build the Google Books client

#### Model Google's response

Google returns a large JSON document. We only model the fields we need, and `@JsonIgnoreProperties(ignoreUnknown = true)` tells Jackson to skip the rest. A shortened response looks like this:

```json
{
  "totalItems": 1234,
  "items": [
    {
      "id": "B1hSG45JCX4C",
      "volumeInfo": {
        "title": "Dune",
        "authors": ["Frank Herbert"],
        "pageCount": 412,
        "imageLinks": { "thumbnail": "http://books.google.com/books/content?id=..." }
      }
    }
  ]
}
```

`client/GoogleBooksResponse.java`:

**What this class does:** `GoogleBooksResponse` is a Java version of Google's JSON. When `GoogleBooksClient` calls `.body(GoogleBooksResponse.class)`, Jackson reads the response body and fills these records in. Each nested record matches one level of nesting in the JSON, so a JSON path like `items[0].volumeInfo.title` becomes `response.items().get(0).volumeInfo().title()` in Java. It holds data only, with no logic. It also stays inside the backend: `BookSearchService` turns it into `BookSuggestion` objects before anything goes to Angular.

```java
package com.example.bookmanagerapi.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Typed representation of the JSON returned by Google's
 * GET https://www.googleapis.com/books/v1/volumes?q=... endpoint.
 *
 * Jackson builds these records automatically. It matches each JSON field name
 * to the record component with the same name (e.g. "pageCount" -> pageCount).
 *
 * Google's real response has dozens of fields (publisher, description, ISBNs,
 * ratings, sale info...). We declare only the ones this app uses, and
 * @JsonIgnoreProperties(ignoreUnknown = true) tells Jackson to quietly skip the
 * rest instead of throwing an error. That also means a new field added by
 * Google later won't break us.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleBooksResponse(
        int totalItems,      // total number of matches Google found (not just the ones returned)
        List<Item> items     // the books on this page of results. NULL when nothing matched,
                             // because Google leaves the "items" field out instead of sending []
) {

    /**
     * One search result ("volume" in Google's terms).
     * Matches each object inside the "items" array.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(
            String id,              // Google's unique volume ID, e.g. "B1hSG45JCX4C"
            VolumeInfo volumeInfo   // the descriptive details of the book
    ) {}

    /**
     * The book's details. Matches the "volumeInfo" object.
     *
     * Wrapper types (Integer, List) are used instead of primitives because Google
     * leaves fields out when it doesn't have the data, and a missing field becomes
     * null. An int can't be null, so a book with no page count would fail to parse.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VolumeInfo(
            String title,
            List<String> authors,   // a list, because a book can have several authors (may be null)
            Integer pageCount,      // may be null
            ImageLinks imageLinks   // may be null when there's no cover image
    ) {}

    /**
     * Cover image URLs. Matches the "imageLinks" object.
     * Google also sends "smallThumbnail". We only use the regular thumbnail.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ImageLinks(String thumbnail) {}
}
```

#### The exception for when Google fails

`client/GoogleBooksUnavailableException.java`:

```java
package com.example.bookmanagerapi.client;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class GoogleBooksUnavailableException extends RuntimeException {

    public GoogleBooksUnavailableException(String message) {
        super(message);
    }
}
```

#### The client

`client/GoogleBooksClient.java`:

**What this class does:** `GoogleBooksClient` is the only class in the app that knows how to talk to Google. It knows the base URL, the API key, the timeouts, and how Google reports errors. Everything else just calls `searchVolumes("dune")` and gets Java objects back. Each call goes through four steps:

1. **Check the configuration.** If there's no API key, fail right away with a clear message rather than sending a request Google will reject.
2. **Build and send the request.** `RestClient` fills the query, result count and key into the URL template, encodes them, and sends `GET /volumes?...`.
3. **Parse the response.** Jackson turns the JSON body into a `GoogleBooksResponse`.
4. **Handle failures.** Any problem, whether an HTTP error from Google, a timeout or a network failure, is logged safely and rethrown as `GoogleBooksUnavailableException`. Spring turns that into a `503` response.

Keeping all of this in one class means that if Google changes its URL, if you switch the key to a request header, or if you add retries, only this file changes.

```java
package com.example.bookmanagerapi.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;

/**
 * Low-level HTTP client for the Google Books API.
 *
 * Responsibilities:
 *  - Holds a RestClient preconfigured with Google's base URL and timeouts
 *  - Adds the API key to every request
 *  - Converts Google's JSON into GoogleBooksResponse records
 *  - Translates every kind of failure into GoogleBooksUnavailableException
 *
 * It does NOT decide what to do with the results. Filtering and reshaping them
 * for our API is BookSearchService's job.
 *
 * @Component makes this a Spring bean, so Spring creates one shared instance and
 * injects it wherever it's needed (here, into BookSearchService).
 */
@Component
public class GoogleBooksClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleBooksClient.class);

    private final RestClient restClient;               // reusable, thread-safe HTTP client
    private final GoogleBooksProperties properties;    // base URL, API key, max results

    /**
     * Spring calls this constructor and passes in the google.books.* settings
     * from application.properties (bound in Step 4.3).
     *
     * The RestClient is built once here and reused for every request. Building
     * a new one per request would waste resources.
     */
    public GoogleBooksClient(GoogleBooksProperties properties) {
        this.properties = properties;

        // Without timeouts, a slow or unresponsive Google would leave our API request
        // (and the user's spinner in Angular) waiting indefinitely.
        //   connectTimeout: max time to open the connection to Google
        //   readTimeout:    max time to wait for Google's response once connected
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));

        // baseUrl means request paths below are relative:
        // "/volumes" becomes "https://www.googleapis.com/books/v1/volumes"
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Searches Google Books and returns the raw (typed) response.
     *
     * @param query free-text search, e.g. "dune" or "frank herbert"
     * @return Google's response. Its items() may be null if nothing matched.
     * @throws GoogleBooksUnavailableException if the key is missing or the call fails
     */
    public GoogleBooksResponse searchVolumes(String query) {
        // (1) Check the configuration. GOOGLE_BOOKS_API_KEY defaults to "" when it isn't set (Step 4.2).
        if (properties.apiKey() == null || properties.apiKey().isBlank()) {
            throw new GoogleBooksUnavailableException(
                    "Google Books API key is not configured. Set GOOGLE_BOOKS_API_KEY.");
        }

        try {
            // (2) Build and send the request.
            // {q}, {max} and {key} are URI template variables, filled in order from the
            // arguments that follow. RestClient URL-encodes each value, so a query like
            // "harry potter & the stone" can't break the URL or inject extra parameters.
            // printType=books leaves out magazines.
            return restClient.get()
                    .uri("/volumes?q={q}&maxResults={max}&printType=books&key={key}",
                            query, properties.maxResults(), properties.apiKey())
                    // retrieve() sends the request. If Google responds with a 4xx or 5xx status,
                    // it throws a RestClientResponseException, caught below.
                    .retrieve()
                    // (3) Parse the response. Jackson converts the JSON body into our records.
                    .body(GoogleBooksResponse.class);

        } catch (RestClientResponseException ex) {
            // (4a) Google answered, but with an error status. Common causes:
            //   400 = bad/invalid key, 403 = Books API not enabled or key restricted, 429 = quota used up
            // Logging only the status code keeps the API key out of the logs.
            log.warn("Google Books returned HTTP {}", ex.getStatusCode().value());
            throw new GoogleBooksUnavailableException("Google Books request failed");

        } catch (RestClientException ex) {
            // (4b) We never got an answer (DNS failure, connection refused, timeout...).
            // Don't log ex.getMessage(): it can include the full request URL, which contains the key.
            log.warn("Could not reach Google Books ({})", ex.getClass().getSimpleName());
            throw new GoogleBooksUnavailableException("Google Books is unreachable");
        }
        // The order of the catch blocks matters: RestClientResponseException is a subclass
        // of RestClientException, so it must be caught first.
    }
}
```

### 4.5 Add the DTO, service and endpoint

#### The DTO returned to Angular

Our API returns a small, flat object instead of Google's nested JSON, so the frontend doesn't depend on Google's format.

`dto/BookSuggestion.java`:

```java
package com.example.bookmanagerapi.dto;

public record BookSuggestion(
        String googleId,
        String title,
        String author,
        Integer pages,        // null when Google has no page count
        String thumbnailUrl   // null when Google has no cover image
) {}
```

#### The service

`service/BookSearchService.java`:

**What this class does:** `BookSearchService` turns Google's data into the data our API returns. `BookController` calls it, it calls `GoogleBooksClient`, and it turns Google's nested, sometimes incomplete `GoogleBooksResponse` into a clean list of `BookSuggestion` objects that Angular can use directly. This is where our app's rules live:

- **What counts as a usable result.** Results with no title are dropped.
- **How data is presented.** Several authors are joined into one string, and a missing author becomes `"Unknown"`.
- **Small fixes.** `http` cover image links are upgraded to `https`.
- **Empty results.** No matches gives an empty list, never `null`.

It's separate from the client so that each class has one job. The client handles HTTP and the service handles business rules. If you later replaced Google Books with another source, such as Open Library, you'd write a new client and update this mapping. `BookController` and Angular would keep working unchanged, because they only ever see `BookSuggestion`.

```java
package com.example.bookmanagerapi.service;

import com.example.bookmanagerapi.client.GoogleBooksClient;
import com.example.bookmanagerapi.client.GoogleBooksResponse;
import com.example.bookmanagerapi.dto.BookSuggestion;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for searching books in an external catalog (Google Books).
 *
 * Flow:  BookController -> BookSearchService.search() -> GoogleBooksClient.searchVolumes()
 *                                   |
 *                                   +-> filters + maps GoogleBooksResponse -> List<BookSuggestion>
 *
 * Unlike BookService, this class doesn't touch the database. It only reads from
 * Google, so it needs no @Transactional.
 */
@Service
public class BookSearchService {

    private final GoogleBooksClient googleBooksClient;

    // Constructor injection: Spring supplies the GoogleBooksClient bean automatically.
    public BookSearchService(GoogleBooksClient googleBooksClient) {
        this.googleBooksClient = googleBooksClient;
    }

    /**
     * Searches Google Books and returns results shaped for our API.
     *
     * @param query the user's search text (already checked as non-blank by the controller)
     * @return a list of suggestions, empty if nothing matched (never null)
     * @throws com.example.bookmanagerapi.client.GoogleBooksUnavailableException
     *         passed up from the client if Google can't be reached (becomes a 503)
     */
    public List<BookSuggestion> search(String query) {
        // trim() so "  dune  " and "dune" give the same search
        GoogleBooksResponse response = googleBooksClient.searchVolumes(query.trim());

        // Google leaves out "items" entirely when there are no matches, so it's null rather than empty.
        // Returning an empty list means the controller sends [] and Angular never has to handle null.
        if (response == null || response.items() == null) {
            return List.of();
        }

        return response.items().stream()
                // Skip results that can't be turned into a book: no details, or no title.
                // (The book form requires a title, so a suggestion without one is useless.)
                .filter(item -> item.volumeInfo() != null && item.volumeInfo().title() != null)
                // Convert each remaining Google item into our own BookSuggestion
                .map(this::toSuggestion)
                // Collect into an unmodifiable List
                .toList();
    }

    /**
     * Maps one Google result to one BookSuggestion.
     * Handles every field Google might leave out, so the output is always safe to use.
     */
    private BookSuggestion toSuggestion(GoogleBooksResponse.Item item) {
        GoogleBooksResponse.VolumeInfo info = item.volumeInfo();

        // Our Book has a single "author" text field, but Google gives a list.
        // ["Neil Gaiman", "Terry Pratchett"] becomes "Neil Gaiman, Terry Pratchett"
        String author = (info.authors() == null || info.authors().isEmpty())
                ? "Unknown"
                : String.join(", ", info.authors());

        // The cover image is optional. Google often returns http:// links, which browsers
        // block or warn about on https pages, so switch them to https://.
        String thumbnail = info.imageLinks() == null ? null : info.imageLinks().thumbnail();
        if (thumbnail != null) {
            thumbnail = thumbnail.replaceFirst("^http://", "https://");
        }

        // pageCount is passed through as-is. It may be null, and Angular
        // handles that by keeping whatever is already in the form's Pages field.
        return new BookSuggestion(item.id(), info.title(), author, info.pageCount(), thumbnail);
    }
}
```

#### The endpoint

Update `controller/BookController.java`. Inject the new service alongside `BookService` and add a `search` method. The other endpoints stay the same.

```java
package com.example.bookmanagerapi.controller;

import com.example.bookmanagerapi.dto.BookSuggestion;
import com.example.bookmanagerapi.dto.CreateBookRequest;
import com.example.bookmanagerapi.model.Book;
import com.example.bookmanagerapi.service.BookSearchService;
import com.example.bookmanagerapi.service.BookService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final BookSearchService bookSearchService;

    public BookController(BookService bookService, BookSearchService bookSearchService) {
        this.bookService = bookService;
        this.bookSearchService = bookSearchService;
    }

    // ... getAll, create, finish and delete stay exactly as in Step 3.4 ...

    @GetMapping("/search")
    public List<BookSuggestion> search(@RequestParam @NotBlank @Size(max = 200) String q) {
        return bookSearchService.search(q);
    }
}
```

> The `@NotBlank` and `@Size` checks on `@RequestParam` run automatically in recent Spring versions. A blank or too-long `q` gets a `400` before Google is ever called.

#### Check it in the browser

Restart the API with `GOOGLE_BOOKS_API_KEY` set, then open <http://localhost:8080/api/books/search?q=dune>. You should see a JSON list of suggestions, each with a `title`, `author`, `pages` and `thumbnailUrl`.

To use the search from the UI, continue with [front-end.md, Step 3](front-end.md#step-3--add-google-books-search-to-the-form).

---

## Run the Back End

1. **Database:** `docker start book-manager-db` (if not already running)
2. **API key:** set `GOOGLE_BOOKS_API_KEY` in your terminal (see [Step 4.2](#42-store-the-key-outside-the-code))
3. **API:** in `book-manager-api`, run `./mvnw spring-boot:run`
4. Check that <http://localhost:8080/api/books> loads in the browser

Then start the UI and follow the demo script in [front-end.md, Run It End to End](front-end.md#run-it-end-to-end).

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
| Search returns **503** right away | `GOOGLE_BOOKS_API_KEY` isn't set in the terminal or run configuration that started the API. Restart the API after setting it. |
| Search returns **503** and the log says `Google Books returned HTTP 400` | The API key is wrong or was copied with extra spaces. |
| Log says `Google Books returned HTTP 403` | The Books API isn't enabled for the key's project, or the key's API restrictions don't include the Books API. |
| Log says `Google Books returned HTTP 429` | The daily quota for the Books API has been used up. Check quotas under **APIs & Services** in the Cloud Console. |
| `No qualifying bean of type GoogleBooksProperties` | `@ConfigurationPropertiesScan` is missing from `BookManagerApiApplication`. |

## Possible Next Steps

- Add an **edit** endpoint (`PUT /api/books/{id}`) with an `UpdateBookRequest` DTO
- Use **Flyway** for versioned migrations and switch `ddl-auto` to `validate`
- Add tests: `@WebMvcTest` for the controller, `@DataJpaTest` + Testcontainers for the repository, and a mock server (e.g. WireMock) for `GoogleBooksClient`
- Cache Google search results with Spring's `@Cacheable` to save quota
- Add an **import** endpoint (`POST /api/books/import/{googleId}`) that fetches a volume by ID and saves it in one step
