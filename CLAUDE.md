# CLAUDE.md

Teaching workspace for the **Leap 2026** new-graduate onboarding program. It holds lesson prep, live-demo code and lab material, organised by sprint. It is **not a single application** and **not a git repository**. Each subproject is independent and has its own build tool, so run commands from inside that subproject's folder.

## Layout

| Folder | What it is |
|---|---|
| `project/sprint6.md` | Presentation requirements for the sprint 5 and sprint 6 project demos (auth flow, BR-02 "a client can only reach their own data", permission matrix, Postman demo). |
| `sprint5_prep/` | Sprint 5 lesson prep: functional JS (map/filter), promises, decorators, Angular architecture notes, flexbox / mobile-first CSS demos, `ts-test/` (minimal TS starter, `readme.md` explains the setup). |
| `sprint5_demo/` | Code written live in sprint 5 sessions: async JS, functional JS, HTML/CSS labs, `ts-project/` (TS starter). |
| `sprint6_prep/` | Sprint 6 (Node.js & NestJS authentication). `README.md` is the 4-day sprint plan template (it still has many `TODO`s). `day_1.md` holds the session agenda. |
| `sprint6_prep/node_fundamentals/` | `async-showdown.md`: a team game in 3 rounds plus a tie-breaker. Solutions start at "## Round 1 solution". `quickbite.js` is the **unsolved starter** for that game. `1_js_labs.js` is a short array-quirks quiz. |
| `sprint6_prep/nest-fauxnance/` | NestJS 12 app that proxies to the Fauxnance API via `@nestjs/http-client`. |
| `sprint6_prep/nestjs-jwt-api/` | NestJS 10 JWT auth starter (register / login / protected profile). |
| `sprint6_prep/nestjs-external-api-tutorial.md` | Step-by-step tutorial for calling an external API (OpenWeatherMap) from NestJS. |
| `sprint6_demo/quickbite.js` | A **partly solved** copy of the QuickBite starter, done live (it has a promisified `getUserAsync` and an async/await `trackOrder`). Leave `sprint6_prep/node_fundamentals/quickbite.js` unsolved because it is the handout. |
| `spring_demos/` | Spring Boot 4.1 demos (see below). |

In `quickbite.js`, the section headed "FAKE QUICKBITE SERVER (DO NOT EDIT THIS SECTION)" is part of the exercise. Don't change it.

## Node / TypeScript projects

### `sprint6_prep/nest-fauxnance` (NestJS 12, ESM)
- `npm run start:dev`, `npm run build`, `npm test` (Vitest, `*.spec.ts`), `npm run test:e2e`, `npm run lint` (oxlint), `npm run format`.
- **ESM only:** relative imports end in `.js`, there is no `__dirname` (use `import.meta.dirname`), and mocks use `vi.fn()`, not `jest.fn()`. `AGENTS.md` notes that this Nest version is newer than most training data. Check https://docs.nestjs.com/llms.txt before relying on remembered APIs.
- `main.ts` loads `.env` with `process.loadEnvFile()`. Env vars: `PORT` (3000), `FAUXNANCE_BASE_URL` (default `http://localhost:8080`), `FAUXNANCE_TIMEOUT_MS`.
- `FauxnanceController` forwards any `/fauxnance/<path>` request to `{FAUXNANCE_BASE_URL}/<path>`, passing through the method, query, body and `Authorization` header. `FauxnanceClientService` maps upstream errors to Nest exceptions (502 if unreachable, 504 on timeout). Retries apply to GET/PUT/DELETE only.

### `sprint6_prep/nestjs-jwt-api` (NestJS 10, CommonJS)
- `node_modules` is **not installed**. Run `npm install` first. There are no test or lint scripts.
- Users are stored **in memory** (`UsersService`) and hashed with bcrypt (cost 10). `admin` / `admin123` is seeded on startup.
- Routes: `POST /auth/register`, `POST /auth/login` (returns JWT), `GET /auth/profile` (behind the custom `AuthGuard`, which needs `Authorization: Bearer <token>`).
- Env: `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`. If `JWT_SECRET` is unset, the guard falls back to `'super-secret-dev-key'`.
- A global `ValidationPipe` runs with `whitelist` and `forbidNonWhitelisted`, so unknown body fields return 400.

The two Nest apps use different major versions and module systems. Don't copy import styles or config from one to the other.

### `sprint5_demo/ts-project`, `sprint5_prep/ts-test`
Minimal TS starters (CommonJS, TypeScript 7, tsx). `npm run dev` (tsx watch), `npm run build` (tsc → `dist/`), `npm start`.

### Plain JS and HTML
Run plain `.js` files with `node <file>`. Open HTML demos directly in a browser. `sprint5_prep/.claude/launch.json` serves `flexbox-mobile-first-demo` with `python -m http.server 5510`.

## Spring Boot demos (`spring_demos/`)

All of them are Maven projects on Spring Boot 4.1.x. Run them with `./mvnw spring-boot:run` (or `mvnw.cmd` on Windows) and test with `./mvnw test`. `persistence_demo` has **no Maven wrapper**, so use `mvn` there.

| Project | Java | Port | Notes |
|---|---|---|---|
| `demo` | 21 | 8081 | Hello-world `GET /`. |
| `firstspringdemo` | 21 | 8080 | Layered layout (controllers/services/repository/entity/dto), `/books` and `/user` routes, JPA. Needs local Postgres `mydb` (`postgres`/`root`). |
| `persistence_demo` | 25 | 8080 | MyBatis + Postgres CRUD on `/api/books` (SQL in `resources/mapper/BookMapper.xml`, table created from `schema.sql` on startup). Also has `JwtService` (jjwt, HS256), which is unit-tested but **not yet wired into any controller or filter**. Postman collection in `postman/`. |
| `SpringSecurityDemo` | 25 | 8080 | `SecurityConfig` permits `/greets`, `/login` and `/logout`. Every other route (`/user`, `/admin`) requires auth with the in-memory user `user` / `user123`. No role checks yet. |
| `test` | 21 | 8080 | WAR packaging with `ServletInitializer` (deploys to external Tomcat). |

`persistence_demo` gotchas:
- `application.properties` reads `DB_URL`, `DB_USER` and `DB_PASSWORD` (defaults: `postgres` / `rootroot`). Its README wrongly calls the second variable `DB_USERNAME`.
- `compose.yaml` starts Postgres with `demo` / `demo`. Those credentials don't match the defaults, so if you use compose, set `DB_USER=demo DB_PASSWORD=demo`.
- Set `JWT_SECRET` (base64, at least 32 bytes) outside local dev.

## Gotchas
- **Port 8080 conflict:** Fauxnance defaults to `localhost:8080`, and so do most of the Spring demos. Run only one at a time, or change a port.
- `target/`, `dist/` and `node_modules/` are build output. Don't edit or document them.
- `.env` files exist next to `.env.example` in both Nest projects. They hold local secrets, so don't print their values or copy them anywhere.
- Because this is teaching material, readability beats cleverness. Some files intentionally show bad patterns (callback hell, sequential awaits, missing error handling) for students to fix. Don't "fix" starter or handout files unless asked.
