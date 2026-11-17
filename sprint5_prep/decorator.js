/**
 * ============================================================================
 *  DECORATORS IN JAVASCRIPT — DEMO FILE
 * ============================================================================
 *
 *  A decorator is a function that takes something (a function, method, or
 *  class) and returns an enhanced version of it, WITHOUT changing the
 *  original's source code.
 *
 *      enhanced = decorator(original)
 *
 *  Use cases: logging, timing, caching, retrying, validation, auth checks,
 *  debouncing/throttling UI events, rate limiting, deprecation warnings...
 *
 *  There are two "flavors" in JavaScript:
 *
 *   1. FUNCTION DECORATORS (higher-order functions)  -> works everywhere today
 *        const fastFn = memoize(slowFn);
 *
 *   2. CLASS / METHOD DECORATORS using `@` syntax     -> TC39 Stage 3 proposal
 *        class Api { @log getUser() {} }
 *      Supported by TypeScript 5+, Babel, and frameworks like Angular / NestJS.
 *      Plain Node.js does NOT run `@` syntax yet, so in Part 6 we write the
 *      decorators with the official signature and apply them by hand.
 *
 *  Run with:  node decorator.js
 * ============================================================================
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const section = (title) => console.log(`\n${'='.repeat(70)}\n ${title}\n${'='.repeat(70)}`);

// ============================================================================
// PART 1: THE BASIC IDEA — a function that wraps a function
// ============================================================================

/**
 * The simplest decorator: log calls and return values.
 * Pattern:
 *   1. accept the original function
 *   2. return a NEW function with the same arguments (...args)
 *   3. do extra work before/after calling the original
 *   4. return the original's result
 */
function logger(fn) {
  const wrapped = function (...args) {
    console.log(`  → calling ${fn.name}(${args.map((a) => JSON.stringify(a)).join(', ')})`);
    console.log(`  → args ${args}`);
    const result = fn.apply(this, args); // .apply(this) keeps `this` working for methods
    console.log(`  ← ${fn.name} returned ${JSON.stringify(result)}`);
    return result;
  };
  // Tip: keep the original name so stack traces and other decorators see "add",
  // not an anonymous function.
  Object.defineProperty(wrapped, 'name', { value: fn.name });
  return wrapped;
}

function add(a, b) {
  return a + b;
}

const loggedAdd = logger(add);

/**
 * Timing decorator — works for both sync and async functions.
 */
function timed(fn) {
  return async function (...args) {
    const start = performance.now();
    try {
      return await fn.apply(this, args);
    } finally {
      const ms = (performance.now() - start).toFixed(1);
      console.log(`  ⏱  ${fn.name} took ${ms}ms`);
    }
  };
}

// ============================================================================
// PART 2: DECORATOR FACTORIES — decorators that take options
// ============================================================================
//
//  When a decorator needs configuration, add one more function layer:
//
//      const decorator = (options) => (fn) => (...args) => { ... }
//                          ^factory     ^decorator  ^wrapped function
// ============================================================================

/**
 * Prefix every log line with a tag — a factory example.
 */
const tagged = (tag) => (fn) =>
  function (...args) {
    console.log(`  [${tag}] ${fn.name} called`);
    return fn.apply(this, args);
  };

const adminAdd = tagged('ADMIN')(add);

// ============================================================================
// PART 3: COMPOSING DECORATORS
// ============================================================================

/**
 * Apply several decorators at once. compose(a, b, c)(fn) === a(b(c(fn)))
 * The decorator listed LAST wraps the function first (innermost), exactly like
 * stacked `@a @b @c` decorators in TypeScript / Angular.
 */
const compose =
  (...decorators) =>
  (fn) =>
    decorators.reduceRight((wrapped, decorator) => decorator(wrapped), fn);

// ============================================================================
// PART 4: REAL-WORLD WEB DEV DECORATORS (front-end)
// ============================================================================

/**
 * debounce — wait until the user STOPS calling for `ms` milliseconds.
 * Real use: search-as-you-type input, window resize handlers, autosave.
 *
 *   input.addEventListener('input', debounce(searchApi, 300));
 */
const debounce = (ms) => (fn) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
};

/**
 * throttle — run at most once every `ms` milliseconds.
 * Real use: scroll position tracking, infinite scroll, mousemove, analytics.
 *
 *   window.addEventListener('scroll', throttle(100)(updateProgressBar));
 */
const throttle = (ms) => (fn) => {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      return fn.apply(this, args);
    }
  };
};

/**
 * once — the function only ever runs one time; later calls return the first result.
 * Real use: initialise analytics / SDKs, "submit" buttons, loading a script tag.
 */
function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

/**
 * memoize — cache results by arguments.
 * Real use: expensive calculations (formatting, filtering big lists),
 * derived state / selectors (like Redux `reselect`).
 */
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(`  💾 cache hit for ${fn.name}${key}`);
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * cacheWithTTL — cache ASYNC results (API responses) for a limited time.
 * Also de-duplicates in-flight requests: if 3 components request the same URL
 * at once, only ONE network request is made (we cache the Promise itself).
 */
const cacheWithTTL = (ttlMs) => (fn) => {
  const cache = new Map(); // key -> { promise, expires }
  return function (...args) {
    const key = JSON.stringify(args);
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
      console.log(`  💾 serving cached response for ${key}`);
      return hit.promise;
    }
    const promise = fn.apply(this, args).catch((err) => {
      cache.delete(key); // never cache failures
      throw err;
    });
    cache.set(key, { promise, expires: Date.now() + ttlMs });
    return promise;
  };
};

/**
 * retry — retry a failing async call with exponential backoff.
 * Real use: flaky network requests, 503 responses, mobile connections.
 */
const retry =
  ({ attempts = 3, delayMs = 100 } = {}) =>
  (fn) =>
    async function (...args) {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          return await fn.apply(this, args);
        } catch (err) {
          if (attempt === attempts) throw err;
          const wait = delayMs * 2 ** (attempt - 1); // 100, 200, 400...
          console.log(`  ↻ attempt ${attempt} failed (${err.message}), retrying in ${wait}ms`);
          await sleep(wait);
        }
      }
    };

/**
 * withTimeout — reject if the async function takes too long.
 * Real use: don't leave a spinner running forever on a hung request.
 */
const withTimeout = (ms) => (fn) =>
  function (...args) {
    return Promise.race([
      fn.apply(this, args),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${fn.name} timed out after ${ms}ms`)), ms)
      ),
    ]);
  };

/**
 * withLoading — toggle a loading flag around an async call.
 * Real use: show/hide spinners, disable buttons while a form submits.
 */
const withLoading = (setLoading) => (fn) =>
  async function (...args) {
    setLoading(true);
    try {
      return await fn.apply(this, args);
    } finally {
      setLoading(false); // runs on success AND failure
    }
  };

/**
 * deprecated — warn developers once when an old API is used.
 * Real use: library / design-system maintenance.
 */
const deprecated = (message) => (fn) => {
  let warned = false;
  return function (...args) {
    if (!warned) {
      console.warn(`  ⚠️  DEPRECATED: ${fn.name}() — ${message}`);
      warned = true;
    }
    return fn.apply(this, args);
  };
};

// ============================================================================
// PART 5: REAL-WORLD WEB DEV DECORATORS (back-end / Express-style handlers)
// ============================================================================
//
//  Express route handlers look like (req, res) => {...}. Decorators let us
//  add cross-cutting concerns (auth, validation, rate limiting, error handling)
//  without copy-pasting checks into every route.
// ============================================================================

/** A tiny fake `res` object so this file runs without Express installed. */
function createMockRes() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      console.log(`  HTTP ${this.statusCode}:`, JSON.stringify(body));
      return this;
    },
  };
}

/**
 * requireAuth — block requests without a valid user; optionally require a role.
 */
const requireAuth =
  (role = null) =>
  (handler) =>
    function (req, res) {
      if (!req.user) return res.status(401).json({ error: 'Not logged in' });
      if (role && req.user.role !== role) {
        return res.status(403).json({ error: `Requires role: ${role}` });
      }
      return handler.call(this, req, res);
    };

/**
 * validateBody — check required fields and types before the handler runs.
 *   validateBody({ email: 'string', age: 'number' })
 */
const validateBody = (schema) => (handler) =>
  function (req, res) {
    const errors = Object.entries(schema)
      .filter(([field, type]) => typeof req.body?.[field] !== type)
      .map(([field, type]) => `${field} must be a ${type}`);
    if (errors.length) return res.status(400).json({ errors });
    return handler.call(this, req, res);
  };

/**
 * rateLimit — allow max N requests per IP in a time window.
 */
const rateLimit = ({ max, windowMs }) => (handler) => {
  const hits = new Map(); // ip -> [timestamps]
  return function (req, res) {
    const now = Date.now();
    const recent = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({ error: 'Too many requests, slow down' });
    }
    hits.set(req.ip, [...recent, now]);
    return handler.call(this, req, res);
  };
};

/**
 * catchErrors — turn thrown errors into a clean 500 response instead of a crash.
 * (Removes the need for try/catch in every async route.)
 */
const catchErrors = (handler) =>
  async function (req, res) {
    try {
      return await handler.call(this, req, res);
    } catch (err) {
      console.log(`  🔥 logged to monitoring: ${err.message}`);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  };

// Plain handlers — they only contain business logic!
function createUserHandler(req, res) {
  res.status(201).json({ created: { email: req.body.email, age: req.body.age } });
}

function deleteUserHandler(req, res) {
  res.json({ deleted: req.params.id, by: req.user.name });
}

// Decorated routes — order matters: outermost runs first.
const createUser = compose(
  catchErrors,
  rateLimit({ max: 2, windowMs: 1000 }),
  validateBody({ email: 'string', age: 'number' })
)(createUserHandler);

const deleteUser = compose(catchErrors, requireAuth('admin'))(deleteUserHandler);

// ============================================================================
// PART 6: CLASS & METHOD DECORATORS (the `@` syntax)
// ============================================================================
//
//  With TypeScript 5+ / Babel you can write:
//
//      @singleton
//      class UserService {
//        @logMethod
//        @memoizeMethod
//        getUser(id) { ... }
//
//        @bound
//        handleClick() { ... }
//      }
//
//  A modern (TC39) METHOD decorator has this signature:
//
//      function decorator(originalMethod, context) {
//        // context = { kind: 'method', name: 'getUser', static, private,
//        //             addInitializer(fn) }
//        return function replacementMethod(...args) { ... };
//      }
//
//  A CLASS decorator receives (OriginalClass, context) and may return a new class.
//
//  Since Node can't parse `@` yet, `applyDecorators` below does what the
//  compiler would do, so you can see EXACTLY how it works under the hood.
// ============================================================================

/** METHOD decorator: log calls with the class + method name. */
function logMethod(originalMethod, context) {
  const name = String(context.name);
  return function (...args) {
    console.log(`  → ${this.constructor.name}.${name}(${args.join(', ')})`);
    return originalMethod.apply(this, args);
  };
}

/** METHOD decorator: per-instance caching (instances don't share caches). */
function memoizeMethod(originalMethod, context) {
  const caches = new WeakMap(); // instance -> Map
  return function (...args) {
    if (!caches.has(this)) caches.set(this, new Map());
    const cache = caches.get(this);
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, originalMethod.apply(this, args));
    else console.log(`  💾 ${String(context.name)}${key} from cache`);
    return cache.get(key);
  };
}

/**
 * METHOD decorator: auto-bind `this`.
 * Real use: passing methods as event handlers / callbacks
 *   button.addEventListener('click', component.handleClick) // `this` is lost without @bound
 */
function bound(originalMethod, context) {
  context.addInitializer(function () {
    this[context.name] = this[context.name].bind(this);
  });
  return originalMethod;
}

/** METHOD decorator FACTORY: only allow a method when a permission is present. */
const requirePermission = (permission) =>
  function (originalMethod, context) {
    return function (...args) {
      if (!this.permissions?.includes(permission)) {
        throw new Error(`${String(context.name)} requires "${permission}" permission`);
      }
      return originalMethod.apply(this, args);
    };
  };

/** CLASS decorator: only ever create one instance (e.g. an API client, store). */
function singleton(OriginalClass, context) {
  let instance;
  const Singleton = class extends OriginalClass {
    constructor(...args) {
      if (instance) return instance;
      super(...args);
      instance = this;
    }
  };
  Object.defineProperty(Singleton, 'name', { value: OriginalClass.name });
  return Singleton;
}

/** CLASS decorator FACTORY: register components by name (like Angular @Component). */
const registry = new Map();
const component = (selector) =>
  function (OriginalClass, context) {
    registry.set(selector, OriginalClass);
    console.log(`  📦 registered <${selector}> → ${String(context.name)}`);
    return OriginalClass;
  };

/**
 * A mini "compiler" that applies TC39-style decorators.
 *
 *   applyDecorators(Class, {
 *     class: [classDecoA, classDecoB],
 *     methods: { methodName: [decoA, decoB] },
 *   })
 *
 * Like real `@` syntax, decorators are applied bottom-up (the one closest to
 * the method runs first).
 */
function applyDecorators(TargetClass, { class: classDecorators = [], methods = {} }) {
  const initializers = [];

  for (const [name, decorators] of Object.entries(methods)) {
    let method = TargetClass.prototype[name];
    const context = {
      kind: 'method',
      name,
      static: false,
      private: false,
      addInitializer: (fn) => initializers.push(fn),
    };
    for (const decorator of [...decorators].reverse()) {
      method = decorator(method, context) ?? method;
    }
    TargetClass.prototype[name] = method;
  }

  // Run addInitializer callbacks when an instance is constructed.
  let Result = initializers.length
    ? class extends TargetClass {
        constructor(...args) {
          super(...args);
          initializers.forEach((init) => init.call(this));
        }
      }
    : TargetClass;
  Object.defineProperty(Result, 'name', { value: TargetClass.name });

  for (const decorator of [...classDecorators].reverse()) {
    Result = decorator(Result, { kind: 'class', name: TargetClass.name }) ?? Result;
  }
  return Result;
}

// ---- A class written the "normal" way --------------------------------------

/*
 *  With decorator syntax this would simply be:
 *
 *    @singleton
 *    class UserService {
 *      constructor() { this.permissions = ['read']; }
 *
 *      @logMethod @memoizeMethod
 *      getUser(id) { ... }
 *
 *      @requirePermission('delete')
 *      deleteUser(id) { ... }
 *
 *      @bound
 *      handleClick() { ... }
 *    }
 */
let UserService = class UserService {
  constructor() {
    this.permissions = ['read'];
    this.dbCalls = 0;
  }

  getUser(id) {
    this.dbCalls++;
    return { id, name: `User #${id}` };
  }

  deleteUser(id) {
    return `User ${id} deleted`;
  }

  handleClick() {
    return `clicked! dbCalls so far = ${this.dbCalls}`;
  }
};

UserService = applyDecorators(UserService, {
  class: [singleton],
  methods: {
    getUser: [logMethod, memoizeMethod],
    deleteUser: [requirePermission('delete')],
    handleClick: [bound],
  },
});

/*
 *    @component('user-card')
 *    class UserCard { render() { ... } }
 */
let UserCard = class UserCard {
  constructor(user) {
    this.user = user;
  }
  render() {
    return `<div class="card">${this.user.name}</div>`;
  }
};
UserCard = applyDecorators(UserCard, { class: [component('user-card')] });

// ============================================================================
// PART 7: LEGACY / TypeScript "experimentalDecorators" STYLE (FYI)
// ============================================================================
//
//  Older Angular / NestJS / TypeScript code (experimentalDecorators: true)
//  uses a DIFFERENT signature: (target, propertyKey, descriptor).
//  You modify descriptor.value and return the descriptor.
//  You'll see this a lot in existing codebases.
// ============================================================================

function legacyLog(target, propertyKey, descriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args) {
    console.log(`  [legacy] ${propertyKey}(${args.join(', ')})`);
    return original.apply(this, args);
  };
  return descriptor;
}

class Calculator {
  // In TS (legacy mode):  @legacyLog multiply(a, b) { ... }
  multiply(a, b) {
    return a * b;
  }
}

// What the TS compiler generates for the legacy decorator:
const descriptor = Object.getOwnPropertyDescriptor(Calculator.prototype, 'multiply');
Object.defineProperty(
  Calculator.prototype,
  'multiply',
  legacyLog(Calculator.prototype, 'multiply', descriptor)
);

// ============================================================================
// RUN THE DEMOS
// ============================================================================

// Fake API so the demo needs no internet connection.
let apiCallCount = 0;
async function fetchUser(id) {
  apiCallCount++;
  await sleep(30);
  return { id, name: `User ${id}` };
}

let flakyCalls = 0;
async function flakyFetch(url) {
  flakyCalls++;
  if (flakyCalls < 3) throw new Error('503 Service Unavailable');
  return { url, data: 'finally worked' };
}

async function slowReport() {
  await sleep(500);
  return 'report';
}

async function main() {
  section('PART 1: Basic decorators');
  loggedAdd(2, 3);
  const timedFetch = timed(fetchUser);
  await timedFetch(1);

  section('PART 2: Decorator factories');
  console.log('  result:', adminAdd(10, 5));

  section('PART 3: Composing decorators');
  const superAdd = compose(tagged('MATH'), logger)(add);
  superAdd(4, 4);

  section('PART 4a: debounce (search-as-you-type)');
  const search = debounce(100)((query) => console.log(`  🔍 API search for "${query}"`));
  ['r', 're', 'rea', 'reac', 'react'].forEach((q) => search(q)); // user typing fast
  await sleep(150);
  console.log('  (5 keystrokes → only 1 API call)');

  section('PART 4b: throttle (scroll events)');
  let scrollUpdates = 0;
  const onScroll = throttle(50)(() => scrollUpdates++);
  for (let i = 0; i < 20; i++) {
    onScroll();
    await sleep(10);
  }
  console.log(`  20 scroll events over ~200ms → ${scrollUpdates} updates`);

  section('PART 4c: once (initialise analytics)');
  const initAnalytics = once(() => {
    console.log('  📊 analytics SDK loaded');
    return { ready: true };
  });
  initAnalytics();
  initAnalytics();
  initAnalytics();
  console.log('  (called 3 times, ran once)');

  section('PART 4d: memoize (expensive calculation)');
  const formatPrice = memoize(function formatPrice(amount, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  });
  console.log(' ', formatPrice(1999.5, 'USD'));
  console.log(' ', formatPrice(1999.5, 'USD'));

  section('PART 4e: cacheWithTTL (API response cache + request de-dupe)');
  const getUser = cacheWithTTL(1000)(fetchUser);
  apiCallCount = 0;
  await Promise.all([getUser(7), getUser(7), getUser(7)]); // 3 components at once
  await getUser(7);
  console.log(`  4 requests for user 7 → ${apiCallCount} real API call(s)`);

  section('PART 4f: retry with exponential backoff');
  const reliableFetch = retry({ attempts: 4, delayMs: 50 })(flakyFetch);
  console.log('  result:', await reliableFetch('/api/products'));

  section('PART 4g: withTimeout');
  try {
    await withTimeout(100)(slowReport)();
  } catch (err) {
    console.log(`  ❌ ${err.message} — show "try again" message to user`);
  }

  section('PART 4h: withLoading (spinner state)');
  const ui = { loading: false };
  const setLoading = (value) => {
    ui.loading = value;
    console.log(`  spinner ${value ? 'ON' : 'OFF'}`);
  };
  const submitForm = withLoading(setLoading)(fetchUser);
  await submitForm(42);

  section('PART 4i: deprecated');
  const oldGetUser = deprecated('use getUserById() instead')(function getUserOld(id) {
    return id;
  });
  oldGetUser(1);
  oldGetUser(2); // warns only once

  section('PART 5: Express-style route decorators');
  console.log('  POST /users (bad body):');
  await createUser({ ip: '1.1.1.1', body: { email: 'a@b.com' } }, createMockRes());
  console.log('  POST /users (valid):');
  await createUser({ ip: '1.1.1.1', body: { email: 'a@b.com', age: 30 } }, createMockRes());
  console.log('  POST /users (3rd request in 1s → rate limited):');
  await createUser({ ip: '1.1.1.1', body: { email: 'a@b.com', age: 30 } }, createMockRes());

  console.log('  DELETE /users/9 (not logged in):');
  await deleteUser({ params: { id: 9 } }, createMockRes());
  console.log('  DELETE /users/9 (regular user):');
  await deleteUser({ params: { id: 9 }, user: { name: 'Sam', role: 'user' } }, createMockRes());
  console.log('  DELETE /users/9 (admin):');
  await deleteUser({ params: { id: 9 }, user: { name: 'Ada', role: 'admin' } }, createMockRes());

  const brokenRoute = catchErrors(async () => {
    throw new Error('DB connection lost');
  });
  console.log('  GET /reports (handler throws):');
  await brokenRoute({}, createMockRes());

  section('PART 6: Class & method decorators (TC39 style)');
  const service = new UserService();
  service.getUser(1);
  service.getUser(1); // cached
  console.log(`  dbCalls: ${service.dbCalls}`);

  const sameService = new UserService();
  console.log(`  @singleton → same instance? ${service === sameService}`);

  try {
    service.deleteUser(1);
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
  }
  service.permissions.push('delete');
  console.log(`  ✅ ${service.deleteUser(1)}`);

  const { handleClick } = service; // detached, like passing to addEventListener
  console.log(`  @bound → ${handleClick()}`);

  const card = new (registry.get('user-card'))({ name: 'Ada Lovelace' });
  console.log(`  rendered: ${card.render()}`);

  section('PART 7: Legacy (experimentalDecorators) style');
  console.log('  result:', new Calculator().multiply(6, 7));

  section('SUMMARY');
  console.log(`
  • A decorator = a function that wraps another function/class to add behavior.
  • Factory = a function that RETURNS a decorator, so it can take options.
  • Always use fn.apply(this, args) so methods keep their \`this\`.
  • Always return the original result (and await it for async functions).
  • Use try/finally for "after" logic that must run even on errors.
  • Compose small, single-purpose decorators instead of one giant wrapper.
  • @ syntax: TC39 signature (value, context) vs legacy TS (target, key, descriptor).
`);
}

main();
