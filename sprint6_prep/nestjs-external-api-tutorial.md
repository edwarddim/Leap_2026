# Building a NestJS App That Calls an External API

This guide starts from an empty folder and ends with a NestJS app that calls a real third-party API with **`@nestjs/http-client`**. It reads the base URL and API key from a `.env` file and handles errors cleanly.

We'll use the **OpenWeatherMap** API as the example because it needs both a base URL and an API key. The same pattern works for any REST API.

> **About `@nestjs/http-client`:** This is the NestJS team's newer HTTP client. It is built on Node's native `fetch` and has no third-party dependencies (no Axios, no RxJS). Every method returns a plain **Promise**, so you call it with `async/await`. Retries, timeouts, and typed error classes are built in. It's at an early version (0.0.x), so check the [official docs](https://docs.nestjs.com/application/http-client) if anything here doesn't match the version you install.

---

## What You'll Build

```
GET http://localhost:3000/weather?city=London
```

↓ NestJS controller → service → `HttpClient` ↓

```
GET https://api.openweathermap.org/data/2.5/weather?q=London&appid=<YOUR_KEY>&units=metric
```

↓ The response is trimmed to a small, clean JSON object ↓

```json
{
  "city": "London",
  "country": "GB",
  "temperature": 12.4,
  "feelsLike": 11.1,
  "description": "light rain"
}
```

## Prerequisites

| Tool | Version | Check with |
| --- | --- | --- |
| Node.js | **20.19 or newer** (22 LTS or later recommended) | `node -v` |
| npm | comes with Node | `npm -v` |
| An API key | free from [openweathermap.org](https://openweathermap.org/api) | — |

> **Why 20.19?** `@nestjs/http-client` requires Node 20.19 or newer. This guide was tested with Nest CLI 12 on Node 24.

> A new OpenWeatherMap key can take a little while to activate after sign-up. Until it does, the API returns `401`. That's a good chance to test the error handling.

---

## Step 1: Create a NestJS Project with the Nest CLI

Install the Nest CLI globally:

```bash
npm install -g @nestjs/cli
```

Create a new project:

```bash
nest new weather-api
```

When it asks which package manager to use, pick **npm**.

Go into the project and start it to check that everything works:

```bash
cd weather-api
npm run start:dev
```

Open http://localhost:3000 and you should see **Hello World!**. Press `Ctrl + C` to stop the server.

### What the CLI generated

```
weather-api/
├── src/
│   ├── app.controller.ts      # Example controller (handles GET /)
│   ├── app.controller.spec.ts # Unit test for the controller (runs with Vitest)
│   ├── app.module.ts          # Root module: everything gets wired in here
│   ├── app.service.ts         # Example service
│   └── main.ts                # Entry point: bootstraps the app on port 3000
├── test/                      # End-to-end tests
├── package.json
└── tsconfig.json
```

> **Imports end in `.js`.** New Nest projects are ES module projects (`"type": "module"` in `package.json`). That means every *relative* import names the compiled file, with a `.js` extension, even though the source file is `.ts`:
> ```ts
> import { AppService } from './app.service.js'; // ✅
> import { AppService } from './app.service';    // ❌ fails to compile
> ```
> Package imports such as `'@nestjs/common'` don't need an extension. The Nest CLI adds the `.js` for you when it generates files, so you only need to remember it when you type imports yourself.

**Key idea:** A NestJS app is a tree of **modules**. `AppModule` is the root. Each feature gets its own module that groups that feature's **controllers** (handle HTTP requests) and **providers/services** (hold the business logic).

---

## Step 2: Install `@nestjs/http-client`

```bash
npm install @nestjs/http-client
```

That's the only package the HTTP calls need. It uses Node's built-in `fetch`, so you don't install Axios or anything else.

Install the config package now as well. We'll need it in Step 5 to read the `.env` file:

```bash
npm install @nestjs/config
```

> **Why `HttpClient` instead of calling `fetch` directly?** It's injectable. You configure it once in a module (base URL, timeout, headers), Nest creates it, and any service can ask for it in its constructor. It also adds retries, timeouts, and typed errors, and it's easy to mock in tests.

---

## Step 3: Create a New Module

Use the CLI to generate a `weather` feature module:

```bash
nest generate module weather
```

Short form: `nest g mo weather`

This creates `src/weather/weather.module.ts` and **automatically adds it** to the `imports` array in `app.module.ts`:

```ts
// src/weather/weather.module.ts
import { Module } from '@nestjs/common';

@Module({})
export class WeatherModule {}
```

```ts
// src/app.module.ts (updated by the CLI)
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WeatherModule } from './weather/weather.module.js';

@Module({
  imports: [WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## Step 4: Set Up the Controller and Service in the Module

Generate both into the `weather` folder:

```bash
nest generate controller weather --no-spec
```

```bash
nest generate service weather --no-spec
```

Short forms: `nest g co weather --no-spec` and `nest g s weather --no-spec`. `--no-spec` skips the test files to keep things simple for now.

The CLI registers both in `WeatherModule` for you:

```ts
// src/weather/weather.module.ts
import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller.js';
import { WeatherService } from './weather.service.js';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
```

### How the pieces relate

```
AppModule
└── imports: WeatherModule
        ├── controllers: WeatherController   ← receives GET /weather
        │        │ (injects)
        │        ▼
        └── providers:   WeatherService      ← calls the external API
                 │ (injects)
                 ▼
             HttpClient (from HttpClientModule, added in Step 5)
```

We'll fill in the controller and service in Step 6, after the configuration is ready.

---

## Step 5: Create a `.env` File for the Base URL and API Key

### 5a. Create the `.env` file

In the **project root** (next to `package.json`), create `.env`:

```env
# .env
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
WEATHER_API_KEY=your_api_key_here
```

### 5b. Keep secrets out of Git

Open `.gitignore` (create it in the project root if it isn't there) and make sure it contains:

```gitignore
.env
```

Then create a **`.env.example`** that *is* committed, so teammates know which variables they need:

```env
# .env.example
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
WEATHER_API_KEY=
```

### 5c. Load the `.env` file with `ConfigModule`

Register `ConfigModule` once in the root module. `isGlobal: true` means every other module can inject `ConfigService` without importing `ConfigModule` again.

```ts
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WeatherModule } from './weather/weather.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // loads .env into process.env
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 5d. Configure `HttpClientModule` with the base URL

Register `HttpClientModule` inside `WeatherModule`. We use `registerAsync` so we can inject `ConfigService` and read the `.env` values when the app starts:

```ts
// src/weather/weather.module.ts
import { Module } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { ConfigService } from '@nestjs/config';
import { WeatherController } from './weather.controller.js';
import { WeatherService } from './weather.service.js';

@Module({
  imports: [
    HttpClientModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseUrl: config.getOrThrow<string>('WEATHER_API_BASE_URL'),
        timeout: '5s', // give up on an attempt after 5 seconds
        retry: 2,      // up to 2 attempts in total for temporary failures
      }),
    }),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
```

**Why this setup works well:**

- `baseUrl` means the service only writes the path (`/weather`), not the full URL.
- `getOrThrow` makes the app **fail at startup** if a variable is missing. That's much easier to debug than an undefined value at request time.
- `timeout` accepts milliseconds (`5000`) or a readable string (`'5s'`, `'250ms'`).
- **Retries are on by default.** The client retries GET requests up to 3 times after network errors, timeouts, and `408`, `429`, `500`, `502`, `503`, or `504` responses. We lower it to 2 attempts here. Use `retry: false` to turn retries off.

> **Where does the API key go?** `baseUrl` can't contain a query string, and OpenWeatherMap expects the key as a query parameter (`?appid=...`). So the service reads the key from `ConfigService` and adds it to each request (see Step 6).
>
> Many APIs expect the key in a **header** instead. For those, set it once here and every request sends it:
> ```ts
> headers: { Authorization: `Bearer ${config.getOrThrow<string>('WEATHER_API_KEY')}` },
> ```

---

## Step 6: Make a Simple API Call with Error Handling

### 6a. Define the response shapes

Create `src/weather/weather.types.ts`. One type describes the parts of the external response we use, and the other describes what *our* API returns:

```ts
// src/weather/weather.types.ts

/** The parts of the OpenWeatherMap response we care about */
export interface OpenWeatherResponse {
  name: string;
  sys: { country: string };
  main: { temp: number; feels_like: number };
  weather: { description: string }[];
}

/** The clean shape our API returns to clients */
export interface WeatherSummary {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
}
```

> The `<OpenWeatherResponse>` type you pass to `get` only helps TypeScript. Nothing checks it at runtime, so the external API could still send something different.

### 6b. Write the service

Every `HttpClient` method returns a **Promise** that resolves to a response object. The parsed JSON is in `response.data`. Any non-2xx status **throws** an error, so `try/catch` is all you need.

```ts
// src/weather/weather.service.ts
import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HttpClient,
  HttpNetworkError,
  HttpResponseError,
  HttpTimeoutError,
  toHttpException,
} from '@nestjs/http-client';
import { OpenWeatherResponse, WeatherSummary } from './weather.types.js';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;

  constructor(
    private readonly http: HttpClient, // the client configured in WeatherModule
    config: ConfigService,
  ) {
    this.apiKey = config.getOrThrow<string>('WEATHER_API_KEY');
  }

  async getWeatherByCity(city: string): Promise<WeatherSummary> {
    try {
      // baseUrl, timeout and retry are already set in WeatherModule
      const response = await this.http.get<OpenWeatherResponse>('/weather', {
        query: { q: city, appid: this.apiKey, units: 'metric' },
      });

      const data = response.data;
      return {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        description: data.weather[0]?.description ?? 'unknown',
      };
    } catch (error) {
      this.handleError(error, city);
    }
  }

  /**
   * Turns HTTP client errors into NestJS HTTP exceptions.
   * Nest's built-in exception filter then sends a clean JSON error to the client.
   */
  private handleError(error: unknown, city: string): never {
    // 1) The external API replied with a non-2xx status
    if (error instanceof HttpResponseError) {
      this.logger.warn(`Weather API returned ${error.status} for city "${city}"`);

      if (error.status === 404) {
        throw new NotFoundException(`City "${city}" was not found`);
      }
      if (error.status === 401) {
        // Our API key is wrong. That's a server problem, not the client's,
        // so don't pass a 401 back to the user.
        this.logger.error('Weather API key is invalid or not yet active');
        throw new BadGatewayException('Weather provider rejected our credentials');
      }
      if (error.status === 429) {
        throw new ServiceUnavailableException('Weather provider rate limit reached, try again later');
      }
    }

    // 2) Log timeouts and network failures with a clear message
    if (error instanceof HttpTimeoutError) {
      this.logger.error(`Weather API timed out after ${error.timeoutMs}ms for city "${city}"`);
    } else if (error instanceof HttpNetworkError) {
      this.logger.error(`Could not reach Weather API: ${error.message}`);
    }

    // 3) Everything else: let the library pick the right exception.
    //    Upstream error or network failure → 502, timeout → 504.
    //    Errors that didn't come from the HTTP client are rethrown unchanged
    //    (for example a bug in our mapping code, which becomes a 500).
    throw toHttpException(error);
  }
}
```

### The error classes

`@nestjs/http-client` throws a specific error class for each kind of failure. All of them extend `HttpClientError`.

| Error class | When it's thrown | Useful properties |
| --- | --- | --- |
| `HttpResponseError` | The API answered with a non-2xx status | `status`, `statusText`, `body` (the parsed error body), `headers` |
| `HttpTimeoutError` | An attempt took longer than `timeout` | `timeoutMs` |
| `HttpNetworkError` | No response at all: DNS failure, connection refused, TLS error | `cause` (e.g. `cause.code === 'ECONNREFUSED'`) |
| `HttpParseError` | The response said it was JSON but wasn't valid JSON | `status`, `body` (raw text) |

> **Retries happen first.** Because retries are on, a `429`, a `5xx`, or a timeout is retried before your `catch` block runs. The error you catch comes from the **last** attempt.

### The error handling strategy

| What happened | How we detect it | What our API returns | Why |
| --- | --- | --- | --- |
| City doesn't exist | `HttpResponseError`, `status === 404` | **404 Not Found** | It's the client's mistake, so tell them. |
| Bad or inactive API key | `HttpResponseError`, `status === 401` | **502 Bad Gateway** | It's *our* misconfiguration. Don't leak it as the client's auth error. |
| Rate limited | `HttpResponseError`, `status === 429` | **503 Service Unavailable** | Temporary, so the client can retry. |
| Any other upstream error | `HttpResponseError`, any other status | **502 Bad Gateway** (via `toHttpException`) | The upstream service failed. |
| Timeout | `HttpTimeoutError` | **504 Gateway Timeout** (via `toHttpException`) | The upstream service was too slow. |
| No response at all | `HttpNetworkError` | **502 Bad Gateway** (via `toHttpException`) | The upstream service can't be reached. |
| Anything else | not an HTTP client error | **500 Internal Server Error** | A bug in our code. Nest handles this by default. |

**Core principle:** Never send the upstream error straight to the client. It can describe internal details of the other service. Map it to a meaningful NestJS exception and **log** the details on the server.

The library helps here. `toHttpException` never forwards the upstream body by default, and it logs every 5xx it creates. Error messages also mask query values (`?appid=***`), so the API key doesn't end up in your logs.

### 6c. Write the controller

```ts
// src/weather/weather.controller.ts
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service.js';
import type { WeatherSummary } from './weather.types.js';

@Controller('weather') // all routes in this class start with /weather
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // GET /weather?city=London
  @Get()
  getWeather(@Query('city') city?: string): Promise<WeatherSummary> {
    if (!city || !city.trim()) {
      throw new BadRequestException('Query parameter "city" is required');
    }
    return this.weatherService.getWeatherByCity(city.trim());
  }
}
```

The controller stays **thin**. It reads and validates the input, then hands the work to the service. All HTTP and external API logic lives in the service.

### 6d. Run and test it

```bash
npm run start:dev
```

Try each scenario in the browser, Postman, or curl:

**Success:**

```bash
curl "http://localhost:3000/weather?city=London"
```

```json
{ "city": "London", "country": "GB", "temperature": 12.4, "feelsLike": 11.1, "description": "light rain" }
```

**Missing parameter (400):**

```bash
curl "http://localhost:3000/weather"
```

```json
{ "message": "Query parameter \"city\" is required", "error": "Bad Request", "statusCode": 400 }
```

**Unknown city (404):**

```bash
curl "http://localhost:3000/weather?city=NotARealPlace123"
```

```json
{ "message": "City \"NotARealPlace123\" was not found", "error": "Not Found", "statusCode": 404 }
```

**Bad API key (502).** Change `WEATHER_API_KEY` in `.env` to something wrong and restart:

```json
{ "message": "Weather provider rejected our credentials", "error": "Bad Gateway", "statusCode": 502 }
```

**Timeout (504).** Set `timeout: '1ms'` in `WeatherModule`, restart, and call the endpoint. You get a `504 Gateway Timeout`. Set it back to `'5s'` afterward.

The server terminal also shows the logged warning or error for each failure.

---

## Final Project Structure

```
weather-api/
├── .env                     # real secrets (git-ignored)
├── .env.example             # template (committed)
└── src/
    ├── app.module.ts        # ConfigModule.forRoot + imports WeatherModule
    ├── main.ts
    └── weather/
        ├── weather.module.ts      # HttpClientModule.registerAsync (baseUrl, timeout, retry)
        ├── weather.controller.ts  # GET /weather?city=...
        ├── weather.service.ts     # calls the API + maps errors
        └── weather.types.ts       # response interfaces
```

## Recap

1. **`nest new`** scaffolds a working app with a root `AppModule`.
2. **`@nestjs/http-client`** gives you an injectable, Promise-based `HttpClient` built on native `fetch`.
3. **`nest g mo|co|s`** generates a feature module, controller, and service and wires them together.
4. **Modules** group related controllers and providers. Controllers handle routes and services hold the logic.
5. **`@nestjs/config`** loads `.env`. `HttpClientModule.registerAsync` sets the base URL, timeout, and retries in one place.
6. **`try/catch` with typed errors** (`HttpResponseError`, `HttpTimeoutError`, `HttpNetworkError`) maps each failure to the right NestJS exception, and `toHttpException` covers everything else.

## Common Problems

| Symptom | Likely cause |
| --- | --- |
| App crashes at startup: *"WEATHER_API_KEY" does not exist* | `.env` is missing, in the wrong folder (it must be in the project root), or the variable name is misspelled. |
| `Nest can't resolve dependencies of WeatherService (?)` | `HttpClientModule` isn't in `WeatherModule`'s `imports`. |
| `TS2307: Cannot find module './weather.service'` | A relative import is missing `.js`. Write `'./weather.service.js'`, not `'./weather.service'`. |
| Errors installing or loading `@nestjs/http-client` | Node is too old. Upgrade to Node 20.19+ (22 LTS or later recommended). |
| `TypeError` mentioning `baseUrl` at startup | The base URL in `.env` isn't a full `http(s)://` URL, or it contains a `?query`. |
| Always getting 502 "rejected our credentials" | API key is wrong or not activated yet. New OpenWeatherMap keys can take a while to activate. |
| Changes to `.env` have no effect | `.env` is only read at startup, so restart the server. |

## Next Steps (Optional Exercises)

- **Validate the env vars at startup** with a `validationSchema` in `ConfigModule.forRoot` (for example with `joi`).
- **Validate query params** with a DTO and `class-validator` plus a global `ValidationPipe`, instead of the manual check in the controller.
- **Unit test the service** by giving it a mock `HttpClient` whose `get` is a Vitest mock: `vi.fn().mockResolvedValue(...)` for success and `mockRejectedValue(new HttpResponseError({ ... }))` for failures.
- **Add the API key with an interceptor.** Return `interceptors: [(req, next) => { req.url.searchParams.set('appid', key); return next(req); }]` from the module factory so the service no longer needs the key.
- **Tune retries** with `retry: { attempts: 3, backoff: { delay: '500ms' } }`.
