# University portal · frontend practical

This is a **synthetic legacy-style starter**, not our production source. All names/data are fictional. It intentionally mixes reusable components with customer-specific code and some rough edges. Read `ASSIGNMENT.md` before making changes.

## Run

Node **22.12+** (24 recommended), npm, and an internet connection for the first install.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. No backend, database, environment file or API keys are needed. Use the **demo session controls** to sign in as Customer or University staff, or sign out. These controls reload the page deliberately. Start by exploring `/my-orders` and `/my-cart` as Customer.

```bash
npm test
npm run build
npm run preview
```

Both dev and preview include a local mock API. `dist/` alone does not host that API; use `npm run preview` to test the built application. Keep the same browser hostname throughout (do not alternate localhost and 127.0.0.1, because cookies are host-specific).

## Layout

- `src/App.jsx`: routes and app layout
- `src/context/`: authentication state and route guard
- `src/services/`: Axios and customer services
- `src/pages/`, `src/components/`, `src/hooks/`: existing customer frontend
- `mock/`: local server, sessions and fixtures; not a real security system
- `API_CONTRACT.md`: university mock contract and scenario switches
- `tests/`: mock API smoke tests, **not** tests of your dashboard

There is no university dashboard implementation. The university mock endpoint is already supplied so your time goes into understanding and extending the frontend, not building a fake backend.

## Ground rules

- JavaScript + JSX only; no TypeScript migration, redesign or broad refactor.
- No new dependencies. Use the supplied stack.
- Do not fix all legacy issues. Explain unrelated issues in your notes.
- Do not include `node_modules/`, `dist/`, cookies, personal data or credentials in your submission.
- You may use documentation or AI tools. Disclose their use briefly and be prepared to explain and change every submitted line during a short walkthrough. Tool use itself is not penalised.
- This is a hiring exercise, not unpaid production work. No production integration is expected.
