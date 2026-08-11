// Route table + dispatcher for the local mock backend. Every endpoint the
// user app's services/*.ts call is registered here — see mocked-data/README.md
// for the full endpoint list this mirrors.
import { db, persist, toPublicUser, toPublicBook, getAuthUser, makeToken } from './store'
import { MOCK_GAMIFICATION_STATS, MOCK_LEADERBOARD } from './data/gamification'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>
type MockResult = { status: number; data: unknown }
interface Ctx {
  params: Record<string, string>
  query: Record<string, string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
  auth: AnyRecord | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
}
type Handler = (ctx: Ctx) => MockResult | Promise<MockResult>
interface Route { method: string; pattern: RegExp; paramNames: string[]; handler: Handler }

const routes: Route[] = []

function compile(path: string) {
  const paramNames: string[] = []
  const regexStr = '^' + path.replace(/:[A-Za-z_]+/g, (m) => {
    paramNames.push(m.slice(1))
    return '([^/]+)'
  }) + '/?$'
  return { pattern: new RegExp(regexStr), paramNames }
}

function on(method: string, path: string, handler: Handler) {
  const { pattern, paramNames } = compile(path)
  routes.push({ method, pattern, paramNames, handler })
}

function ok(data: unknown, status = 200): MockResult { return { status, data } }
function fail(status: number, message: string): MockResult { return { status, data: { message, success: false } } }
function requireAuth(ctx: Ctx): MockResult | null {
  return ctx.auth ? null : fail(401, 'Unauthorized (mock) — no/expired session token')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBody(data: any): AnyRecord {
  if (!data) return {}
  if (typeof data === 'string') { try { return JSON.parse(data) } catch { return {} } }
  return data // FormData or already an object
}

function parseQueryFromUrl(url: string): Record<string, string> {
  const qIndex = url.indexOf('?')
  if (qIndex === -1) return {}
  const result: Record<string, string> = {}
  new URLSearchParams(url.slice(qIndex + 1)).forEach((v, k) => { result[k] = v })
  return result
}

const PLAN_PRICE_PAISE: Record<string, number> = { STARTER: 14900, PREMIUM: 29900, PRO: 79900 }

// ══════════════════════════════════════════════════════════════════════════
// AUTH — authService.ts
// ══════════════════════════════════════════════════════════════════════════
on('POST', '/api/auth/signup', ({ body }) => {
  const email = String(body.email || '').toLowerCase()
  if (db.users.some((u) => u.email.toLowerCase() === email)) return fail(409, 'Email already registered')
  const id = Math.max(0, ...db.users.map((u) => u.id)) + 1
  const user = {
    id, name: body.name, email: body.email, password: body.password,
    role: 'USER', plan: 'FREE',
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(body.name || 'user')}`,
    bio: '', createdAt: new Date().toISOString(), favorites: [], shortlist: [],
  }
  db.users.push(user)
  persist()
  return ok({ token: makeToken(id), ...toPublicUser(user) }, 201)
})

on('POST', '/api/auth/login', ({ body }) => {
  const email = String(body.email || '').toLowerCase()
  const user = db.users.find((u) => u.email.toLowerCase() === email)
  if (!user || user.password !== body.password) return fail(401, 'Invalid email or password')
  return ok({ token: makeToken(user.id), ...toPublicUser(user) })
})

on('POST', '/api/auth/logout', () => ok({ success: true, message: 'Logged out (mock)' }))

on('GET', '/api/users/me', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  return ok(toPublicUser(ctx.auth as AnyRecord))
})

on('PUT', '/api/users/me', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  const auth = ctx.auth as AnyRecord
  auth.name = ctx.body.name ?? auth.name
  persist()
  return ok(toPublicUser(auth))
})

on('POST', '/api/auth/resend-verification', () => ok({ success: true, message: 'Verification email sent (mock)' }))
on('GET', '/api/auth/verify-email', () => ok({ success: true, message: 'Email verified (mock)' }))
on('POST', '/api/auth/forgot-password', () => ok({ success: true, message: 'Password reset email sent (mock)' }))
on('POST', '/api/auth/reset-password', () => ok({ success: true, message: 'Password has been reset (mock). Please log in.' }))

// ══════════════════════════════════════════════════════════════════════════
// BOOKS — bookService.ts  (order matters: literal routes before /:id wildcard)
// ══════════════════════════════════════════════════════════════════════════
on('GET', '/api/books', ({ query }) => {
  let list = db.books
  if (query.genre) list = list.filter((b) => b.genre.toLowerCase() === query.genre.toLowerCase())
  return ok(list.map(toPublicBook))
})

on('GET', '/api/books/popular', () => {
  const list = [...db.books].sort((a, b) => b.totalReads - a.totalReads).slice(0, 6)
  return ok(list.map(toPublicBook))
})

on('GET', '/api/books/search', ({ query }) => {
  const q = String(query.q || '').toLowerCase()
  const started = Date.now()
  const list = db.books.filter((b) =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.tags || []).some((t: string) => t.toLowerCase().includes(q)))
  return ok({ books: list.map(toPublicBook), totalHits: list.length, backend: 'mock', query: query.q || '', durationMs: Date.now() - started + 4 })
})

on('GET', '/api/books/slug/:slug', ({ params }) => {
  const book = db.books.find((b) => b.slug === params.slug)
  return book ? ok(toPublicBook(book)) : fail(404, 'Book not found')
})

on('GET', '/api/books/:bookId/level/:level', ({ params }) => {
  const book = db.books.find((b) => b.id === params.bookId)
  if (!book) return fail(404, 'Book not found')
  const content = book[`level${params.level}`]
  if (!content) return fail(404, `Level ${params.level} not found for this book`)
  return ok({ success: true, data: { level: Number(params.level), content } })
})

on('GET', '/api/books/:bookId/status', ({ params }) => {
  const book = db.books.find((b) => b.id === params.bookId)
  if (!book) return fail(404, 'Book not found')
  const levels: Record<string, string> = {}
  for (let i = 1; i <= 7; i++) levels[i] = book[`level${i}`] ? (i <= 3 ? 'PUBLISHED' : 'DRAFT') : 'NOT_STARTED'
  return ok({ bookId: book.id, status: book.status, levels })
})

on('GET', '/api/books/:id', ({ params }) => {
  const book = db.books.find((b) => b.id === params.id)
  return book ? ok(toPublicBook(book)) : fail(404, 'Book not found')
})

on('POST', '/api/books', ({ body }) => {
  const id = `bk_${1000 + db.books.length + 1}`
  const book = { id, slug: id, rating: 0, totalReads: 0, status: 'DRAFT', createdAt: new Date().toISOString(), ...body }
  db.books.push(book)
  persist()
  return ok(toPublicBook(book), 201)
})

on('PUT', '/api/books/:id', ({ params, body }) => {
  const idx = db.books.findIndex((b) => b.id === params.id)
  if (idx === -1) return fail(404, 'Book not found')
  db.books[idx] = { ...db.books[idx], ...body, updatedAt: new Date().toISOString() }
  persist()
  return ok(toPublicBook(db.books[idx]))
})

on('DELETE', '/api/books/:id', ({ params }) => {
  const idx = db.books.findIndex((b) => b.id === params.id)
  if (idx === -1) return fail(404, 'Book not found')
  db.books.splice(idx, 1)
  persist()
  return ok({ success: true, message: 'Book deleted (mock)' })
})

on('GET', '/api/admin/books/analytics', () => {
  const total = db.books.length
  const published = db.books.filter((b) => b.status === 'PUBLISHED').length
  const totalReads = db.books.reduce((sum, b) => sum + (b.totalReads || 0), 0)
  const avgRating = total ? db.books.reduce((sum, b) => sum + (b.rating || 0), 0) / total : 0
  const topBooks = [...db.books].sort((a, b) => b.totalReads - a.totalReads).slice(0, 5)
    .map((b) => ({ id: b.id, title: b.title, totalReads: b.totalReads }))
  return ok({ totalBooks: total, publishedBooks: published, draftBooks: total - published, totalReads, averageRating: Number(avgRating.toFixed(2)), topBooks })
})

// ══════════════════════════════════════════════════════════════════════════
// GAMIFICATION — gamificationService.ts
// ══════════════════════════════════════════════════════════════════════════
on('GET', '/api/gamification/stats/:userId', ({ params }) => {
  const stats = (MOCK_GAMIFICATION_STATS as AnyRecord)[params.userId]
  if (stats) return ok(stats)
  return ok({ userId: Number(params.userId), totalPoints: 0, weeklyPoints: 0, streakDays: 0, badges: [], userLevel: 1, nextLevelXP: 500, weeklyXP: 0, weeklyRank: 0, currentStreak: 0, weeklyGoalProgress: 0, level: 1, totalXP: 0 })
})

on('GET', '/api/gamification/leaderboard', ({ query }) => {
  const limit = Number(query.limit) || 10
  return ok((MOCK_LEADERBOARD as unknown as AnyRecord[]).slice(0, limit))
})

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS — notificationService.ts
// ══════════════════════════════════════════════════════════════════════════
on('GET', '/api/notifications/history/:userId', ({ params }) =>
  ok(db.notifications.filter((n) => String(n.userId) === params.userId)))

// ══════════════════════════════════════════════════════════════════════════
// PAYMENTS — paymentService.ts
// ══════════════════════════════════════════════════════════════════════════
on('POST', '/api/payments/create-order', ({ body }) => {
  const plan = body.plan || 'STARTER'
  const amountPaise = PLAN_PRICE_PAISE[plan] ?? 14900
  return ok({ razorpayOrderId: `order_mock_${Date.now()}`, keyId: 'rzp_test_mock', amountPaise, currency: 'INR', plan })
})

on('POST', '/api/payments/verify', (ctx) => {
  const url: string = ctx.config?.url || ''
  const planMatch = url.match(/[?&]plan=([^&]+)/)
  const plan = planMatch ? decodeURIComponent(planMatch[1]) : (ctx.body?.plan || 'STARTER')
  const sagaId = `saga_mock_${Date.now()}`
  db.sagas[sagaId] = { completed: true, plan }
  if (ctx.auth) { ctx.auth.plan = plan; persist() }
  return ok({ success: true, sagaId, completed: true, plan, message: 'Payment verified and plan activated (mock)' })
})

on('GET', '/api/payments/checkout/status/:sagaId', ({ params }) => {
  const saga = db.sagas[params.sagaId]
  return ok(saga
    ? { sagaId: params.sagaId, ...saga, status: 'PLAN_ACTIVATED' }
    : { sagaId: params.sagaId, completed: true, status: 'PLAN_ACTIVATED', plan: 'STARTER' })
})

// ══════════════════════════════════════════════════════════════════════════
// SOCIAL — socialService.ts
// ══════════════════════════════════════════════════════════════════════════
on('GET', '/api/social/books/:bookId/reviews', ({ params, query }) => {
  const page = Number(query.page ?? 0)
  const size = Number(query.size ?? 20)
  const list = db.reviews.filter((r) => r.bookId === params.bookId)
  return ok(list.slice(page * size, page * size + size))
})

on('POST', '/api/social/books/:bookId/reviews', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  const auth = ctx.auth as AnyRecord
  const review = { id: `rev_mock_${Date.now()}`, bookId: ctx.params.bookId, userId: auth.id, name: auth.name, rating: ctx.body.rating, text: ctx.body.text, helpfulCount: 0, createdAt: new Date().toISOString() }
  db.reviews.unshift(review)
  persist()
  return ok(review, 201)
})

on('GET', '/api/social/books/:bookId/rating', ({ params }) => {
  const list = db.reviews.filter((r) => r.bookId === params.bookId)
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0
  return ok({ averageRating: Number(avg.toFixed(1)), totalReviews: list.length })
})

on('POST', '/api/social/reviews/:reviewId/helpful', ({ params }) => {
  const review = db.reviews.find((r) => r.id === params.reviewId)
  if (!review) return fail(404, 'Review not found')
  review.helpfulCount += 1
  persist()
  return ok(review)
})

// ══════════════════════════════════════════════════════════════════════════
// USER — userService.ts
// ══════════════════════════════════════════════════════════════════════════
on('GET', '/api/users/history', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  return ok(db.readingHistory[String((ctx.auth as AnyRecord).id)] || [])
})

on('POST', '/api/users/books/:bookId/favorite', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  const auth = ctx.auth as AnyRecord
  const favs: string[] = auth.favorites || (auth.favorites = [])
  const i = favs.indexOf(ctx.params.bookId)
  const favorited = i === -1
  if (favorited) favs.push(ctx.params.bookId); else favs.splice(i, 1)
  persist()
  return ok({ success: true, bookId: ctx.params.bookId, favorited })
})

on('POST', '/api/users/books/:bookId/shortlist', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  const auth = ctx.auth as AnyRecord
  const list: string[] = auth.shortlist || (auth.shortlist = [])
  const i = list.indexOf(ctx.params.bookId)
  const shortlisted = i === -1
  if (shortlisted) list.push(ctx.params.bookId); else list.splice(i, 1)
  persist()
  return ok({ success: true, bookId: ctx.params.bookId, shortlisted })
})

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR']

on('GET', '/api/admin/users', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  if (!ADMIN_ROLES.includes((ctx.auth as AnyRecord).role)) return fail(403, 'Forbidden (mock) — admin role required')
  return ok(db.users.map(toPublicUser))
})

on('GET', '/api/admin/analytics/active-users', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  if (!ADMIN_ROLES.includes((ctx.auth as AnyRecord).role)) return fail(403, 'Forbidden (mock) — admin role required')
  return ok({ dailyActiveUsers: 2140, weeklyActiveUsers: 8930, monthlyActiveUsers: 21870, newSignupsToday: 6, totalUsers: db.users.length })
})

on('GET', '/api/users/notes', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  const auth = ctx.auth as AnyRecord
  const bookId = ctx.query.bookId
  return ok(db.notes.filter((n) => n.userId === auth.id && (!bookId || n.bookId === bookId)))
})

on('POST', '/api/users/notes', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  const auth = ctx.auth as AnyRecord
  const note = { id: `note_mock_${Date.now()}`, userId: auth.id, bookId: ctx.body.bookId, text: ctx.body.text, highlight: ctx.body.highlight, createdAt: new Date().toISOString() }
  db.notes.push(note)
  persist()
  return ok(note, 201)
})

on('DELETE', '/api/users/notes/:noteId', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  const idx = db.notes.findIndex((n) => n.id === ctx.params.noteId)
  if (idx !== -1) db.notes.splice(idx, 1)
  persist()
  return ok({ success: true, message: 'Note deleted (mock)' })
})

on('PUT', '/api/users/books/:bookId/workbook', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard
  return ok({ success: true, bookId: ctx.params.bookId, savedAt: new Date().toISOString() })
})

// ══════════════════════════════════════════════════════════════════════════
// AI — aiService.ts (talks to a separate summary-generation backend, not the gateway)
// ══════════════════════════════════════════════════════════════════════════
on('POST', '/ai/generate-summary', () =>
  ok({ success: true, message: 'Summary generation started (mock)', data: { bookId: `bk_mock_${Date.now()}`, jobId: `job_${Math.random().toString(36).slice(2, 10)}`, status: 'PROCESSING' } }))

on('POST', '/ai/generate-from-text', ({ body }) =>
  ok({ success: true, message: 'Summary generation started (mock)', data: { bookId: body.bookId || `bk_mock_${Date.now()}`, jobId: `job_${Math.random().toString(36).slice(2, 10)}`, status: 'QUEUED' } }))

// ══════════════════════════════════════════════════════════════════════════
// Dispatcher used by mockAdapter.ts
// ══════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dispatch(config: any): Promise<[number, unknown]> {
  const method = String(config.method || 'get').toUpperCase()
  const rawUrl: string = config.url || ''
  const urlPath = rawUrl.split('?')[0]
  const auth = getAuthUser(config)
  const body = parseBody(config.data)
  const query: Record<string, string> = { ...parseQueryFromUrl(rawUrl), ...(config.params || {}) }

  for (const route of routes) {
    if (route.method !== method) continue
    const match = route.pattern.exec(urlPath)
    if (!match) continue
    const params: Record<string, string> = {}
    route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]) })
    const result = await route.handler({ params, query, body, auth, config })
    return [result.status, result.data]
  }
  return [404, { message: `[Mock] No route registered for ${method} ${urlPath}`, success: false }]
}
