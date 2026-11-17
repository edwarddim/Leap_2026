async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}


// ---------------------------------------------------------------------------
// 1. Promise.all — "I need ALL of these, or nothing"
// ---------------------------------------------------------------------------
// Real-life use: loading a user profile page. The page needs the user's info,
// their posts, AND their todos before it can render. If any one request fails
// the page can't render, so failing fast is the right behavior.
    try {
        const [user, posts, todos] = await Promise.all([
            getJSON(`${API}/users/${userId}`),
            getJSON(`${API}/posts?userId=${userId}`),
            getJSON(`${API}/todos?userId=${userId}`),
        ]);
    } catch (error) {
        console.error(error)
    }

// ---------------------------------------------------------------------------
// 2. Promise.allSettled — "Try everything, then tell me what happened"
// ---------------------------------------------------------------------------
// Real-life use: a dashboard made of independent widgets, or a batch job.
// If one widget fails, the rest should still show. allSettled never rejects;
// it gives you a status report for every promise.
  const widgets = [
    { name: "Recent Posts",  url: `${API}/posts?_limit=3` },
    { name: "Photo Albums",  url: `${API}/albums?_limit=3` },
    { name: "Broken Widget", url: `${API}/this-endpoint-does-not-exist` }, // 404
    { name: "Comments",      url: `${API}/comments?_limit=3` },
  ];

  const results = await Promise.allSettled([
            getJSON(`${API}/users/${userId}`),
            getJSON(`${API}/posts?userId=${userId}`),
            getJSON(`${API}/todos?userId=${userId}`),
        ]);



// ---------------------------------------------------------------------------
// 3. Promise.any — "Give me the FIRST success, ignore failures"
// ---------------------------------------------------------------------------
// Real-life use: fetching the same data from several mirrors / CDNs /
// regional servers. Whichever succeeds first wins. It only rejects (with an
// AggregateError) if EVERY promise fails.

  const winner = await Promise.any([
            getJSON(`${API}/users/${userId}`),
            getJSON(`${API}/posts?userId=${userId}`),
            getJSON(`${API}/todos?userId=${userId}`),
        ]);



// ---------------------------------------------------------------------------
// 4. Promise.race — "Whoever settles first wins (success OR failure)"
// ---------------------------------------------------------------------------
// Real-life use: putting a timeout on a request. Race the fetch against a
// timer; if the timer rejects first, we stop waiting.

    const user = await Promise.race([
      getJSON(`${API}/users/2`),
      timeout(5000),
    ]);