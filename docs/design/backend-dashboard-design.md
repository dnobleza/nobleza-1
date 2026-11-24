# Backend Design — Project Requests (Client + Admin Dashboards)

Status: proposed (2026-11-24). Pairs with `dashboard-design.md` (same folder) (the UI).
Fits the existing backend: Express 5, plain JavaScript (CommonJS), layered folders, Postgres with node-pg-migrate, UUID ids, errors as `{ error }`, JWT with `sub` = user id.

Items marked **[DECIDE]** need Dan's confirmation before building.

---

## 1. Data model

### `project_requests` — one row per "Start a project" submission
| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | default `gen_random_uuid()` |
| `client_id` | uuid FK → `users.id`, not null | Always set from the token (`req.user.id`), never from the body. `ON DELETE RESTRICT` |
| `title` | text, not null | 1–120 chars, trimmed |
| `project_type` | text, not null + CHECK | **[DECIDE]** `website`, `web_app`, `mobile_app`, `automation`, `ui_ux`, `maintenance`, `other` |
| `description` | text, not null | 1–5,000 chars |
| `budget_range` | text, not null + CHECK | **[DECIDE]** `below_50k`, `50k_100k`, `100k_250k`, `above_250k`, `not_sure` (PHP) |
| `target_date` | date, nullable | must be today or later on create |
| `status` | text, not null, default `submitted` + CHECK | see §2 |
| `admin_notes` | text, nullable | **admin only — never returned to clients** |
| `created_at` / `updated_at` | timestamptz, not null, default `now()` | |

Indexes: `(client_id, updated_at DESC)` for client lists; `(status, created_at)` for admin queues.

### `request_status_history` — the timeline / stepper dates
| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `request_id` | uuid FK → `project_requests.id`, not null | `ON DELETE CASCADE` |
| `from_status` | text, nullable | null for the first row (creation) |
| `to_status` | text, not null | |
| `note` | text, nullable | **visible to the client** (max 1,000 chars) |
| `changed_by` | uuid FK → `users.id`, not null | |
| `created_at` | timestamptz, not null, default `now()` | |

Index: `(request_id, created_at)`. A history row is written on create (`null → submitted`) and on every status change.

---

## 2. Status workflow **[DECIDE]**

```
submitted ──► in_review ──► quoted ──► in_progress ──► completed
    │              │           │
    └── cancelled ◄┘           └──► declined
   (client)                     (admin, before in_progress)
```

| From | Client may move to | Admin may move to |
|---|---|---|
| `submitted` | `cancelled` | `in_review`, `declined` |
| `in_review` | `cancelled` | `quoted`, `declined` |
| `quoted` | — | `in_progress`, `declined` |
| `in_progress` | — | `completed` |
| `completed` / `cancelled` / `declined` | — | — (final) |

- Rules live in one place: `services/request.service.js` (a transitions map). Any other move → `409 { error: "Can't move a request from X to Y" }`.
- Status update + history row happen in **one database transaction**.
- Quotes: **[DECIDE]** by email for now — "Quoted" is only a status label; no amount stored yet.

---

## 3. Endpoints

All under `/api/v1`. All require `requireAuth`. Admin routes also require `requireRole('admin')`.

### Client
| Method | Path | Notes |
|---|---|---|
| POST | `/requests` | Body: `{ title, projectType, description, budgetRange, targetDate? }` → `201 { request }`. `client_id` from token. |
| GET | `/requests?status=&page=&limit=` | Only the caller's requests, newest update first. `limit` max 50. Returns `{ requests, page, total }`. |
| GET | `/requests/:id` | Own request + history (oldest first). Someone else's → **404**. |
| PATCH | `/requests/:id/cancel` | Own request, only from `submitted` / `in_review` → `200 { request }`, else 409. |
| GET | `/dashboard/summary` | `{ counts: { submitted, in_review, quoted, in_progress, completed, cancelled, declined }, active, total, recentUpdates: [...5] }` |

### Admin
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/requests?status=&search=&sort=&page=&limit=` | All requests + client `{ id, name, email }`. `search` matches title or client name (ILIKE, parameterized). |
| GET | `/admin/requests/:id` | Full detail incl. `adminNotes`, client contact, history. |
| PATCH | `/admin/requests/:id/status` | Body `{ status, note? }`. Validates the transition; writes history in a transaction. |
| PATCH | `/admin/requests/:id/notes` | Body `{ adminNotes }` (max 5,000). |
| GET | `/admin/dashboard/summary` | Counts by status, `newCount` (submitted), `dueThisWeek` (in_progress with target_date ≤ 7 days). |
| GET | `/admin/activity?limit=` | Latest history rows across all requests, with request title and client name. |

### Responses
- camelCase JSON (`projectType`, `budgetRange`, `targetDate`, `createdAt`), matching the existing `toUser()` style.
- Client responses use a **client-safe column list without `admin_notes`** (same idea as `SAFE_COLUMNS` for passwords).
- Errors: `{ error }` with 400 (validation), 401, 403 (not admin), 404 (not found / not yours), 409 (invalid transition).

---

## 4. Folder layout (existing layered structure)

```
backend/src/
├── db/migrations/       <ts>_create-project-requests.js, <ts>_create-request-status-history.js
├── middlewares/         requireRole.js
├── validations/         request.validation.js
├── repositories/        request.repository.js, requestHistory.repository.js
├── services/            request.service.js        (transition rules, transactions)
├── controllers/         request.controller.js, admin.controller.js
└── routes/              request.routes.js, dashboard.routes.js, admin.routes.js  (mounted in routes/index.js)
```

### `requireRole(role)`
- Runs after `requireAuth`. Looks the role up in the database by `req.user.id` (the token only carries `sub`), so demoting a user takes effect immediately.
- Wrong role → `403 { error: "Forbidden" }`. Missing user → `401`.

---

## 5. Security rules

- Ownership is enforced **in SQL**: `WHERE id = $1 AND client_id = $2`. Never fetch then compare in JS.
- Another client's request → **404**, not 403 (don't reveal it exists).
- `:id` validated as a UUID → 400 instead of a database error.
- All queries parameterized; `search` uses `ILIKE $n` with escaped `%` / `_`.
- `admin_notes` never in any client response (tested).
- Rate limit `POST /requests` (e.g. 10 per day per user) — with the planned `express-rate-limit` work.
- Request body size stays limited (existing `express.json()` default).

---

## 6. Tests (Jest + supertest, `codehaus_test` database)

- Create: valid → 201 with `client_id` = caller; `client_id`/`status` in the body are ignored; each validation rule → 400; creates exactly one history row.
- Ownership: client A can't GET, list or cancel client B's request (404); lists only contain own rows.
- Roles: client on any `/admin/*` → 403; no token → 401; admin → 200.
- Transitions: every allowed move works; disallowed moves → 409 and **no** history row; cancel after `quoted` → 409.
- Transaction: if the history insert fails, the status is not changed.
- `admin_notes` never appears in any client response (create, list, detail, cancel, summary).
- Pagination, status filter and search return the right rows and totals.
- Summary counts match the seeded data.

---

## 7. Build order (one branch + PR each)

1. `feature/requests-schema`: both migrations + `requireRole` + tests.
2. `feature/requests-client-api`: create, list, detail + tests.
3. `feature/requests-cancel-history`: cancel + history in detail + tests.
4. `feature/requests-admin-api`: admin list, detail, status change, notes + tests.
5. `feature/dashboard-summaries`: client summary, admin summary, admin activity + tests.
6. Frontend (see `dashboard-design.md` §9).

## 8. Open decisions

1. Project types list (§1).
2. Budget ranges in PHP (§1).
3. Status names and workflow (§2); quotes by email for now?
