# frontend

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui | **Deploy:** Vercel

React SPA for GrowVio. All data fetching uses TanStack Query. Forms use React Hook Form + Zod. Animations use Framer Motion. All API calls go through `src/services/apiClient.ts` pointing at `ENV.gatewayUrl`. Auth state (JWT) is managed by `AuthContext` and stored in localStorage under key `auth_token`.

Key routes: `/` (landing) · `/login` · `/signup` · `/home` (dashboard, protected) · `/books/:id/level/:n` (pyramid reading, protected) · `/checkout` (Razorpay, protected) · `/leaderboard` · `/admin/**` (ADMIN role required)

**Run locally:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local: VITE_GATEWAY_URL=http://localhost:8080
npm install
npm run dev
# Opens at http://localhost:5173
```

**Build (required before every PR):**
```bash
npm run build
```

**E2E tests:**
```bash
npm run test:e2e          # against dev.growvio.in
npm run test:e2e:headed   # with visible browser
npm run test:e2e:local    # against localhost:5173
npm run test:e2e:report   # open HTML report
```

Full docs: [Notion — frontend](https://www.notion.so/3437bc2073ee811a82f8ff7fb8b25328)
