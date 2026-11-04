# Part A — Reading the original starter

All answers describe the **original starter** (before my changes). I also confirmed the main points by running the untouched starter in a browser (dev and preview) and forcing failures with request interception.

## 1. Hard refresh → session restore → route guard

1. The browser loads `index.html`, which loads `src/main.jsx`. It renders `StrictMode > BrowserRouter > AppContextProvider > App`.
2. `AppContextProvider` (`src/context/AppContext.jsx`) starts with `user = null`, `userType = null`, `isAuthenticated = false`, `authLoading = true`.
3. Its first `useEffect` calls `getSession()` (`src/services/authService.js`), which does **`GET /api/auth-me/`** through the shared Axios instance (`src/services/api.js`, `baseURL: '/'`, `withCredentials: true`). **This is the request that confirms the session.** The browser attaches the HttpOnly cookie itself.
4. Success: it sets `user`, `userType`, `isAuthenticated = true`. Any failure (401, 5xx, network) goes to `.catch` and is treated as "signed out" (the code does not distinguish them). `.finally` sets `authLoading = false`. The `active` flag ignores a response if the effect was cleaned up (in dev `StrictMode` runs the effect twice, so I saw two `/api/auth-me/` calls).
5. `ProtectedRoute.jsx` shows `<Loading />` while `authLoading` is true, then decides (see Q2). A second effect in `AppContext` loads the cart count only for `Customer`.

**What the frontend stores:** only in-memory React state (`user`, `userType`, `isAuthenticated`, `authLoading`, `cartCount`) plus the module-level cache in `cartService.js`. Nothing is written to `localStorage`, `sessionStorage` or `document.cookie`. A hard refresh wipes all of it, which is why `/api/auth-me/` is called again.

**What I can conclude about cookie security:** the server sets `demo_session` with `HttpOnly` (JavaScript cannot read it; the existing test also checks this), `SameSite=Lax` and `Path=/`. The frontend never touches the cookie, and the role shown in the UI comes from the server's `/api/auth-me/` response.

**What I cannot conclude:** the cookie has no `Secure` flag and no expiry; its value is just the plain text `University` or `Customer`, so anyone can send `Cookie: demo_session=University` (curl, DevTools) — it is forgeable; there is no signature, server-side session store, rotation or CSRF token. `mock/server.js` says itself that it is not a real security design. So nothing here tells me how a production cookie is configured, and the frontend guard is only UX, not authorisation.

## 2. The `isDev` branch in `ProtectedRoute.jsx`

`isDev = import.meta.env.MODE === 'development'`. It is true under `npm run dev` and false under `npm run build` / `npm run preview` (production mode). The line `if (!isAuthenticated && !isDev) return <Navigate to="/" replace />` means: **signed-out users are only redirected in non-dev builds.**

- **Does it bypass role checks too?** No. The role check is a separate `if` afterwards (`allowedRoles?.length && !allowedRoles.includes(userType)`). It only runs when `allowedRoles` is passed. In dev a signed-out user has `userType = null`, so on a route *with* `allowedRoles` they would not be redirected but would see "You do not have access to this page." So dev skips the redirect, not the role check.
- **Signed-out user on a route without `allowedRoles` (e.g. `/my-orders`, `/my-cart` in the starter):** in **dev** the page renders and calls the API, gets 401, and the legacy services swallow it (I saw "No orders found." for a signed-out user). In **preview** the user is redirected to `/`.
- Also notable: with no `allowedRoles`, *any* signed-in role (including University) can open customer pages, and `MODE` can be changed with `--mode`, so a build made with `--mode development` would ship the bypass. Dev and preview behave differently, so a guard bug can hide in dev.

## 3. In-flight request and 2-second cache in `cartService.js`

Module-level variables `activeFetchPromise`, `cachedData`, `cachedTime` live for the whole page lifetime.

`fetchCartCases(forceRefresh = false)`:
1. If not forcing and a request is in flight, return that same promise (de-duplication). `AppContext` (cart count) and `MyCart` both call it on mount, so they share one request.
2. Else if not forcing and the cache is younger than 2000 ms, return `cachedData`.
3. Else start a request, store the promise, cache the result on success, and in `finally` set `activeFetchPromise = null`. On error it logs and returns `{ cases: [], count: 0 }` (not cached).

**Concrete risk (session isolation):** the cache and the in-flight promise are not keyed by user or session. Sequence: (1) Customer A is signed in and opens `/my-cart`; `fetchCartCases()` starts (or finishes within the last 2 s). (2) Without a full page reload (a client-side sign-out/sign-in, or the cookie changing from another tab) user B's session starts. (3) B's page calls `fetchCartCases()` before A's request has resolved, or within 2 s of it. (4) B receives A's promise/`cachedData`, so B sees A's cases and count. The demo controls reload the page, which clears module state, so this does not show up through them, but a real SPA sign-out would not reload.

Other risks in the same code: a `forceRefresh` call overwrites `activeFetchPromise`, then the *older* request's `finally` sets it to `null` while the newer one is still running, so a later call starts a third request; the older response can also finish last and overwrite a newer cache entry. Within 2 s after a cart change, the cached copy is served (stale data). A failure is returned as an empty cart, indistinguishable from a really empty one.

## 4. `MyOrders.jsx` — failure vs. successful empty

`fetchOrderCases()` (`src/services/orderList.js`) catches every error, logs `console.error('Unable to load orders', …)` and returns `{ orders: [], count: 0 }`. `MyOrders` then does `setOrders(result.orders)`, so after a failure `orders = []`, `loading = false`, `filtered = []`, and the page renders **"No orders found."**

A successful empty response (`{ orders: [], count: 0 }`) renders exactly the same text. I checked this in the browser: a forced 503, a 200 with an empty list, and a signed-out 401 all gave the identical "No orders found." The only difference is a console message. There is no error text and no retry. (Another case: a search that matches nothing shows the same sentence too.) If a 200 response ever lacked `orders`, `setOrders(undefined)` would make `orders.filter` throw during render and, with no error boundary, blank the page.

## 5. `useDynamicFormSchema.js`

**Request rejects:** there is no `.catch`. `fetchFormSchema(packageId).then(...).finally(...)` returns a promise that rejects and nobody handles it, so it becomes an *unhandled promise rejection* (I saw it as a `pageerror` in the browser). `finally` still sets `loading = false`. `schema` stays whatever it was (`null` the first time), so `MyCart` shows an empty "Package form preview" with no message. If an old schema existed, it stays on screen.

**Quick change from one package ID to another:** the effect re-runs because `packageId` is in the dependency array, but there is no cleanup, `AbortController` or ignore flag.

*What the code guarantees:* the effect runs again when `packageId` changes; `loading` is set to `true` at the start of each run; every settled request eventually sets `loading` to `false`; the schema is only set from a successful response; `packageId` is sent as a query parameter.

*What it does not guarantee, so I would have to test:*
- **Response order.** Both requests are in flight; whichever resolves last wins, so package A's response arriving after B's would leave A's schema shown while the ID is B.
- **`loading` accuracy.** The first request's `finally` sets `loading = false` while the second is still running.
- **Stale schema.** The old schema is not cleared when the ID changes, and an empty/falsy `packageId` returns early without clearing it.
- **Response shape.** `schema?.fields.map` in `MyCart` throws if the response has no `fields`.

How I would test: delay the response for package 1 longer than package 2 (e.g. browser request interception), switch 1 → 2 quickly, and check the displayed fields and the loading flag; repeat with a rejecting request. `MyCart` hard-codes `useDynamicFormSchema(1)`, so a temporary test harness that can change the ID is needed.
