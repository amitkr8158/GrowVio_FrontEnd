# GrowVio — Complete Product Prompt

> A premium knowledge and book-learning platform. Tagline: **Read. Learn. Master.**
> Build as a polished, desktop-first SaaS product using the quality bar of Blinkist, Shortform, Duolingo, Notion, Stripe, Apple, Linear, Airbnb. Do not feel like a PDF library or generic LMS.

---

## 1. Product Vision

GrowVio turns every non-fiction book into a structured, multi-layer learning journey. Instead of a simple summary, each book is rebuilt into 10 graduated levels — from a 60-second snapshot to a fully narrated BookStory. The product serves four primary personas: **Learner**, **Creator**, **Admin**, and **Super Admin**.

The experience should feel premium, calm, and focused: white/off-white surfaces, deep navy text, purple/indigo primary actions, soft lavender secondary surfaces, generous whitespace, and sophisticated micro-interactions.

---

## 2. Tech Stack & Architecture

- **Framework:** TanStack Start v1 (React 19, full-stack, file-based routing, SSR/SSG, Vite 7).
- **Styling:** Tailwind CSS v4 via `src/styles.css` using native `@import` and `@theme` with OKLCH color tokens.
- **State:** React Query for server state, local React state for UI, `localStorage` for mock auth/plan persistence.
- **Components:** shadcn/ui primitives placed under `src/components/ui/`. Custom GrowVio components under `src/components/growvio/`.
- **Routing:** TanStack Router file-based routes under `src/routes/`. Root route at `src/routes/__root.tsx`.
- **Font:** Inter for body/ UI, Instrument Serif for editorial headings (`font-display`).
- **Icons:** Lucide React.
- **Data:** Mock data modules under `src/data/` and `src/lib/` for personalization, auth, and plan state.

**Constraints:**
- No `react-router-dom`, no Next.js-style pages, no legacy `entry-client.tsx`/`entry-server.tsx`.
- Load web fonts via `<link>` in root head, never `@import` in styles.css.
- Every route file must define `createFileRoute` and export `Route` with a `component`.
- Every parent layout route must render `<Outlet />`.
- Each leaf route must set its own `head()` with unique title, description, `og:title`, `og:description`, `og:type`, `twitter:card`.

---

## 3. Design System

### Color Palette (OKLCH)

- **Background:** off-white `oklch(0.995 0.003 285)`
- **Foreground:** deep navy `oklch(0.24 0.045 275)`
- **Card:** pure white `oklch(1 0 0)`
- **Primary:** purple/indigo `oklch(0.52 0.21 288)`
- **Primary Strong:** `oklch(0.43 0.2 288)` (hover state)
- **Primary Soft:** soft lavender `oklch(0.955 0.025 292)` (secondary surfaces)
- **Accent / Accent Foreground:** matching primary family
- **Muted:** `oklch(0.968 0.008 286)`
- **Muted Foreground:** `oklch(0.55 0.03 275)`
- **Success:** `oklch(0.62 0.15 155)`
- **Warning:** `oklch(0.78 0.15 76)`
- **Destructive:** `oklch(0.58 0.21 25)`
- **Pro:** warm amber `oklch(0.63 0.19 40)` with soft variant `oklch(0.96 0.035 55)`
- **Gradients:** Hero gradient `135deg` from primary to a softer magenta; Soft gradient `140deg` between lavender and off-white.
- **Shadows:** `shadow-card` for subtle elevation, `shadow-lift` for modals/drawers.

### Typography

- Body / UI: Inter, weights 400–700.
- Display / Editorial: Instrument Serif, italic allowed, tracking tight, line-height 1.08.
- Utility classes: `text-display` for editorial headings, `font-sans` for UI.

### Components & Surface Utilities

- `surface-card`: white card with 1px border, 1rem radius, `shadow-card`.
- `input-base`: 2.75rem height, rounded-xl, focus ring in primary 10%.
- `scroll-slim`: thin scrollbar using border color.
- Buttons: rounded-xl, primary solid, secondary outlined, ghost hover.
- Badges: small rounded pills for PRO, notifications, premium tiers.
- Progress bars: rounded-full, primary fill, used throughout the app.

---

## 4. User Roles & Navigation

The app uses a role-aware sidebar shell (`AppShell`). Each role has a distinct home and navigation groups.

### Roles

- **learner:** `Learner` — home `/dashboard`
- **creator:** `Creator Studio` — home `/creator`
- **admin:** `Admin Console` — home `/admin`
- **super:** `Super Admin` — home `/super-admin`

### Learner Navigation (`navByRole.learner`)

**Learn:**
- Home → `/dashboard`
- Explore Books → `/explore`
- My Library → `/library`
- Continue Reading → `/read/atomic-habits`

**Growth:**
- My Progress → `/progress`
- Achievements → `/achievements`
- My Notes → `/notes`
- Action Items → `/action-items`

**Account:**
- Go Premium → `/premium` (badge "8-10")
- Audio & Video → `/premium/audio`
- Get Pro → `/pro` (badge "PRO")
- Pro Workspace → `/pro/workspace`
- Plans & Pricing → `/pricing`
- Notifications → `/notifications` (badge "3")
- Settings → `/settings`

### Creator Navigation (`navByRole.creator`)

**Studio:** Dashboard, My Books, Book Workspace.

**7-Layer Sets:** Snapshot, Flashdeck, Infosummary, Deep Read, Mastery Test, Action Plan, Quick Recall.

**Assets:** Raw Files, Media Library, AI Assistant.

**Publishing:** Review & Publish, Version History, Analytics.

### Admin & Super Admin Consoles

Provide full console route trees with dashboard, analytics, books, users, creators, billing, transactions, discounts, reviews, security, audit, feature flags, integrations, backup, health, experiments.

Each console page should be interactive (searchable lists, inline editing where appropriate, stat cards, filters) rather than static placeholders.

---

## 5. Public Marketing Experience (Home at `/`)

Before any login, the root route `/` is a high-fidelity marketing landing page.

### Sections

- **Sticky header:** Logo, nav links (How it works, The 10 levels, Library, Pricing), Sign in / Start free CTAs, mobile hamburger menu.
- **Hero:** Left text — headline "Finish the book. Actually keep it.", subheadline about the 10-level journey, two CTAs (Start free / See the 10 levels), stats grid (10 levels, 15 min average, etc.). Right side — a visual mastery-path card for "Atomic Habits" showing the first 5 levels with progress.
- **How it works:** Three steps from discovery to daily habit.
- **The 10 levels:** Grid of all 10 levels with icons, names, minute estimates, and blurbs.
- **Library preview:** Grid of featured books with cover and blurb; link to sign up.
- **Testimonials:** 3-column grid of star-rated quotes with avatars.
- **FAQ:** Accordion with common questions.
- **CTA section:** Gradient hero banner with final sign-up CTA.
- **Footer:** Minimal brand footer.

Use `Cover` primitive for book covers, `marketingLevels`, `marketingTestimonials`, `marketingFaqs`, `marketingStats`, `marketingHowItWorks` from `src/data/marketing.ts`.

---

## 6. Authentication & Onboarding

### Auth Store (`src/lib/auth.ts`)

- `useAuth` hook with `user`, `ready`, `isAuthed`, `signIn`, `signUp`, `signOut`, `update`.
- Persist user to `localStorage` under `growvio:auth`.
- Sync across tabs via `storage` event and custom `growvio:auth-change` event.
- Mock auth API resolves against `src/data/accounts.ts`.
- Two demo accounts should exist: an existing onboarded user and a new user for testing both flows.

### Auth Screen (`/auth`)

- Toggle between Sign In and Sign Up via `?mode=` search param.
- Fields: full name (signup only), email, password, confirm password (signup only).
- Password visibility toggle.
- Validation and error messages.
- "One-click Demo" buttons to sign in as demo accounts instantly.
- On success, redirect to `/dashboard` if onboarded, otherwise `/onboarding`.

### Onboarding (`/onboarding`)

A 4-step wizard with a progress bar at the top.

1. **Goals:** Pick up to 3 goals (e.g., "Grow my career", "Build better habits", "Lead better", "Think clearer", "Improve health", "Invest smarter", "Build a business").
2. **Topics:** Select at least 3 topics (Productivity, Psychology, Business, Leadership, Finance, Health, Science, Philosophy, Creativity, Technology).
3. **Rhythm:**
   - Learning style: Visual, Audio, Text, Interactive.
   - Daily goal: 15, 30, 45, 60 min/day.
   - Starting level: Beginner, Regular, Advanced.
4. **First Book:** Pick from the featured library.

On completion, save `goals`, `topics`, `style`, `minutes`, `level`, `firstBook`, and `onboarded: true` to the user profile, then redirect to `/dashboard`.

### Route Guards

- `/dashboard` redirects to `/auth?mode=signin` if not authenticated.
- `/dashboard` redirects to `/onboarding` if authenticated but not onboarded.
- `/onboarding` redirects to `/auth?mode=signup` if not authenticated.

---

## 7. Learner Experience

### Dashboard (`/dashboard`)

- Greeting using the user's first name.
- **Continue reading hero:** The user's first book or Atomic Habits; cover, title, author, active level, progress bar, "Continue Learning" and "View mastery path" CTAs.
- **Personalized learning plan panel:** Built from onboarding data. Shows style label, minutes/day, weekly total, starting level, and a 5-day schedule mapping days to levels with minute estimates. Includes "Adjust preferences" link.
- **10-Level Mastery Path panel:** Shows levels 3–6 of the current book with `LevelRow` components.
- **Recommended for you:** 3 cards scored from onboarding goals/topics/level. Each card shows a "why" line explaining the match.
- **My library:** 4 book cards from the library.
- **Right sidebar:** Today's learning goal (uses user's chosen minutes), streak, XP, learner level, recent activity, achievements.

### Explore (`/explore`)

- Searchable book grid.
- Filters: category, difficulty, tier, trending, editor's pick.
- Each book card shows cover, title, author, rating, reading time, difficulty, tier badge, and a short blurb.
- Empty state and loading states.

### Book Detail (`/book/$slug`)

- Hero with cover, title, author, rating, reading time, difficulty, tier.
- Why read / outcomes list.
- Full 10-level mastery path displayed as `LevelRow` rows with locked/free/premium states.
- Level 5 (Mastery Test) links to `/test/$slug`.
- Level 4 (Deep Read) links to `/read/$slug`.
- CTA to add to library or start reading.

### Deep Read (`/read/$slug`)

- Native web reading experience, not a PDF viewer.
- Clean typography with chapter navigation.
- Dark mode toggle for reading comfort.
- AI sidebar for summaries, questions, key takeaways.
- Highlight-to-note and save-to-notes flow.
- Progress tracking within the chapter.

### Mastery Test (`/test/$slug`)

- Timed test intro screen.
- Five question types: single-choice, multi-select, true/false, ordering, fill-in-the-blank.
- Instant feedback with explanation after each question.
- Question navigator with status dots (answered / current / flagged).
- Results screen with three mastery bands:
  - **Retry:** < 60%
  - **Passed:** 60–84%
  - **Mastered:** 85%+
- XP rewards based on band.
- Scoring supports partial credit for multi-select and ordering.
- Data model in `src/data/mastery.ts`, scoring in `src/lib/mastery-scoring.ts`.

### Library (`/library`)

- Grid of books the user has added.
- Progress indicator per book.
- Sort by last accessed, progress, title.
- Empty state for new users.

### Progress (`/progress`)

- Weekly/monthly activity charts.
- Books completed, levels mastered, time spent.
- Skill breakdown by category.
- XP and streak history.

### Achievements (`/achievements`)

- Badge grid with locked/unlocked states.
- Progress bars for in-progress achievements.
- Categories: Streak, Mastery, Explorer, Creator.

### Notes (`/notes`)

- Searchable collection of learner highlights and reflections.
- Each note shows source book, highlighted text, user reflection, date.
- Add/edit/delete note inline.
- Filter by book or tag.

### Action Items (`/action-items`)

- Commitment tracker with priority levels (High/Medium/Low).
- Due dates, reminders, completion toggles.
- "Application rate" progress bar showing % of commitments completed.
- Empty state encouraging the user to create an action from a book.

### Notifications (`/notifications`)

- Unread/read states, badge counts.
- Types: achievement unlock, streak reminder, new content, billing.
- Mark all as read.

### Settings (`/settings`)

- Profile (name, email, avatar initials).
- Plan status and upgrade CTAs.
- Learning preferences (goals, topics, style, minutes, level) linked to onboarding.
- Notifications toggles.
- Danger zone: sign out.
- Fully interactive; changes update localStorage/auth state.

---

## 8. Premium & Pro Monetization

### Plan Tiers (`src/lib/plan.ts`)

- `FREE`: Levels 1–2, limited library.
- `STARTER`: Levels 1–6, more books.
- `PREMIUM`: Levels 1–10, audio/video content, offline saves.
- `PRO`: Private PDF library, RAG chat engine, 2× XP, creator tools.

`usePlan` hook manages current plan with `localStorage` persistence and helpers: `isPremium`, `isPro`, `hasAudioVideo`, `canAccessLevel`, `maxLevel`.

### Pricing Page (`/pricing`)

- Comparison table of all four tiers.
- Feature entitlement mapping per tier.
- Monthly/annual toggle.
- Highlighted recommended plan (Premium).
- CTA buttons that update plan state in localStorage.

### Premium Upsell (`/premium`)

- Hero with audio/video value propositions.
- "Ready to play" content queue.
- Feature cards: ListenBook, VideoBook, BookStory, Offline Mode.
- Social proof and guarantee.

### Premium Audio/Video Hub (`/premium/audio`)

- Members-only hub for ListenBook, VideoBook, and BookStory content.
- Progress bars for each piece.
- Offline save functionality.
- Filter by type, duration, completion.

### Pro Upsell (`/pro`)

- Premium hero with six feature pillars: Private PDF Library, AI RAG Chat, 2× XP Rewards, Advanced Analytics, Creator Studio, Priority Support.
- Plan comparison and testimonials.
- CTA to upgrade to Pro.

### Pro Workspace (`/pro/workspace`)

- Private PDF library with upload UI.
- RAG chat engine panel to ask questions against uploaded documents.
- 2× XP rewards indicator.
- Recent uploads, chat history, suggested queries.

---

## 9. Creator Studio

### Creator Dashboard (`/creator`)

- Stats overview: books, sets, views, completions, earnings.
- Recent activity, drafts, publish requests, quick actions.
- Entry points to the 7-layer editor and raw file management.

### 7-Layer Content Editor (`/creator/layers/$slug.$layer`, `/creator/layers/$slug.index`)

A unified, premium SaaS editor workspace.

**Editor Shell (`CreatorEditorShell`):**
- Sticky topbar with autosave status, undo/redo, title, preview toggle, publish actions.
- 7-layer progress navigator (Snapshot, Flashdeck, Infosummary, Deep Read, Mastery Test, Action Plan, Quick Recall).
- Three-panel workspace: Source panel (left), Editor canvas (center), Live Preview (right). Also support a vertical stacked layout (Source / Editor / Preview).

**Layer Navigator:**
- Shows all 7 layers with status, lock/free/premium states, and completion check.
- Click to navigate between layers.
- Visual indicator of current layer.

**Source Panel (`SourceUpload`, `SourceViewer`):**
- Upload raw files (PDF, EPUB, images, audio).
- Source file reference with thumbnail/filmstrip.
- Extracted text preview.
- Client-side PDF processing engine using `pdfjs-dist` to generate editable slide structures (`src/lib/pdf-to-slides.ts`).

**Editor Canvas:**
- PowerPoint-style slide sorter and canvas.
- `SlideSorter`: reorder slides, duplicate, delete, add new slide.
- `SourceFilmstrip`: drag/reference source pages into slides.
- `SlideEditorCanvas`: direct on-slide editing.
- Object manipulation engine (`src/components/growvio/slide-objects.tsx`) supporting shapes, text, images, grouping, alignment, z-order.
- Block-based schema for all 7 layers (`src/data/layers.ts`).
- AI command menu (`AICommandMenu`) for generating summaries, questions, flashcards, etc.
- Add menu (`AddMenu`) for inserting blocks, media, quizzes, actions.
- Structure list (`StructureList`) for document-style outline.

**Live Preview (`LivePreview`):**
- Device frames: Desktop, Tablet, Mobile.
- Renders the current layer as the learner would see it.
- Updates in real time as the creator edits.

**Layer Previews (`src/components/growvio/layer-previews.tsx`):**
- Flashdeck: carousel of idea cards.
- Infographics: visual frameworks/diagrams.
- Deep Read: book spread layout.
- Documents: structured long-form layout.
- Mastery Test: interactive quiz preview.

### Mastery Test Editor (`/creator/tests/$slug`)

- Dashboard listing all test sets for a book.
- Split-layout editor for a single test set.
- Left: question list with reordering, duplication, deletion.
- Right: question form with type selector, prompt, answers, explanations, scoring, tags.
- Preview mode to take the test as a learner.

### Raw Files (`/creator/raw-files`)

- Upload and manage source files (PDFs, images, audio) for each book.
- Thumbnail grid, file metadata, delete/replace.

### Media Library (`/creator/media`)

- Searchable image/audio/video asset library.
- Tags, filters, usage indicators.

### AI Assistant (`/creator/ai`)

- Prompt interface for AI-generated content suggestions.
- History of generated outputs.
- Actions to insert into the current layer.

### Publish (`/creator/publish`)

- Review all 7 layers and test sets before submission.
- Validation checklist.
- Submit for admin review.
- Version notes.

### Versions (`/creator/versions`)

- Version history timeline.
- Diff summary, restore previous version.

### Analytics (`/creator/analytics`)

- Book-level metrics: views, starts, completions, mastery test scores.
- Revenue/earnings estimates.
- Audience demographics.

### Book Workspace (`/creator/workspace`)

- Book-level project hub.
- Quick access to all layers, tests, assets, and publish status.

---

## 10. Admin & Super Admin Consoles

### Admin Console (`/admin/*`)

- Dashboard with platform KPIs.
- Analytics: usage, retention, revenue.
- Books: catalog, approval status, edit metadata.
- Publish Requests: review creator submissions, approve/reject with feedback.
- Reviews: moderate user reviews.
- Users: search, ban, change plan.
- Creators: onboarding, approval, payout info.
- Plans & Billing: tier configuration.
- Transactions: list with filters, refunds.
- Discount Codes: create, edit, deactivate promo codes.

### Super Admin Console (`/super-admin/*`)

- System Overview: health, traffic, infra status.
- Platform Analytics: advanced charts, cohorts.
- System Health: alerts, latencies, error rates.
- Roles & Permissions: manage role definitions.
- Feature Flags: toggle experiments.
- Integrations: third-party connectors.
- Security: policy overview, audit settings.
- Audit Logs: immutable activity log.
- Backup & Recovery: schedules, restore points.
- Experiments: A/B test configuration and results.

All console pages must be interactive: searchable/filterable tables, inline editing where appropriate, stat cards, empty states, and confirmation dialogs for destructive actions.

---

## 11. Data Model

### Book (`Book`)

- `id`, `slug`, `title`, `author`, `category`, `rating`, `reviews`, `readingTime`, `difficulty`, `tier`, `progress`, `cover` (gradient from/to + mark), `blurb`, `why[]`, `outcomes[]`, `levels[]`, `inLibrary`, `lastAccessed`, `trending`, `editorsPick`.

### Learning Level (`LearningLevel`)

- `id`, `number`, `name`, `description`, `format`, `duration`, `tier`, `status`, `progress`.
- The 10 levels:
  1. Snapshot — 1-page overview, 4 min, FREE.
  2. Flashdeck — 18 swipeable cards, 7 min, FREE.
  3. Infousummary — visual frameworks, 12 min, STARTER.
  4. Deep Read — 20-page summary, 38 min, STARTER.
  5. Mastery Test — 20 questions, 15 min, STARTER.
  6. Action Plan — 30-day workbook, 20 min, STARTER.
  7. Quick Recall — spaced repetition, 6 min, STARTER.
  8. BookReels — 5 short videos, 10 min, PREMIUM.
  9. ListenBook — studio audio, 22 min, PREMIUM.
  10. BookStory — narrative deep-dive, 35 min, PREMIUM.

### Auth User (`AuthUser`)

- `fullName`, `email`, `initials`, `plan`, `onboarded`, `goals[]`, `topics[]`, `style`, `minutes`, `level`, `firstBook`.

### Plan Tier (`PlanTier`)

- `"FREE" | "STARTER" | "PREMIUM" | "PRO"`.

### Mastery Test (`MasteryTest` / `Question`)

- `id`, `bookSlug`, `title`, `questions[]`.
- Question types: `single_choice`, `multi_select`, `true_false`, `ordering`, `fill_blank`.
- Each question has prompt, options, correct answer(s), explanation, points, difficulty, tags.

### Layer Content (`LayerContent`)

- Block-based schema: slides, blocks, rich text, media, quiz blocks, action blocks.
- Stored per book per layer in `src/data/layers.ts` and `src/lib/layer-store.ts`.

### Personalization Output

- `recommendBooks(user, limit)` returns `{ book, score, reason }`.
- `buildLearningPlan(user)` returns `{ book, days[], styleLabel, minutesPerDay, weekly, startLevel, focus[] }`.

---

## 12. Key Reusable Primitives

Place under `src/components/growvio/primitives.tsx`:

- `BookCard`: cover + metadata + progress + CTA.
- `Cover`: gradient book cover with mark, supports size variants.
- `LevelRow`: row in a 10-level list with status, progress, action.
- `Panel`: titled section card with optional action link.
- `Progress`: branded progress bar.
- `StatCard`: icon + value + label.
- `Badge`: tier/PRO/premium status badges.
- `EmptyState`: illustration + message + CTA.

---

## 13. Quality & Interaction Requirements

- **Desktop-first:** 1280px+ primary, responsive down to mobile.
- **Animations:** subtle transitions on hover, focus rings, page fades, progress bar motion.
- **Accessibility:** focus states, ARIA labels, semantic headings, keyboard-navigable forms.
- **Empty states:** every list should have a meaningful empty state.
- **Loading states:** skeletons or spinners for async actions.
- **No generic AI aesthetics:** reject default purple gradients on white, default Inter-only, interchangeable hero layouts.
- **Distinctive direction:** calm editorial premium, white/lavender/navy with purple accents.
- **Microcopy:** concise, encouraging, action-oriented. No lorem ipsum.
- **Mock persistence:** use `localStorage` for auth, plan, and onboarding so the demo feels real across reloads.

---

## 14. SEO & Metadata

- Every route has a unique `<title>` and `<meta name="description">`.
- `og:title`, `og:description`, `og:type`, `twitter:card` on every leaf route.
- Root route links Google Fonts and sets canonical-ish brand metadata.
- Use `createFileRoute` `head()` option; no `react-helmet-async`.

---

## 15. Build & Verify

- After implementation, run the dev build and verify:
  - All routes resolve without 404s.
  - Auth flow (sign up → onboarding → dashboard) works.
  - Plan upgrade updates UI badges and locked levels.
  - Creator editor loads and preview updates.
  - Mastery test scores correctly and shows feedback.
  - Console pages are interactive (search, inline edit, filters).

---

## 16. File Map Summary

- `src/styles.css` — design tokens, theme, utilities.
- `src/router.tsx` — TanStack Router setup.
- `src/routes/__root.tsx` — root shell, fonts, error boundary.
- `src/routes/index.tsx` — public marketing landing page.
- `src/routes/auth.tsx` — sign in / sign up.
- `src/routes/onboarding.tsx` — 4-step onboarding wizard.
- `src/routes/dashboard.tsx` — personalized learner dashboard.
- `src/routes/explore.tsx`, `library.tsx`, `book.$slug.tsx`, `read.$slug.tsx`, `test.$slug.tsx` — core learner routes.
- `src/routes/notes.tsx`, `action-items.tsx`, `progress.tsx`, `achievements.tsx`, `notifications.tsx`, `settings.tsx` — growth/account routes.
- `src/routes/pricing.tsx`, `premium.index.tsx`, `premium.audio.tsx`, `pro.index.tsx`, `pro.workspace.tsx` — monetization routes.
- `src/routes/creator/*` — creator studio routes.
- `src/routes/admin/*` — admin console routes.
- `src/routes/super-admin/*` — super admin console routes.
- `src/components/growvio/AppShell.tsx` — role-aware layout.
- `src/components/growvio/primitives.tsx` — reusable UI primitives.
- `src/components/growvio/creator/*` — creator editor components.
- `src/components/growvio/layer-previews.tsx` — layer preview renderers.
- `src/components/growvio/slide-objects.tsx` — canvas object engine.
- `src/components/growvio/ConsoleSections.tsx` — interactive console page helpers.
- `src/data/growvio.ts`, `accounts.ts`, `marketing.ts`, `mastery.ts`, `layers.ts`, `rawAssets.ts` — mock data.
- `src/lib/auth.ts`, `plan.ts`, `personalization.ts`, `mastery-scoring.ts`, `layer-store.ts`, `pdf-to-slides.ts`, `editor-history.ts` — logic.

---

**End of prompt.**
