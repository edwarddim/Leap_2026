# Sprint 6: Node.js & NestJS: Authentication

> **Audience:** New graduate onboarding cohort
> **Duration:** 4 days
> **Goal:** By the end of the sprint, each participant can build a NestJS API that registers users, stores credentials safely, issues and checks tokens, protects routes by role, and can explain the security trade-offs behind each choice.

---

## How to use this README

Each day below is a **template** to fill in. The suggested topics, demos, and exercises are a starting outline. Change, cut, or add to them as you build the material.

- `TODO` marks places where you still need to add content, links, or timings.
- Put the code for each day in its matching folder (see [Folder structure](#suggested-folder-structure)).
- Each day follows the same pattern: **Objectives → Lesson → Live demo → Hands-on lab → Wrap-up check**.

---

## Prerequisites & setup

Participants should have these installed **before Day 1**:

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | LTS (TODO: pin version) | `node -v` |
| npm / pnpm | TODO | |
| NestJS CLI | latest | `npm i -g @nestjs/cli` |
| Git | any recent | |
| Database | TODO (e.g. PostgreSQL via Docker, or SQLite) | |
| API client | Postman / Insomnia / Bruno / REST Client | |
| Editor | VS Code (recommended extensions: TODO) | |

**Assumed knowledge:** JavaScript/TypeScript basics, HTTP fundamentals (methods, status codes, headers), JSON.

TODO: Add a setup check script or checklist participants run before Day 1.

---

## Sprint at a glance

| Day | Theme | Key outcome |
|-----|-------|-------------|
| 1 | Node.js foundations & NestJS architecture | Build a working CRUD API in NestJS |
| 2 | Authentication fundamentals | Register and log in users with safely hashed passwords |
| 3 | JWT, guards & authorization | Protect routes with tokens and role-based access |
| 4 | Production-grade auth & capstone | Add OAuth, hardening, and tests; ship a capstone |

---

## Day 1: Node.js Foundations & NestJS Architecture

### Learning objectives
- [ ] Explain the Node.js event loop and non-blocking I/O at a high level
- [ ] Use `async/await` and Promises with confidence
- [ ] Describe NestJS's building blocks: modules, controllers, providers
- [ ] Explain dependency injection and why NestJS uses it
- [ ] Validate incoming data with DTOs and pipes

### Lesson topics
| Time | Topic | Notes |
|------|-------|-------|
| TODO | Node.js runtime: event loop, modules (CommonJS vs ESM), npm | |
| TODO | A raw Node `http` server vs Express vs NestJS: why frameworks? | |
| TODO | NestJS project anatomy (`nest new`, `main.ts`, `AppModule`) | |
| TODO | Controllers, routing, and request lifecycle | |
| TODO | Providers/services & dependency injection | |
| TODO | DTOs, `class-validator`, `ValidationPipe` | |
| TODO | Configuration & environment variables (`@nestjs/config`) | Sets up for secrets on Day 2–3 |

### Live demo ideas
1. **Event loop visualizer**: `setTimeout` vs `setImmediate` vs `process.nextTick` vs Promises; predict the output order.
2. **Same endpoint, three ways**: plain `http`, Express, NestJS.
3. **Build a `users` resource**: `nest g resource users`, in-memory store, full CRUD.
4. **Validation in action**: send bad payloads and show the 400 responses.

TODO: Demo code location → `day1/demos/`

### Hands-on lab
Build a `tasks` (or similar) CRUD API with:
- A module, controller, and service
- DTOs with validation for create/update
- Proper HTTP status codes and error handling (`NotFoundException`, etc.)

TODO: Starter repo / instructions → `day1/lab/`
TODO: Stretch goal

### Wrap-up check
- What does dependency injection buy us?
- Where should business logic live: controller or service? Why?
- TODO: Add quiz / exit ticket questions

---

## Day 2: Authentication Fundamentals

### Learning objectives
- [ ] Tell **authentication** (who are you?) apart from **authorization** (what can you do?)
- [ ] Explain why passwords are hashed rather than encrypted, and what salting does
- [ ] Hash and verify passwords with `bcrypt` or `argon2`
- [ ] Compare session-based and token-based authentication
- [ ] Add a local username/password login with Passport

### Lesson topics
| Time | Topic | Notes |
|------|-------|-------|
| TODO | AuthN vs AuthZ; common auth schemes overview | |
| TODO | Password storage: plaintext → hashing → salting → slow hashes (bcrypt/argon2) | Real-world breach examples |
| TODO | Connecting a database (TODO: TypeORM / Prisma) & a `User` entity | |
| TODO | Registration flow: validation, duplicate checks, hashing | |
| TODO | Login flow: lookup, compare, generic error messages | Avoid user enumeration |
| TODO | Sessions + cookies vs tokens: trade-offs | |
| TODO | Intro to Passport & `@nestjs/passport`; the `LocalStrategy` | |

### Live demo ideas
1. **Why plaintext is dangerous**: dump a "leaked" table; then show the hashed version.
2. **Hash timing**: compare MD5/SHA-256 vs bcrypt cost factors; explain why slow is good here.
3. **Build `AuthModule`**: `POST /auth/register` and `POST /auth/login` with `LocalStrategy` + `AuthGuard('local')`.
4. **Never return the password hash**: use `ClassSerializerInterceptor` / `@Exclude()`.

TODO: Demo code location → `day2/demos/`

### Hands-on lab
Extend the Day 1 API:
- Add a `User` entity stored in a database
- Add register and login endpoints with hashed passwords
- Return clear but non-leaky error messages

TODO: Starter repo / instructions → `day2/lab/`
TODO: Stretch goal (e.g. password strength rules, a session-based version with `express-session`)

### Wrap-up check
- Why shouldn't a login error say "email not found"?
- What is a salt, and why is it not secret?
- TODO: Add quiz / exit ticket questions

---

## Day 3: JWT, Guards & Authorization

### Learning objectives
- [ ] Describe the structure of a JWT (header, payload, signature) and what is and isn't secret
- [ ] Issue and verify JWTs with `@nestjs/jwt` and a `JwtStrategy`
- [ ] Protect routes with guards, including a global guard plus a `@Public()` opt-out
- [ ] Add access + refresh token rotation
- [ ] Add role-based access control (RBAC) with custom decorators

### Lesson topics
| Time | Topic | Notes |
|------|-------|-------|
| TODO | JWT anatomy; decode one at jwt.io; signing algorithms (HS256 vs RS256) | |
| TODO | Issuing tokens on login; `JwtStrategy` & `AuthGuard('jwt')` | |
| TODO | NestJS request lifecycle: middleware → guards → interceptors → pipes → handler | |
| TODO | Custom decorators: `@CurrentUser()`, `@Public()`, `@Roles()` | |
| TODO | Global guards with `APP_GUARD` and `Reflector` | |
| TODO | Access vs refresh tokens; expiry, rotation, revocation | |
| TODO | Where to store tokens on the client: httpOnly cookies vs localStorage | XSS / CSRF trade-offs |
| TODO | RBAC with a `RolesGuard`; intro to policy-based access (CASL) | |

### Live demo ideas
1. **Tamper with a JWT**: change the payload, show that the signature check fails.
2. **`GET /profile`**: protected by the JWT guard, using a `@CurrentUser()` decorator.
3. **Global guard + `@Public()`**: secure by default, open by exception.
4. **Admin-only route** with `@Roles('admin')` + `RolesGuard`.
5. **Refresh flow**: short-lived access token expires → call `POST /auth/refresh` → new pair.

TODO: Demo code location → `day3/demos/`

### Hands-on lab
Extend the Day 2 API:
- Issue a JWT on login; protect all task routes
- Users can only read and edit **their own** tasks
- Add an `admin` role that can see all tasks
- Stretch: refresh tokens stored hashed in the DB, with logout and revocation

TODO: Starter repo / instructions → `day3/lab/`

### Wrap-up check
- Is a JWT payload encrypted? What should never go in it?
- How do you "log out" a stateless JWT?
- What is the difference between a guard and middleware in NestJS?
- TODO: Add quiz / exit ticket questions

---

## Day 4: Production-Grade Auth & Capstone

### Learning objectives
- [ ] Explain OAuth 2.0 / OpenID Connect flows at a high level (Authorization Code + PKCE)
- [ ] Add "Sign in with Google/GitHub" via Passport
- [ ] Harden an API: Helmet, CORS, rate limiting, secure cookies, secrets management
- [ ] Map common attacks to defenses (OWASP Top 10 / API Security Top 10)
- [ ] Write unit and e2e tests for authenticated endpoints

### Lesson topics
| Time | Topic | Notes |
|------|-------|-------|
| TODO | OAuth 2.0 vs OIDC; roles (client, resource owner, auth server); scopes | |
| TODO | Social login with `passport-google-oauth20` / `passport-github2` | Needs OAuth app credentials, see TODO |
| TODO | Linking OAuth identities to local users | |
| TODO | Security hardening: `helmet`, CORS config, `@nestjs/throttler`, CSRF | |
| TODO | Secrets & config: `.env`, never commit secrets, key rotation | |
| TODO | Common vulnerabilities: brute force, credential stuffing, broken object-level authorization, token leakage | |
| TODO | Testing auth: mocking guards in unit tests; `supertest` e2e with real tokens | |
| TODO | Optional: MFA/TOTP, email verification & password reset flows, managed identity providers (Auth0, Cognito, Keycloak) | |

### Live demo ideas
1. **OAuth dance, step by step**: trace the redirects in browser dev tools.
2. **Brute-force a login**: then add `@nestjs/throttler` and show the 429s.
3. **IDOR attack**: access another user's task by ID, then fix it.
4. **E2E test suite**: register → login → call a protected route → expect 401/403/200.

TODO: Demo code location → `day4/demos/`

### Capstone
Teams/individuals build a small secured API from a short brief, for example:
- TODO: Capstone brief (e.g. "Library lending API", "Team expense tracker")
- **Required:** registration/login, hashed passwords, JWT-protected routes, at least two roles, ownership checks, validation, rate limiting, e2e tests for auth paths
- **Stretch:** OAuth login, refresh token rotation, password reset, Swagger docs with bearer auth (`@nestjs/swagger`)

TODO: Rubric / grading criteria
TODO: Demo / presentation format and timing

### Wrap-up check
- Walk through what happens, end to end, when a user clicks "Sign in with Google."
- Name three ways an attacker could compromise accounts on your API, and your defense for each.
- TODO: Sprint retrospective questions

---

## Suggested folder structure

```
sprint6_prep/
├── README.md               ← this file
├── setup/                  ← prerequisite checks, env templates, docker-compose
├── day1-nest-foundations/
│   ├── slides/
│   ├── demos/
│   └── lab/                ← starter + solution branches/folders
├── day2-auth-fundamentals/
│   ├── slides/
│   ├── demos/
│   └── lab/
├── day3-jwt-guards-rbac/
│   ├── slides/
│   ├── demos/
│   └── lab/
├── day4-production-auth/
│   ├── slides/
│   ├── demos/
│   └── capstone/
└── resources/              ← cheat sheets, reading list, glossary
```

---

## Key packages reference

| Package | Purpose | Day |
|---------|---------|-----|
| `@nestjs/cli`, `@nestjs/core` | Framework | 1 |
| `class-validator`, `class-transformer` | DTO validation & serialization | 1 |
| `@nestjs/config` | Environment config | 1 |
| TODO: `@nestjs/typeorm` / `prisma` | Database access | 2 |
| `bcrypt` or `argon2` | Password hashing | 2 |
| `@nestjs/passport`, `passport`, `passport-local` | Auth strategies | 2 |
| `@nestjs/jwt`, `passport-jwt` | JWT issuing & checking | 3 |
| `passport-google-oauth20` / `passport-github2` | OAuth social login | 4 |
| `helmet`, `@nestjs/throttler` | Hardening | 4 |
| `supertest`, `jest` | Testing | 4 |
| `@nestjs/swagger` | API docs | 4 (stretch) |

---

## Resources

- [NestJS docs: Authentication](https://docs.nestjs.com/security/authentication)
- [NestJS docs: Authorization](https://docs.nestjs.com/security/authorization)
- [NestJS docs: Passport recipe](https://docs.nestjs.com/recipes/passport)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [jwt.io](https://jwt.io/): decode and inspect JWTs
- [OAuth 2.0 Simplified](https://www.oauth.com/)
- TODO: Internal company standards / auth guidelines

---

## Facilitator notes

- TODO: Daily schedule (start/end times, breaks, standups)
- TODO: Pairing / group assignments
- TODO: Pre-created OAuth app credentials for Day 4 (don't make grads set these up live)
- TODO: Known setup pitfalls (e.g. `bcrypt` native build on Windows: consider `bcryptjs` or `argon2` as a fallback)
- TODO: Feedback form link
