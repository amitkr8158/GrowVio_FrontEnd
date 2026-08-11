# Mocked data — GrowVio

Two layers live here:

1. **Static reference JSON** (`user/*.json`, `admin/*.json`) — one file per API
   call, documenting method/endpoint/sample request/sample response. Useful for
   quickly looking up a shape without reading the service code.
2. **Live runtime mock backend** (`user/src/mocks/` and `admin/src/mocks/`
   in each app) — an in-browser fake backend that actually answers every
   `apiClient` request when mock mode is on, so the app runs **with no
   real backend at all**.

This README covers the runtime layer, since that's what makes local dev work
end-to-end.

## Turning it on/off

Controlled by a single env flag, `VITE_USE_MOCKS`:

| File | Value | Effect |
|---|---|---|
| `user/.env.local` | `VITE_USE_MOCKS=true` | user app uses mocks locally |
| `admin/.env.development.local` | `VITE_USE_MOCKS=true` | admin app uses mocks locally |
| `.env.dev` / `.env.staging` / `.env.preprod` / `.env.development` | unset (→ `false`) | real backend, unaffected |

Both `.env.local` / `.env.development.local` files are gitignored local
overrides — flip `VITE_USE_MOCKS=false` in them any time to point back at the
real local backend (`docker-compose`) instead, with no code changes needed.

When it's on, `apiClient` (user: `src/services/apiClient.ts`, admin:
`src/lib/apiClient.ts`) installs an [axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter)
that intercepts **every** request and answers it from `src/mocks/handlers.ts`
— nothing reaches the network. You'll see a console banner
(`Mock API mode is ON`) confirming it's active. The admin app's
`aiGenerationService.ts` also short-circuits (it calls Claude directly,
bypassing `apiClient`) and instead saves each book's pre-written level
content from the fixtures.

## Logging in

Seven seeded personas, one per plan/role tier. Passwords are **plaintext on
purpose** — this is mock/dev-only data, never real credentials. Full sheet in
[`CREDENTIALS.json`](./CREDENTIALS.json).

| Persona | Name | Email | Password | Role | Plan |
|---|---|---|---|---|---|
| Free user | Ananya Iyer | `free.user@growvio.dev` | `Free@123` | USER | FREE |
| Starter user | Karan Malhotra | `starter.user@growvio.dev` | `Starter@123` | USER | STARTER |
| Premium user | Priya Sharma | `premium.user@growvio.dev` | `Premium@123` | USER | PREMIUM |
| Pro user | Vikram Nair | `pro.user@growvio.dev` | `Pro@123` | USER | PRO |
| Content creator | Sneha Kapoor | `creator@growvio.dev` | `Creator@123` | CONTENT_CREATOR | PRO |
| Admin | Rahul Verma | `admin@growvio.dev` | `Admin@123` | ADMIN | PRO |
| Super admin | Meera Nair | `superadmin@growvio.dev` | `SuperAdmin@123` | SUPER_ADMIN | PRO |

Use these in the **user** app's login screen. In the standalone **admin**
app, `ADMIN`, `SUPER_ADMIN`, and `CONTENT_CREATOR` accounts can sign in —
see `ADMIN_PORTAL_ROLES` in `admin/src/components/ProtectedRoute.tsx` (and
the matching `requireAdmin()` in `admin/src/mocks/handlers.ts`). The
content-creator account is also usable from the user app's embedded
`/admin/*` pages, which allow `CONTENT_CREATOR` too (see `isAnyAdmin` in
`user/src/context/AuthContext.tsx`).

Each user already has realistic state seeded: favorites, shortlist, reading
history, notes, notifications, gamification stats/badges, and payment
history where relevant — so dashboards, leaderboards, and profile pages
aren't empty on first login.

## The 10 books

Ten books, ten different categories/plans, each with real (not lorem-ipsum)
content for **all 7 reading levels** (Key Points, Flashcards, Infographic,
Deep Dive, Quiz, Workbook, Cheat Sheet):

| Book | Author | Genre | Plan |
|---|---|---|---|
| Atomic Habits | James Clear | Self-Help | FREE |
| Deep Work | Cal Newport | Productivity | PREMIUM |
| The Psychology of Money | Morgan Housel | Finance | STARTER |
| Sapiens | Yuval Noah Harari | History | PREMIUM |
| Zero to One | Peter Thiel | Business/Startups | PRO |
| Ikigai | García & Miralles | Philosophy/Wellness | FREE |
| Thinking, Fast and Slow | Daniel Kahneman | Psychology | PREMIUM |
| The Lean Startup | Eric Ries | Business | STARTER |
| Rich Dad Poor Dad | Robert Kiyosaki | Finance | FREE |
| The 7 Habits of Highly Effective People | Stephen R. Covey | Leadership | PRO |

Source of truth: `user/src/mocks/data/books.ts` (and an identical copy in
`admin/src/mocks/data/books.ts` — the two apps don't share a build, so the
fixtures are duplicated, not imported cross-project).

## What's mocked

Every endpoint in every `user/src/services/*.ts` and
`admin/src/services/*.ts` file is registered as a route in
`src/mocks/handlers.ts` in the respective app — that file is the definitive,
up-to-date list (route table at the top, dispatcher at the bottom). Behavior
included:

- **Auth**: real signup/login/logout against the seeded users, JWT-shaped
  mock tokens (`mock-jwt.<userId>.<rand>`) that the existing auth
  interceptors/localStorage flow picks up completely unchanged.
- **Books**: list/search/CRUD/publish, including admin's level-by-level
  status, drafts, published versions, editor locks, schedules, and A/B tests
  — all backed by mutable in-memory state.
- **Social/Gamification/Payments/Notifications/Notes**: reviews (create +
  mark helpful), favorites/shortlist toggles, leaderboard, badges, a
  Razorpay-shaped mock checkout flow, notification history, notes CRUD.
- **Uploads**: file inputs are read with `URL.createObjectURL` so an
  uploaded cover/PDF actually previews in the UI during the session.

State persists to `localStorage` (`growvio_mock_state_v1` /
`growvio_admin_mock_state_v1`) so it survives page reloads. Reset to the
original seed anytime from the browser console:

```js
__growvioResetMocks()
```

## Regenerating

Both the static JSON docs and the runtime fixtures were generated by
one-off scripts (not checked into the repo, run manually via `node`). If you
add a new service method, add its route directly to the relevant
`src/mocks/handlers.ts` — that's now hand-maintained, not regenerated.
