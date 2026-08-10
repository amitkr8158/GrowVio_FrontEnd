# GrowVio Frontend

Frontend split out of the [ai-book-summary-platform](https://github.com/amitkr8158/ai-book-summary-platform) monorepo on 2026-08-10, to be developed independently from the backend.

Gamified book-summary platform for Indian professionals 22-40. See each app's own README for setup.

## Apps

| App | Path | Stack | Port |
|---|---|---|---|
| User app | [`frontend/`](frontend/) | React 18 + TS + Vite + Tailwind + shadcn/ui | 3000 |
| Admin portal | [`admin/`](admin/) | React 18 + TS + Vite | 5174 |

## Backend

This repo has no backend code. It talks to the API Gateway from [GrowVio_Backend](https://github.com/amitkr8158/GrowVio_Backend) — see that repo to run the backend locally. Configure the gateway URL via:
- `frontend/.env.local` → `VITE_GATEWAY_URL`
- `admin/.env.development.local` → `VITE_API_URL` (Vite's `.env.[mode]` files outrank plain `.env.local` — see the comment in that file)

## Note on this split

This repo was created as a fresh-history copy (no git log carried over) of the `frontend/` and `admin/` directories as they stood at the time of the split. The original monorepo is untouched and remains the historical record for anything predating this split.
