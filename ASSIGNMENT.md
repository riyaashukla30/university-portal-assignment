# Frontend intern practical — University staff workspace

## Context and time budget

Our next priority is a university client portal alongside an existing customer frontend. We want to assess your ability to read unfamiliar code, extend it safely and explain your decisions.

This exercise is synthetic. Its contract is provided in `API_CONTRACT.md`; do not infer production behaviour from it. The university user is **staff acting for the university**, not a student account. Do not build student registration/login, payment, OTP or application creation.

**Timebox: 3–4 hours of active work**, excluding initial dependency installation. Stop at four hours and document unfinished work. There is no requirement to complete everything, and visual polish is secondary. Keep Part A and C concise (about one page each).

## Part A — Read before changing (45–60 minutes)

Write `ANSWERS.md`, referencing file paths and relevant functions. Record your findings against the **original starter**, not only your modified version.

1. Trace a hard refresh from `main.jsx` to session restoration and the route guard. Which request confirms the session? What does the frontend store, and what can/cannot you conclude about cookie security from this demo?
2. Explain the `isDev` branch in `ProtectedRoute.jsx`. Does it bypass role checks too? What would happen for a signed-out user on a route without `allowedRoles` in dev versus preview?
3. Explain the in-flight request and two-second cache in `cartService.js`. Describe one concrete stale-data, session-isolation or concurrency risk, including the sequence of events needed to trigger it.
4. Trace what `MyOrders.jsx` displays when the order request fails. How does that differ from a successful empty response?
5. In `useDynamicFormSchema.js`, what happens if the request rejects? What about a quick change from one package ID to another? Separate what the code guarantees from what you would need to test.

## Part B — Extend the existing frontend (about 2 hours)

Implement `/university/dashboard` inside this starter, with a **university-specific layout/header**, separate from customer cart/order navigation. Do not create a separate Vite project. Keep the demo controls available for testing.

### Core requirements

- Only authenticated `userType === 'University'` users can view the dashboard. Signed-out and Customer users must not see application data, in **both dev and preview**. Client-side guards are UX, not a replacement for backend authorisation.
- Use the existing Axios instance and create a university service; consume the supplied mock endpoint. Do not import fixtures directly into the page.
- Table columns: application number, candidate name, package name, status, submitted date.
- Pagination: 20 rows per page. Search candidate name or application number; filter status. Both must operate on the **full dataset through API parameters**, not just the current page.
- Reset to page 1 when search/status changes. Preserve the active search/filter when changing page.
- Clearly separate loading, successful empty, and request failure. A failure must offer retry without a browser refresh.
- Add a labelled scenario selector on the dashboard and pass its value as `scenario` to the API (options in the contract). It is a demo/testing control, not a production feature.
- Handle `applications: null` as an invalid-response **error**, not a successful empty list. If `totalPages` is missing, derive it from `total` and `pageSize`.
- Use `total` for the overall count, not the current page's row count. A last page with seven rows and `total: 47` is valid.
- Use labelled controls, semantic table headings, readable status text and usable narrow-screen layout. No design assets are required.
- Prevent an older request from overwriting results after inputs change; cancellation or response sequencing is acceptable.

Reuse where it fits. You may add components/hooks and make minimal changes to routing/layout/guards where needed. Preserve working customer pages; do not rewrite customer services or fix every unrelated issue. Choose clear, modest abstractions rather than extracting every small expression.

## Part C — Decisions and verification (15–30 minutes)

Write `NOTES.md` with:

1. What you reused, what you chose not to reuse, and why (file names).
2. One actual duplication you noticed, and whether extracting it is worth doing now. No unrelated refactor required.
3. One legacy risk, and what you deliberately left unchanged.
4. Manual checks performed and results, including session/access checks and a preserved customer flow.
5. Actual time spent, unfinished work, any blockers and tool/AI assistance used.

## Submit

Reply with a source ZIP or a repository link you are comfortable sharing. Include `ANSWERS.md`, `NOTES.md`, source and lockfile; exclude `node_modules/` and `dist/`. State the results of `npm test` and `npm run build` honestly. If a command fails, include the error and what you investigated. Existing API tests do not prove the UI works.

You may initialise your own Git repository; do not push to an employer repository. A short walkthrough may follow, focused on your reasoning and a small change to your submission. No DSA task is part of this exercise.
