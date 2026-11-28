# Backend Design — Project Requests (Client + Admin Dashboards)

Status: client create, list and detail are **built** (2026-11-28). Everything else is marked **planned**.
Pairs with `dashboard-design.md` (same folder) (the UI).
Fits the existing backend: Express 5, plain JavaScript (CommonJS), layered folders, Postgres with node-pg-migrate, UUID ids, errors as `{ error }`, JWT with `sub` = user id and `role`.

---

## 1. Data model

### `requests` — one row per "Start a project" submission
| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | default `gen_random_uuid()` |
| `client_id` | uuid FK → `users.id`, not null | Always set from the token (`req.user.id`), never from the body. `ON DELETE CASCADE` for now (see "Deleting users") |
| `title` | text, not null | 3–120 chars, trimmed |
| `project_type` | text, not null + CHECK | `website`, `web_app`, `mobile_app`, `automation`, `ui_ux`, `maintenance`, `api`, `other`, `not_sure` |
| `description` | text, not null | 5–5,000 chars, trimmed |
| `budget_range` | text, not null + CHECK | `under_50k`, `50k_100k`, `100k_250k`, `above_250k`, `not_sure` (PHP) |
| `budget_php` | integer, nullable | 0 to 2,147,483,647 |
| `target_deadline` | date, nullable | today or later (Asia/Manila) on create |
| `reference_links` | text[], not null, default `{}` | at most 5, `http` or `https` only |
| `intake_answers` | jsonb, not null, default `{}` | an object, at most 10 KB |
| `status` | text, not null, default `submitted` + CHECK | see §2 |
| `admin_notes` | text, nullable | **admin only — never returned to clients** |
| `created_at` / `updated_at` | timestamptz, not null, default `now()` | |

Indexes: `(client_id, updated_at DESC)` for client lists; `(status, updated_at)` for admin queues.

Allowed values are repeated in the CHECK constraints (migration) and in `validations/request.validation.js`. Changing a list needs a new migration and a validation change.

### Deleting users
- `client_id` cascades today **only because no feature deletes users**: deleting a user row removes their requests and history.
- **Before any account deletion feature**, move to soft delete or anonymize, so that requests, quotes and payments survive.
- **No user delete endpoint until then.**

### `request_status_history` — the timeline / stepper dates
| Column | Type | Rules |
|---|---|---|
| `id` | uuid PK | |
| `request_id` | uuid FK → `requests.id`, not null | `ON DELETE CASCADE` |
| `from_status` | text, nullable | null for the first row (creation) |
| `to_status` | text, not null | |
| `note` | text, nullable | **visible to the client** (max 1,000 chars) |
| `created_by` | uuid FK → `users.id`, not null | Deferred check (at COMMIT). A user who wrote history on someone else's request cannot be deleted |
| `created_at` | timestamptz, not null, default `now()` | |

Index: `(request_id, created_at)`. A history row is written on create (`null → submitted` or `null → draft`), in the same transaction as the request. Every later status change must write one too.

---

## 2. Status workflow

Statuses: `draft`, `submitted`, `in_review`, `quoted`, `in_progress`, `completed`, `cancelled`, `declined`.

- A request starts as `submitted`, or as `draft` when created with `draft: true`. Submitting or editing a draft is **planned**.
- Status changes are **planned** (no endpoint changes a status yet).

| From | Client may move to (planned) | Admin may move to (planned) |
|---|---|---|
| `submitted` | `cancelled` | `in_review`, `declined` |
| `in_review` | `cancelled` | `quoted`, `declined` |
| `quoted` | — | `in_progress`, `declined` |
| `in_progress` | — | `completed` |
| `completed` / `cancelled` / `declined` | — | — (final) |

- Any other move → `409 { error: "Can't move a request from X to Y" }`.
- The admin transition table will live in one module, `utils/requestTransitions.js`.
- Status update and history row happen in **one database transaction**, with the row locked (`SELECT ... FOR UPDATE`).
- Quotes are by email for now: "Quoted" is only a status label; no amount is stored.

**`lastStep`** (in list and detail): the furthest step ever reached according to history. `submitted` 1, `in_review` 2, `quoted` 3, `in_progress` 4, `completed` 5, none (draft) 0.

---

## 3. Endpoints

All under `/api/v1`. All require a token.

### Client (built) — `requireRole('client')`, so an admin gets 403

#### `POST /requests` → `201 { request }`
Body: `{ title, projectType, description, budgetRange, budgetPhp?, targetDeadline?, referenceLinks?, intakeAnswers?, draft? }`
- Any other field → `400 Unknown field: <name>`.
- Text containing a null character or an unpaired surrogate → 400.
- `targetDeadline` is `YYYY-MM-DD`.

`request`: `{ id, title, projectType, description, budgetRange, budgetPhp, targetDeadline, referenceLinks, intakeAnswers, status, createdAt, updatedAt }`

#### `GET /requests?limit=&active=` → `200 { requests }`
- Only the caller's requests, newest update first.
- `limit`: whole number 1–50, default 20, otherwise `400 limit must be a whole number from 1 to 50`.
- `active`: `true` keeps `submitted`, `in_review`, `quoted`, `in_progress`; `false` (default) keeps all.
- Other query parameters are ignored. There is no paging yet.

Each item: `{ id, title, projectType, budgetRange, budgetPhp, targetDeadline, status, createdAt, updatedAt, lastStep }`

#### `GET /requests/:id` → `200 { request }`
- The create fields plus `lastStep` and `history` (oldest first): `{ id, fromStatus, toStatus, note, createdAt }`.
- Someone else's or missing → `404 Request not found`. Not a UUID → 400.

### Client (planned)
| Method | Path | Notes |
|---|---|---|
| PATCH | `/requests/:id/cancel` | Own request, only from `submitted` / `in_review`, else 409. |
| GET | `/dashboard/summary` | `{ counts, active, total, recentUpdates }` |

### Admin (planned) — `requireRole('admin')`, so a client gets 403
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/requests?status=&search=&sort=&page=&pageSize=` | All except drafts, with client `{ id, name, email }`. Returns `{ items, page, pageSize, total }`. `pageSize` default 20, max 50. `sort=newest` or `oldest`, by `updated_at`. |
| GET | `/admin/requests/:id` | Full detail including `adminNotes`, client contact, history with author. |
| PATCH | `/admin/requests/:id/status` | `{ status, note? }`, see §2. |
| PATCH | `/admin/requests/:id/notes` | `{ adminNotes }` (max 5,000). Writes no history and leaves `updated_at` unchanged. |
| GET | `/admin/dashboard/summary` | Counts by status, `newCount`, `dueThisWeek`. |
| GET | `/admin/activity?limit=` | Latest history rows across all requests. |

### Responses
- camelCase JSON.
- Client queries use column lists **without `admin_notes`** (same idea as `SAFE_COLUMNS` for passwords).
- Errors: `{ error }` with 400 (validation), 401, 403 (wrong role), 404 (not found / not yours), 409 (invalid transition, planned), 413 (body too large).

---

## 4. Code layout

```
backend/src/
├── config/db.js                  pool, query(), withTransaction()
├── db/migrations/                1795855247441_create-requests.js (both tables)
├── errors/ForbiddenError.js
├── middlewares/auth.middleware.js   requireAuth, requireRole
├── validations/request.validation.js
├── repositories/request.repository.js   all SQL for both tables
├── services/request.service.js
├── controllers/request.controller.js
└── routes/request.routes.js         mounted at /requests in routes/index.js
```

### `requireAuth` and `requireRole(role)`
- `requireAuth` sets `req.user = { id, role }` from the token.
- `requireRole` runs after it and compares the role **from the token**; it does not query the database.
- So a role change takes effect at the next login. With `JWT_EXPIRES_IN=1h`, a demoted admin keeps access for at most 1 hour.
- Tokens issued before roles were added have no role and get 403 until the user logs in again.
- Wrong or missing role → `403 { error: "Forbidden" }`. Not logged in → 401.

### `withTransaction(work)`
`BEGIN`, run `work(client)`, `COMMIT`. Any error → `ROLLBACK`. The connection is released either way. Queries inside must use the given client.

---

## 5. Security rules

- Ownership is enforced **in SQL**: `WHERE id = $1 AND client_id = $2`. Never fetch then compare in JS.
- Another client's request → **404**, not 403 (don't reveal it exists).
- `:id` validated as a UUID → 400 instead of a database error.
- All queries parameterized. Planned admin `search` uses `ILIKE $n` with escaped `%` / `_`.
- `admin_notes` never in any client response (tested).
- Register ignores `role` in the body; every new account is a `client`.
- Planned: rate limit `POST /requests` with the `express-rate-limit` work.
- Request body size stays limited (existing `express.json()` default).

---

## 6. Tests (Jest + supertest, `codehaus_test` database)

Built:
- `requests.test.js`: create, validation, list, `lastStep`, detail, ownership, roles, no `admin_notes`.
- `requests.enums.test.js`: every project type and budget range accepted; unknown rejected.
- `request.validation.test.js`: limit, cleaned body, refused text, UUID (no database).
- `request.service.test.js`: a failed history insert saves nothing; the connection is released.
- `auth.middleware.test.js`, `auth.login.test.js`: role in the token and `requireRole`.

Planned with the admin API: every allowed and blocked transition, two simultaneous changes, notes, admin list paging, filter and search, client-on-admin 403.

---

## 7. Build order

1. **Done:** schema, `requireRole`, client create, list, detail.
2. Admin list, detail, status change, notes.
3. Client cancel.
4. Dashboard summaries and admin activity.
5. Frontend (see `dashboard-design.md` §9).

## 8. Open decisions

None for the built endpoints.

## 9. Follow-ups

- **Auth validation accepts the null character and unpaired surrogates** in text fields. A null character cannot be stored by Postgres, so it should be a 400. Request validation already rejects both; fix `validations/auth.validation.js` in its own branch.
- **Frontend** (when it is connected to these endpoints): add labels for `api` and `not_sure`; `data/dashboardSample.js` uses `targetDate` (now `targetDeadline`), `below_50k` (now `under_50k`) and `page` / `total` on the client list (not returned).
