# Client Dashboard Design — CodeHaus Portal

Status: approved direction (2026-11-24). Follow this when building the logged-in app.
Read with `DESIGN.md` (tokens, typography, rules) and `PRODUCT.md` (audience, voice).

Visual targets (local only, gitignored):
- `docs/design/dashboard-sidebar-preview.png` — **the layout to follow**
- `docs/design/dashboard-sidebar-preview.html` — reference HTML/CSS for sizes and colors (rebuild as React + Tailwind, don't paste)
- `docs/design/dashboard-preview.png` — earlier top-navbar version, for comparison only

---

## 1. App shell (logged-in pages)

The public landing page keeps its top navbar. Every logged-in page uses this shell:

```
┌──────────────┬──────────────────────────────────────────────┐
│ Sidebar      │ Top bar: breadcrumb · bell · user menu        │
│ 260px        ├──────────────────────────────────────────────┤
│              │ Page content (max ~1180px, padding 24–32px)   │
└──────────────┴──────────────────────────────────────────────┘
```

- Page background: solid `surface-cool`, no gradient and no clouds, same as the landing page below the hero. Text straight on it uses only `ink`, `navy-deep`, `muted-strong` or `primary-deep`.
- Build it once as `AppLayout` (sidebar + top bar + `<Outlet />`), used by client and admin pages.

### Sidebar (client)
| Item | Notes |
|---|---|
| Logo | Links to `/` (landing page) |
| **Start a project** | accent-strong pill button, full width. The main action on every page |
| Group label "Menu" | small uppercase, muted |
| Dashboard | `/dashboard` |
| My requests | `/requests`, with a count badge of active requests (accent-soft background, warning text) |
| Updates | `/updates` — *later* (hide until built) |
| Group label "Account" | |
| Profile | `/profile` — *later* |
| Settings | `/settings` — *later* |
| "Need help?" card | soft blue card, short text, "Email us →" mailto link to codehausdevelopment@gmail.com |
| Log out | bottom, muted |

- Active item: `bg-primary-soft`, `text-primary-deep`, semibold, plus a 4px blue bar on the left edge. Set `aria-current="page"`.
- Only link to pages that exist. Unbuilt pages are hidden, not shown as dead links.
- Sidebar background: solid white (`surface`) with a `line-cool` right border and the neutral card shadow.
- Desktop (lg+) only: a toggle next to the logo collapses the sidebar to a 72px icon rail (logo mark, icons only; group labels, help card and text hidden). Icon-only controls keep an `aria-label` and show a tooltip. The choice is saved in `localStorage`; default is expanded. Width animates 200ms, motion-safe. The mobile drawer is always expanded.

### Top bar
- Left: breadcrumb (`Home / Dashboard`), current page in navy, semibold.
- Right: notification bell (orange dot when there are unread updates; `aria-label="Notifications"`), then the user menu (initials avatar on `primary-soft` + full name + chevron → Profile, Log out).

### Mobile (below lg / 1024px)
- Sidebar becomes a slide-in drawer opened by a hamburger in the top bar (useState, `aria-expanded`, Esc closes, focus returns to the button).
- "Start a project" stays reachable at the top of the drawer.
- Stats grid: 2 columns (md), 1 column (mobile). Stepper turns vertical.

---

## 2. Client dashboard (`/dashboard`) — top to bottom

The dashboard answers two questions: *What's happening with my projects?* and *What should I do next?* Most important content goes first.

| # | Section | Content |
|---|---|---|
| 1 | **Greeting card** | "Welcome back, {first name}" (H1, navy) + "Here's what's happening with your projects." Pilandok **Welcome** pose on the right (decorative, `alt=""`). This is the only mascot on the screen. |
| 2 | **Summary cards** (4) | Active projects (blue icon), In review (amber icon), Completed (green icon), Total requests (gray icon). Big number in the heading font, label in muted-strong. |
| 3 | **Featured project + stepper** | The most recently updated active request: title, type, submitted date, "View details →", the 5-step stepper, and the latest update note in a soft blue box. |
| 4 | **My requests** (left, ~62%) | Up to 5 rows: title, type, "updated …", mini progress bar + "Step X of 5", status badge. "View all" → `/requests`. |
| 5 | **Recent updates** (right, ~38%) | Vertical timeline of the latest 4–5 history entries: icon in a status-colored circle, the note or event text, request name, relative time. |

### Empty state (first-time client, no requests)
Replace sections 2–5 with one card: Pilandok Welcome pose, heading "Start your first project", one line ("Tell us what you need and we'll take it from there."), and a "Start a project" button. An empty dashboard is an invitation, not a blank page.

### Loading and errors
- Loading: skeleton blocks in the shape of the cards (soft pulse, motion-safe).
- Error: a danger-colored alert with the API's message and a "Try again" button. A 401 logs the user out and redirects to `/login` (already handled by the auth layer).

---

## 3. Stepper

Five steps, fixed order:

| Step | Status value | Label |
|---|---|---|
| 1 | `submitted` | Submitted |
| 2 | `in_review` | In review |
| 3 | `quoted` | Quoted |
| 4 | `in_progress` | In progress |
| 5 | `completed` | Completed |

Visual states:
- **Done:** solid `primary` circle with a white check; date under the label.
- **Current:** white circle, 3px `primary` border, soft blue halo; label in `primary`, semibold; "Since {date}".
- **To do:** white circle, gray border, gray number; "—" under the label.
- Connector line: gray, filled with `primary` up to the current step.

Data:
- Current step = position of the request's `status` in the table above.
- Dates = `created_at` of the `request_status_history` row where `to_status` = that step.
- `cancelled` / `declined` are **not steps**: the stepper stops at the last reached step, with a "Cancelled" (gray) or "Declined" (danger) label.

Accessibility: an ordered list (`<ol aria-label="Project progress">`), `aria-current="step"` on the current step. Mobile: vertical layout.

Mini progress (in lists): an 8px bar filled to (step ÷ 5), plus the text "Step X of 5"; green and "Done" when completed; no bar and "Stopped at step X" for cancelled/declined.

---

## 4. Status badges (use everywhere)

| Status | Background | Text |
|---|---|---|
| Submitted | `primary-soft` | `primary-deep` |
| In review | `accent-soft` | `warning` |
| Quoted | `accent-soft` | `accent-strong` |
| In progress | `primary-soft` | `primary-deep` |
| Completed | green tint (#DCFCE7) | `success-text` |
| Cancelled | gray tint (#F3F4F6) | gray-600 |
| Declined | white with `danger` border (a red tint fails WCAG AA) | `danger` |

Pill shape, 12px semibold text. Always text, never color alone. Build once as a `StatusBadge` component.

---

## 5. Data each section needs (backend contract)

| Section | Endpoint |
|---|---|
| Greeting name | `GET /api/v1/auth/me` (already exists) |
| Summary cards | `GET /api/v1/dashboard/summary` → counts by status |
| Featured project + stepper | `GET /api/v1/requests?limit=1&active=true` + `GET /api/v1/requests/:id` (includes history) |
| My requests | `GET /api/v1/requests?limit=5` |
| Recent updates | latest history entries across the client's requests (from summary, or `GET /api/v1/updates?limit=5` later) |
| Start a project | `POST /api/v1/requests` |

All client endpoints return only the logged-in client's data (`WHERE client_id = req.user.id`); another client's request is a 404. `admin_notes` is never sent to clients.

---

## 6. Card and visual rules (from DESIGN.md)

- Cards: solid white (`surface`), 1px `line-cool` border, `rounded-2xl`, soft neutral shadow `0 12px 32px -12px rgb(15 23 42/.28)` (`appCardClasses`).
- Headings: navy `#0B2A6B`, heading font. Body text `ink`, secondary text `muted-strong`.
- Orange buttons with white text use `accent-strong` only.
- Icon circles: blue (`primary-soft` / `primary-deep`), amber (`accent-soft` / `warning`), green, gray tints.
- Spacing from the scale; 24px between dashboard blocks.
- Motion: subtle only (150ms color/hover), nothing on page load.

---

## 7. Open decisions (confirm before building the backend)

1. Project types: website, web app, mobile app, automation, UI/UX, maintenance, other?
2. Budget ranges (PHP): below ₱50k, ₱50k–100k, ₱100k–250k, above ₱250k, not sure?
3. Quotes: by email for now ("Quoted" is only a status label), or in-portal accept/decline later?

## 8. Admin dashboard (`/admin`) — Dan only

Visual target (local only): `docs/design/admin-dashboard-preview.png` / `.html`.

Same `AppLayout` as the client app (sidebar + top bar + `surface-cool` background). Only users with `role = 'admin'` can open `/admin/*`; the backend enforces this with `requireRole('admin')`, the frontend route guard is only for UX.

The admin's questions are: *What's new?* and *What's stuck?*

### Sidebar (admin)
| Item | Notes |
|---|---|
| Logo | Links to `/` |
| Group label "Admin" | |
| Overview | `/admin` (this page) |
| Requests | `/admin/requests`, badge "N new" (count of `submitted`) |
| Clients | `/admin/clients` — *later* |
| Activity | `/admin/activity` — *later* |
| Group label "Site" | |
| View landing page | `/` |
| Settings | *later* |
| Log out | bottom |

No "Start a project" button here: admins manage requests, they don't create them.
Top bar: breadcrumb `Admin / Overview`, bell, user menu with an "Admin" pill next to the name.

### Overview page — top to bottom
| # | Section | Content |
|---|---|---|
| 1 | **Greeting card** | "Good morning/afternoon/evening, {name}" + a one-line summary built from real counts ("3 new requests are waiting for review. 1 project is due this week."). Button "Review new requests" (accent-strong) → `/admin/requests?status=submitted`. No mascot on admin pages. |
| 2 | **Pipeline** | 5 cards in order: Submitted, In review, Quoted, In progress, Completed. Big number + colored dot + label. The Submitted card gets an accent-strong border and a "Needs you" tag when its count is above 0. Each card links to the filtered requests list. Cancelled/declined are not shown here. |
| 3 | **New requests** (left, ~62%) | The oldest-first list of `submitted` requests (max 5): title, client name · type · budget · age. Buttons: "View" (ghost) and "Start review" (primary blue) — "Start review" moves it to `in_review` and opens the request. |
| 4 | **Recent activity** (right, ~38%) | Latest 5 events across all clients (submitted, status changed, cancelled, completed) from `request_status_history`, with status-colored icons and relative time. |
| 5 | **All requests table** | Columns: Request, Client (initials avatar + name), Type, Budget, Status badge, Updated, "Manage". Search (client name or title) + status filter chips (All, Submitted, In progress, Completed, …). Paginated (20 per page). |

### Manage request (`/admin/requests/:id`)
- Header: title, client name + email, type, budget, target date, submitted date.
- The same stepper as the client sees.
- **Change status** panel: a select showing only the valid next statuses (from the workflow), a "Note to client" textarea (visible to the client in their updates), and a "Save" button. The backend validates the transition and writes the history row in one transaction.
- **Private notes** panel: `admin_notes`, clearly labeled "Only you can see this", with its own save.
- Full history timeline below.

### Admin empty states
- No new requests: "You're all caught up" in the New requests card (muted text, no button).
- No requests at all: the table shows one line, "No requests yet. They'll appear here when clients submit them."

### Data (backend contract)
| Section | Endpoint |
|---|---|
| Greeting + pipeline | `GET /api/v1/admin/dashboard/summary` → counts by status, due this week |
| New requests | `GET /api/v1/admin/requests?status=submitted&sort=oldest&limit=5` |
| Recent activity | `GET /api/v1/admin/activity?limit=5` (history across all requests) |
| All requests | `GET /api/v1/admin/requests?search=&status=&page=` |
| Manage request | `GET /api/v1/admin/requests/:id`, `PATCH .../status` `{ status, note }`, `PATCH .../notes` |

Admin responses may include `admin_notes` and client contact info; client responses never do.

---

## 9. Build order

1. Backend: migrations + `requireRole` → client endpoints → admin endpoints → summaries/activity (each with tests, including cross-account 404 and client-on-admin 403).
2. Frontend: `AppLayout` (sidebar, top bar, mobile drawer) + `StatusBadge` + `Stepper`.
3. Client dashboard, then the "Start a project" form, then request details.
4. Admin overview, then the requests table and Manage page.
