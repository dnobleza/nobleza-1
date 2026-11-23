# Design Rules — Codehaus

These rules apply to every page and component in `frontend/`. Read with `PRODUCT.md`.
If a design choice isn't covered here, pick the quieter option.

Colors come from the CodeHaus style guide.

---

## 1. Color

### Palette (tokens)

| Token           | Hex       | Source                     | Role                                                 |
| --------------- | --------- | -------------------------- | ---------------------------------------------------- |
| `primary`       | `#2563EB` | Style guide: Primary       | Brand blue: main actions, links, focus               |
| `primary-hover` | `#1D4ED8` | Derived (one shade darker) | Hover/pressed state of primary                       |
| `primary-soft`  | `#DBEAFE` | Derived (light tint)       | Light blue background for badges/notices             |
| `accent`        | `#F59E0B` | Style guide: Secondary     | Brand orange: highlights only                        |
| `accent-soft`   | `#FEF3C7` | Derived (light tint)       | Light orange background for badges/notices           |
| `accent-strong` | `#C2410C` | Derived (AA-safe orange)   | Orange fill with white text. Auth pages only (see 8) |
| `accent-strong-hover` | `#9A3412` | Derived (one shade darker) | Hover/pressed state of accent-strong           |
| `primary-tint`  | `#EFF6FF` | Derived (light blue)       | Auth pages: page and brand panel gradient            |
| `primary-tint-strong` | `#DBEAFE` | Derived (light blue) | Auth pages: page gradient end                        |
| `primary-cloud` | `#BFDBFE` | Derived (light blue)       | Auth pages: brand panel gradient, clouds             |
| `primary-deep`  | `#1E40AF` | Derived (deep blue)        | Auth pages: deep wave (blends into `primary`)        |
| `navy`          | `#1E3A8A` | Derived (dark blue)        | Auth pages: tagline text                             |
| `ink`           | `#111111` | Style guide: Neutral 900   | Headings and main text                               |
| `muted`         | `#6B7280` | Style guide: Neutral 600   | Secondary text, hints, placeholders                  |
| `line`          | `#D1D5DB` | Style guide: Neutral 300   | Borders, dividers                                    |
| `surface-alt`   | `#F3F4F6` | Style guide: Neutral 100   | Section background, table stripes, inputs on cream   |
| `background`    | `#F9F6F1` | Style guide: Background    | Warm cream page background                           |
| `surface`       | `#FFFFFF` | —                          | Cards, panels, modals on top of the cream background |
| `success`       | `#22C55E` | Style guide: Success       | Success icons, fills, badges (not for small text)    |
| `success-text`  | `#15803D` | Derived (AA-safe)          | Success text on light backgrounds                    |
| `danger`        | `#DC2626` | Added (not in guide)       | Errors, destructive actions                          |
| `warning`       | `#B45309` | Added (AA-safe amber)      | Pending/attention status text                        |

### Where each color goes

**Blue (`primary`): "do this"**

- Primary buttons (Login, Submit request, Save)
- Text links
- Focus ring on every interactive element
- Active state of the current nav item
- Checkboxes, radios, toggles when on

**Orange (`accent`): "notice this" (use sparingly)**

- The swoosh/underline accent under a key heading
- "New" badges, request count bubbles
- Small highlights in illustrations or empty states
- At most **one** orange element per screen region

**Never**

- Orange (`accent`) for primary buttons with white text (fails contrast). Only `accent-strong` passes, and only on the auth pages (see section 8)
- Orange for errors (errors are always `danger` red)
- Blue and orange side by side at equal weight; blue leads, orange accents
- Gradients of any kind, except soft background gradients on marketing surfaces: the auth pages (section 8) and the landing page (section 9)
- More than one brand color on a single button or badge

**Neutrals: everything else**

- 90% of the UI is `ink`, `muted`, `line`, `background`, `surface`, `surface-alt`
- Page background is the warm `background` cream; cards and panels sit on it in white `surface`
- Headings `ink`, body `ink`, helper text `muted`
- Borders are always `line`, 1px

**Status colors**

| Status              | Color                                        | Example                                    |
| ------------------- | -------------------------------------------- | ------------------------------------------ |
| Error / destructive | `danger`                                     | "Invalid email or password", Delete button |
| Success / completed | `success` (icon/fill), `success-text` (text) | "Request submitted", status "Completed"    |
| Pending / attention | `warning`                                    | Status "Pending review"                    |
| Info / in progress  | `primary`                                    | Status "In progress"                       |

Status is never shown by color alone. Always pair it with text or an icon.

### Contrast (WCAG AA)

- Normal text: at least **4.5:1** against its background
- Large text (24px+, or 18.6px+ bold) and UI borders/icons: at least **3:1**
- White text on `primary` (#2563EB) passes (about 5.2:1).
- White text on `accent` (#F59E0B) does **not** (about 2.1:1). Use `ink` text on orange fills.
- `accent` and `success` are too light for small text on white or cream. Use them as fills, icons and badges; use `success-text` / `warning` for status words.
- Check new color pairs with a contrast checker before using them.

---

## 2. Typography

| Use                                             | Font                               | Weight  |
| ----------------------------------------------- | ---------------------------------- | ------- |
| Headings (h1–h3), logo text                     | Space Grotesk                      | 600–700 |
| Body, labels, buttons                           | System sans (or Space Grotesk 400) | 400–500 |
| Code, IDs, request numbers, small accent labels | JetBrains Mono                     | 400–500 |

**Type scale (from the style guide, size/line-height in px):**

| Style   | Size / line                         | Weight          | Use                                  |
| ------- | ----------------------------------- | --------------- | ------------------------------------ |
| H1      | 56 / 64                             | ExtraBold (800) | Marketing hero only                  |
| H2      | 40 / 48                             | Bold (700)      | Marketing section titles             |
| H3      | 28 / 36                             | SemiBold (600)  | App page titles                      |
| H4      | 20 / 28                             | SemiBold (600)  | Card and section headings in the app |
| Body    | 18 / 28 (check against source file) | Regular (400)   | Marketing body text                  |
| Small   | 16 / 24                             | Regular (400)   | App body text, inputs, buttons       |
| Caption | 14 / 20                             | Medium (500)    | Labels, helper text, table meta      |

Inside the logged-in app, the largest heading is H3. H1/H2 are for public marketing pages.

Hierarchy comes from weight and color (`ink` vs `muted`) before size.

---

## 3. Spacing and shape

- Spacing scale: **4, 8, 12, 16, 24, 32, 48** px (`1, 2, 3, 4, 6, 8, 12` in Tailwind). No other values.
- Related items: 8px apart. Groups: 24px. Sections: 48px.
- Border radius: **8px** (`rounded-lg`) for inputs, buttons, badges; **12px** (`rounded-xl`) for cards and panels. No other radii.
- Shadows: cards on the cream background get a soft `shadow-sm`. Menus, dropdowns and modals get `shadow-md`. Nothing heavier.
- Max content width: forms `max-w-sm`, text `max-w-prose`, pages `max-w-6xl`.

---

## 4. Animation

Motion explains what changed. It is never decoration.

### Timing

| Kind                         | Duration                    | Easing     |
| ---------------------------- | --------------------------- | ---------- |
| Hover, focus, color change   | 150ms                       | `ease-out` |
| Button press, toggle         | 100–150ms                   | `ease-out` |
| Dropdown, tooltip, menu open | 200ms                       | `ease-out` |
| Modal, drawer open           | 250ms                       | `ease-out` |
| Anything closing             | 150ms (faster than opening) | `ease-in`  |

Nothing longer than **300ms**.

### What animates

- **Buttons:** background color on hover (150ms); slight press `scale-[0.98]` on active
- **Inputs:** border/ring color on focus (150ms)
- **Dropdowns/menus:** fade + 4px slide down
- **Modals:** backdrop fade; panel fade + scale from 0.98 to 1
- **Toasts:** slide in from the edge + fade; auto-dismiss after 4s
- **Loading:** button shows a spinner and is disabled; lists show skeleton blocks with a soft pulse
- **Status changes:** color crossfade (150ms)

### What never animates

- Page load "hero" entrances, staggered card reveals on every visit
- Bounce, elastic, spring overshoot, wobble
- Infinite loops other than loading spinners/skeletons
- Text that types itself out
- Layout properties (width, height, top, left). Animate only `opacity` and `transform`.

### Reduced motion (required)

Respect the user's OS setting. With `prefers-reduced-motion: reduce`:

- Remove slides and scales; keep instant or opacity-only changes
- In Tailwind use `motion-safe:` for movement, e.g. `motion-safe:transition-transform`

---

## 5. Components

- Always reuse `Input`, `Button`, `Layout` (and future shared components). Never restyle them inline in a page.
- Every form shows: label above input, inline error under the field in `danger`, disabled + spinner submit button while loading.
- Every list/table has an **empty state** (`muted` text + one clear action) and a **loading state** (skeleton).
- Every interactive element has visible hover and focus states.

---

## 6. Mascot (Pilandok)

Pilandok, the mouse-deer in the black hoodie, is the official CodeHaus mascot. Poses: Welcome, Working, Celebrating.

- Use the mascot for **moments**, not decoration: empty states, onboarding/welcome, success after submitting a request, 404/error pages.
- At most **one** mascot per screen. Never on every card or feature tile. On the marketing landing page (section 9) the rule is **one mascot per viewport**: Working in the hero, Welcome in the final call-to-action.
- Never inside forms, tables or dense dashboards where people are working.
- Match the pose to the moment: Welcome (first login, empty state), Working (loading, in-progress), Celebrating (request submitted, project complete).
- Auth pages: one mascot in the brand panel (Login: Working, Register: Celebrating), hidden on mobile. It sits beside the form, never inside it.

---

## 7. Copy

- Plain, specific, friendly. Say what happens: "Submit request", not "Get started".
- Errors say what's wrong and how to fix it: "Password must be at least 8 characters."
- No hype words: seamless, unlock, supercharge, next-level, revolutionary.
- No emojis in headings, buttons, or labels.

---

## 8. Auth pages (/login, /register)

The sign-in and register screens are the first thing a client sees, so they get a branded split card. These exceptions apply to **these two pages only**. The rest of the app keeps sections 1 to 5.

- **Gradients:** allowed on the page background (`primary-tint` to `primary-tint-strong`) and on the brand panel (`primary-cloud` to `primary-tint`), plus the blue wave. Soft gradients are allowed on marketing surfaces only: these two pages and the landing page (section 9).
- **Shape:** the card is `rounded-3xl`; inputs are `rounded-xl`; buttons are `rounded-full`.
- **Heading:** 36px bold (larger than the H3 limit of 28px), centered.
- **Orange:** the wave, spark lines and swoosh in the brand panel may use `accent`. The Register button uses `accent-strong` (`#C2410C`) with white bold text (about 5.2:1, passes AA). Login keeps the blue `primary` button.
- **Brand panel:** `md` and up only. On mobile only a small logo shows above the form.
- **Decoration:** clouds, waves, sparks, plant and code window are inline SVG and `aria-hidden`.
- **Social sign-in:** buttons stay disabled with a "Coming soon" badge until the backend supports OAuth.
- **Labels:** inputs use visually hidden (`sr-only`) labels, linked with `htmlFor`/`id`. Placeholders repeat the label text.
- **No role picker.** Only clients register. The backend sets the role.

---

## 9. Marketing landing (/)

The public landing page is a marketing surface (visitor mode: persuade). These exceptions apply to **the landing page only** (and the auth pages where section 8 says so). The logged-in app keeps sections 1 to 5.

- **Gradients:** soft background gradients allowed on the hero (`primary-tint` to `primary-tint-strong`) and the call-to-action panel (`primary-deep` to `primary`). Never on text, buttons or cards.
- **Shape:** nav bar and buttons are `rounded-full`; cards are `rounded-2xl`; the call-to-action panel is `rounded-3xl`.
- **Orange buttons:** `accent-strong` fill with white bold text (about 5.2:1, passes AA). Light `accent` is decoration only (bars, sparks, waves, paw prints), never behind white text. The word "Growth" in the H1 uses `accent-strong` so it passes 3:1 for large text.
- **Spacing:** sections are about 96px apart on desktop (`py-24`) and 64px on mobile (`py-16`). This is the only place the 48px scale limit is exceeded.
- **Type:** H1 56/64 ExtraBold and H2 40/48 Bold on desktop; both step down on mobile.
- **Mascot:** one per viewport (Working in the hero, Welcome in the final call-to-action).
- **Copy:** the main button says "Start a project" and goes to `/register`. No invented client names, quotes, photos or metrics. Testimonials render only when real, permitted quotes exist.
- **Images:** all landing images are listed in `src/assets/landingAssets.js`. A missing image falls back to an icon or a branded placeholder.
- **Motion:** card hover lift (`-translate-y-1`, 150ms, `motion-safe:` only) and color transitions. Smooth anchor scrolling only when reduced motion is not requested. No entrance animations.
- **Decoration:** clouds, waves, blobs, sparks and paw prints are inline SVG and `aria-hidden`.
