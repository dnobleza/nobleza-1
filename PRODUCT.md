# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Clients:** Philippine SMB/SME owners who want a website or app built by Codehaus. They log in to request builds, follow their requests, and look at Codehaus's past work.
- **Admin (Codehaus):** the Codehaus team. They review incoming requests, change request status, and manage the portfolio shown to clients.

## Product Purpose

The Codehaus client portal. One place where a client asks Codehaus to build a website or app, sees where that request stands, and browses Codehaus's portfolio of projects and APIs. Success: clients submit clear requests and can always see status without asking; admin handles requests and keeps the portfolio current in one tool.

## Positioning

Portal run by the builder itself, for Philippine SMB/SME owners: request, tracking, and proof of past work in the same place as the build relationship. (Confirm exact differentiator with Dan; not stated beyond this.)

## Operating Context

- Clients: after login, submit a new website/app build request, track request status, view project details.
- Admin: review incoming requests, update status, manage portfolio entries (projects and APIs) shown to clients.
- Roles exist in the backend (users table with role, JWT auth). Auth routes exist; login page is a static form not yet wired.
- Desktop and mobile browsers.

## Capabilities and Constraints

- Web only: React + Vite (JavaScript, no TypeScript), Tailwind CSS 4. Backend Node + Express 5, PostgreSQL.
- Built feature by feature (vertical slices). Dashboard and auth are the first features; dashboard contents beyond the jobs above are undecided.
- Portfolio is browse-only for clients, managed by admin.
- Undecided: request form fields, status names and workflow, portfolio entry shape, notifications, payments/quotes (none confirmed).

## Brand Commitments

Binding, as stated by Dan:

- Name: **Codehaus** (also written CodeHaus in the logo). App name comes from `VITE_APP_NAME`.
- Logo: house roof with chimney over a "CH" monogram, orange swoosh underneath. Logo file: `frontend/src/assets/logo/logo.svg`. Favicon: `frontend/public/favicon.svg`.
- Colors: blue is primary, orange is accent. Color values are defined in DESIGN.md (primary #2563EB, accent #F59E0B).
- Fonts: Space Grotesk for headings, JetBrains Mono for accents and code.
- Avoid: gradients, glassmorphism, emoji in headings, generic SaaS hype copy.

## Evidence on Hand

- No real portfolio content, client testimonials, case studies, or metrics in the repo. Future work must not fabricate any.

## Product Principles

1. Status clarity first: a client should know where their request stands without asking.
2. Plain, honest copy for busy business owners; no hype.
3. One portal, two roles: client and admin see different things; never mix their tasks.
4. The portfolio is proof, shown only with real Codehaus work.
5. Build small and verified, slice by slice.

## Accessibility & Inclusion

WCAG AA required. Must work on desktop and mobile browsers. Audience is Philippine SMB/SME owners, who may not be technical.
