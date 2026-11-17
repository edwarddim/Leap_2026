/**
 * Promise combinators with fetch: all, allSettled, any, race
 * -----------------------------------------------------------
 * Uses the free dummy API JSONPlaceholder: https://jsonplaceholder.typicode.com
 *
 * Run with Node 18+ (fetch is built in):
 *   node promise-methods-demo.js
 */

const API = "https://jsonplaceholder.typicode.com";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * fetch() only rejects on network failure — a 404 or 500 still RESOLVES.
 * This wrapper turns non-2xx responses into rejections so the Promise
 * methods behave the way you'd expect.
 */
async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

/** Resolve after `ms` milliseconds (used to simulate slow servers). */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reject after `ms` milliseconds (used to build a timeout). */
const timeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );

const heading = (title) => console.log(`\n${"=".repeat(60)}\n${title}\n${"=".repeat(60)}`);

// ---------------------------------------------------------------------------
// 1. Promise.all — "I need ALL of these, or nothing"
// ---------------------------------------------------------------------------
// Real-life use: loading a user profile page. The page needs the user's info,
// their posts, AND their todos before it can render. If any one request fails
// the page can't render, so failing fast is the right behavior.
async function demoAll() {
  heading("Promise.all — load a profile page (user + posts + todos)");

  const userId = 1;
  try {
    // All three requests start at the same time (in parallel).
    const [user, posts, todos] = await Promise.all([
      getJSON(`${API}/users/${userId}`),
      getJSON(`${API}/posts?userId=${userId}`),
      getJSON(`${API}/todos?userId=${userId}`),
    ]);

    const done = todos.filter((t) => t.completed).length;
    console.log(`User:  ${user.name} (${user.email})`);
    console.log(`Posts: ${posts.length} — latest: "${posts[0].title}"`);
    console.log(`Todos: ${done}/${todos.length} completed`);
  } catch (err) {
    console.error("Could not load profile:", err.message);
  }

  // Failure case: one bad request rejects the WHOLE thing immediately.
  console.log("\n-- Same idea, but one request points to a missing resource --");
  try {
    await Promise.all([
      getJSON(`${API}/users/1`),
      getJSON(`${API}/users/9999`), // 404
      getJSON(`${API}/posts/1`),
    ]);
  } catch (err) {
    console.error("Promise.all rejected:", err.message);
    console.log("(The successful results are thrown away — all or nothing.)");
  }
}

// ---------------------------------------------------------------------------
// 2. Promise.allSettled — "Try everything, then tell me what happened"
// ---------------------------------------------------------------------------
// Real-life use: a dashboard made of independent widgets, or a batch job.
// If one widget fails, the rest should still show. allSettled never rejects;
// it gives you a status report for every promise.
async function demoAllSettled() {
  heading("Promise.allSettled — dashboard widgets that load independently");

  const widgets = [
    { name: "Recent Posts",  url: `${API}/posts?_limit=3` },
    { name: "Photo Albums",  url: `${API}/albums?_limit=3` },
    { name: "Broken Widget", url: `${API}/this-endpoint-does-not-exist` }, // 404
    { name: "Comments",      url: `${API}/comments?_limit=3` },
  ];

  const results = await Promise.allSettled(widgets.map((w) => getJSON(w.url)));

  results.forEach((result, i) => {
    const { name } = widgets[i];
    if (result.status === "fulfilled") {
      console.log(`✅ ${name.padEnd(14)} loaded ${result.value.length} items`);
    } else {
      console.log(`❌ ${name.padEnd(14)} failed: ${result.reason.message}`);
    }
  });

  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`\nSummary: ${results.length - failed} succeeded, ${failed} failed`);
}

// ---------------------------------------------------------------------------
// 3. Promise.any — "Give me the FIRST success, ignore failures"
// ---------------------------------------------------------------------------
// Real-life use: fetching the same data from several mirrors / CDNs /
// regional servers. Whichever succeeds first wins. It only rejects (with an
// AggregateError) if EVERY promise fails.
async function demoAny() {
  heading("Promise.any — use whichever mirror responds successfully first");

  // Simulated mirrors: one is down, one is slow, one is fast.
  const mirrors = [
    { name: "us-east (down)", run: () => getJSON(`${API}/invalid-path/1`) },
    { name: "eu-west (slow)", run: () => delay(800).then(() => getJSON(`${API}/posts/1`)) },
    { name: "ap-south (fast)", run: () => delay(100).then(() => getJSON(`${API}/posts/1`)) },
  ];

  try {
    const winner = await Promise.any(
      mirrors.map((m) => m.run().then((data) => ({ mirror: m.name, data })))
    );
    console.log(`Served by: ${winner.mirror}`);
    console.log(`Post title: "${winner.data.title}"`);
    console.log("(The failed mirror was ignored because another one succeeded.)");
  } catch (err) {
    console.error("All mirrors failed:", err.message);
  }

  // Failure case: every promise rejects -> AggregateError.
  console.log("\n-- Every mirror is down --");
  try {
    await Promise.any([
      getJSON(`${API}/nope-1`),
      getJSON(`${API}/nope-2`),
    ]);
  } catch (err) {
    console.log(`${err.name}: ${err.message}`);
    err.errors.forEach((e, i) => console.log(`  reason ${i + 1}: ${e.message}`));
  }
}

// ---------------------------------------------------------------------------
// 4. Promise.race — "Whoever settles first wins (success OR failure)"
// ---------------------------------------------------------------------------
// Real-life use: putting a timeout on a request. Race the fetch against a
// timer; if the timer rejects first, we stop waiting.
async function demoRace() {
  heading("Promise.race — add a timeout to a request");

  // Case A: the request is faster than the timeout -> success.
  try {
    const user = await Promise.race([
      getJSON(`${API}/users/2`),
      timeout(5000),
    ]);
    console.log(`Request finished in time: ${user.name}`);
  } catch (err) {
    console.error("Request failed:", err.message);
  }

  // Case B: a slow request loses to the timeout -> rejection.
  try {
    const slowRequest = delay(2000).then(() => getJSON(`${API}/users/3`));
    await Promise.race([slowRequest, timeout(500)]);
  } catch (err) {
    console.log(`Slow request abandoned: ${err.message}`);
  }

  // Bonus: Promise.race only stops *waiting*; it doesn't cancel the fetch.
  // To truly cancel, use AbortController (or AbortSignal.timeout in Node 18+).
  console.log("\n-- Real cancellation with AbortSignal.timeout --");
  try {
    await fetch(`${API}/photos`, { signal: AbortSignal.timeout(1) });
    console.log("Fetched photos (network was very fast!)");
  } catch (err) {
    console.log(`Fetch aborted: ${err.name}`);
  }
}

// ---------------------------------------------------------------------------
// Run the demos one after another so the output stays readable.
// ---------------------------------------------------------------------------
(async function main() {
  await demoAll();
  await demoAllSettled();
  await demoAny();
  await demoRace();

  heading("Cheat sheet");
  console.log(`
  Promise.all        -> resolves when ALL succeed; rejects on the FIRST failure
  Promise.allSettled -> always resolves with {status, value|reason} for each
  Promise.any        -> resolves with the FIRST success; rejects only if ALL fail
  Promise.race       -> settles like the FIRST promise to settle (pass or fail)
  `);
})();
