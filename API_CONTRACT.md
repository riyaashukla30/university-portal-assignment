# Local exercise API contract

**Fictional contract, supplied only for this assessment.** Same-origin API provided by Vite middleware in dev and preview. Use `src/services/api.js`. Dates are ISO UTC strings; display them consistently. No API keys needed.

## Demo sessions

The existing demo controls use:

- `POST /api/demo/session/?role=Customer` or `role=University`: sets a local HttpOnly cookie.
- `DELETE /api/demo/session/`: clears the cookie.
- `GET /api/auth-me/`: returns `{ "userType": "University", "user": { "name": "University Demo", "universityName": "Example University" } }`, or HTTP 401 when signed out.

This role cookie is deliberately forgeable demo plumbing, not real authentication. Do not reproduce it in production or claim the frontend guard secures data. No real tokens/passwords are present.

## University applications

`GET /api/university/applications/`

Requires the University demo session. Customer returns **403**, signed out returns **401**.

| Parameter | Default | Meaning |
|---|---|---|
| `page` | `1` | Positive integer |
| `pageSize` | `20` | Must be 20 for this exercise |
| `search` | empty | Case-insensitive substring of candidate name or application number |
| `status` | empty | Empty means all; `SUBMITTED`, `IN_PROGRESS`, `COMPLETED` |
| `scenario` | `normal` | Test response mode below |

Search and status combine with AND, and are applied **before pagination**. Fixture order is stable. There are 47 fictional applications. No second university/tenant or staff permission hierarchy needs implementing.

```json
{
  "applications": [
    {
      "applicationNumber": "UNI-DEMO-0001",
      "candidateName": "Avery Demo 1",
      "packageName": "Standard Verification",
      "status": "SUBMITTED",
      "submittedOn": "2026-10-01T00:00:00.000Z"
    }
  ],
  "total": 47,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

The example abbreviates the rows; normal page 1 contains 20 rows. Customer services use different field names. Do not assume their response mappings fit this endpoint.

| Scenario | Response | Expected dashboard behaviour |
|---|---|---|
| `normal` | 250ms delay; normal paginated data | Render rows/count/navigation |
| `slow` | 1800ms delay; normal data | Show loading; older results must not replace newer results |
| `empty` | `applications: []`, `total: 0`, `totalPages: 0` | Successful empty state; no active page navigation |
| `error` | HTTP 503, `{ "error": "Demo service unavailable" }` | Error distinct from empty; retry available (keeps failing until scenario changes) |
| `null` | HTTP 200 with `applications: null` | Invalid-response error; no crash or false empty state |
| `missing-total-pages` | Normal response without `totalPages` | Derive `Math.ceil(total / pageSize)` |

Reset page when search/status/scenario changes. A requested page beyond the final page returns an empty slice with the true total. There is no mutation endpoint in the assignment.

## Existing customer endpoints

- `GET /api/dbp/case-view-list/`: `{ results: [...], count }` with snake_case row keys.
- `GET /api/dbp/orders-list/`: `{ orders: [...], count }` with snake_case row keys.
- `GET /api/form/schema?packageId=1`: `{ fields: [...] }`.

These require any demo session; they are deliberately simplistic. For inspecting legacy failures manually, these three endpoints also accept `scenario=error`. Do not add scenario UI to customer pages as part of the task.
