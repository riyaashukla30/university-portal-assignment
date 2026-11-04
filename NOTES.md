# Part C — Decisions and verification

## 1. Reused vs. not reused

**Reused**
- `src/services/api.js` — the shared Axios instance, as required, for the new `universityService.js`.
- `src/context/AppContext.jsx` (`useAppContext`) — user name and `universityName` for the header.
- `src/context/ProtectedRoute.jsx` — kept, with one small change (see below).
- `src/components/Pagination.jsx`, `StatusBadge.jsx`, `Loading.jsx`, `DemoControls.jsx`, and the `.panel` / `.button` styles in `index.css`.

**Not reused, and why**
- `Navbar.jsx` — it is customer navigation (orders/cart). The university area has its own `UniversityLayout.jsx` header.
- `CaseListTable.jsx` — different columns and snake_case customer fields; the university table needs application number, package and a UTC date.
- `cartService.js` / `orderList.js` — they swallow errors and return empty data, which would hide failures; the dashboard must distinguish loading, empty and error.
- `useDynamicFormSchema.js` and the `MyOrders.jsx` pattern — no cancellation/error handling, and `MyOrders` filters only the loaded rows client-side, while the dashboard must search/filter on the full dataset through API parameters.

**Changes to existing files (minimal):** `App.jsx` (the old shell moved unchanged into `CustomerLayout.jsx`; a university layout route added) and `ProtectedRoute.jsx`: the dev redirect bypass now applies only to routes **without** `allowedRoles`, so the dashboard requires a session in dev too. Customer routes have no `allowedRoles`, so their behaviour is unchanged.

**New files:** `pages/UniversityDashboard.jsx`, `hooks/useUniversityApplications.js` (state + `AbortController` + retry), `services/universityService.js`, `utils/normalizeApplicationsResponse.js` (pure function: `applications: null` → error; derive `totalPages`), `components/UniversityLayout.jsx`, `components/CustomerLayout.jsx`, `tests/normalize-applications.test.js`.

## 2. One duplication noticed

`new Date(...).toLocaleDateString('en-GB')` is repeated in `CaseListTable.jsx` and `CheckAccordion.jsx`, and my dashboard has its own `formatDate`. I did **not** extract it now: mine intentionally uses `timeZone: 'UTC'` (the contract says dates are UTC ISO strings), while the customer pages use the viewer's local time zone, so a shared helper would change customer output or hide that difference. It is worth extracting later, once the team decides one date policy.

## 3. One legacy risk, deliberately left unchanged

`orderList.js` and `cartService.js` turn any failed request into an empty result, so a customer sees "No orders found." / "Your cart is empty." when the API actually failed (verified in the browser). Fixing it means changing customer error handling and UI, which the task says not to do. I noted it in `ANSWERS.md` Q4. I also left the `cartService` cache/session-isolation issue (ANSWERS.md Q3), the unhandled rejection in `useDynamicFormSchema.js`, and the outdated text in `NotFound.jsx` untouched.

## 4. Manual checks performed

I ran scripted browser checks (Playwright, Chromium) against **both** `npm run dev` and `npm run preview` (after `npm run build`), and read two screenshots (1100px and 375px). Result: **66/66 checks passed** on the final code; they cover:
- **Access:** signed-out → redirected to `/` with *no* `/api/university/` request, in dev and preview. Customer → "You do not have access" alert, no table, no request. University → dashboard. Hard refresh as University keeps access. Sign out via the demo control removes access.
- **Data:** page 1 shows 20 rows and "Showing 1–20 of 47"; page 3 shows 7 rows with total still 47; five semantic column headings; dates shown in UTC.
- **Search/filter:** "Avery" → 10 results across the full dataset; application-number search; status filter (16 SUBMITTED); changing search/status/scenario resets to page 1; changing page keeps the search (checked from the request parameters).
- **Scenarios:** `empty` → success message, no pagination; `error` → alert with the 503 message, Retry re-sends the request without reload and keeps failing until the scenario changes; `null` → invalid-response error, no crash, not the empty state; `missing-total-pages` → 3 pages derived; `slow` → loading shown, and after switching filters twice quickly only the latest filter's rows remain.
- **Narrow screen:** at 375px no horizontal page scroll (the table scrolls inside its own container).
- **Preserved customer flow:** as Customer, `/my-orders` lists 2 orders with the customer navbar; `/my-cart` shows cases, "Cart (2)", the form preview, and the accordion still expands. Signed-out `/my-orders` still behaves as before (stays in dev, redirects in preview).

One check failed once in a repeated run; the cause was my test script racing the 300 ms search debounce, not the app (it passed in three further runs). The check passed on the final code.

**Commands:** `npm test` → 12 tests pass (7 supplied + 5 new for the response normaliser). `npm run build` → succeeds.

**Not tested:** real screen-reader or keyboard-only walkthrough, Firefox/Safari, and component-level tests (no test libraries are allowed to be added, so UI behaviour is covered only by the manual browser checks above).

## 5. Time, unfinished work, tools

- **Actual time spent:** about 1.5–2 hours of my own time reviewing, running and understanding the code and documents (the code and documents were drafted with AI assistance, see below).
- **AI assistance:** I used Claude (Anthropic) to help read the starter, write the code and documents, and run the browser checks. I reviewed the result and can explain and change every line.
- **Unfinished / known limits:** if the session expires while on the dashboard, the user sees an HTTP 401 error with Retry rather than a redirect; search is debounced by 300 ms; old rows are replaced by the loading text during each request (no "keep previous rows" polish); no component tests; the `scenario` selector is a testing control and would not ship.
- **Blockers:** none.
