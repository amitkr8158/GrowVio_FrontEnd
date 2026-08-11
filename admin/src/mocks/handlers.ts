// Route table + dispatcher for the local mock backend. Every endpoint the
// admin's services/*.ts call is registered here — see mocked-data/README.md
// for the full endpoint list this mirrors.
import { db, persist, toPublicUser, toAdminBook, getAuthUser, makeToken } from './store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
type MockResult = { status: number; data: unknown };
interface Ctx {
  params: Record<string, string>;
  query: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  auth: AnyRecord | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}
type Handler = (ctx: Ctx) => MockResult | Promise<MockResult>;
interface Route { method: string; pattern: RegExp; paramNames: string[]; handler: Handler }

const routes: Route[] = [];

function compile(path: string) {
  const paramNames: string[] = [];
  const regexStr = '^' + path.replace(/:[A-Za-z_]+/g, (m) => {
    paramNames.push(m.slice(1));
    return '([^/]+)';
  }) + '/?$';
  return { pattern: new RegExp(regexStr), paramNames };
}

function on(method: string, path: string, handler: Handler) {
  const { pattern, paramNames } = compile(path);
  routes.push({ method, pattern, paramNames, handler });
}

function ok(data: unknown, status = 200): MockResult { return { status, data }; }
function fail(status: number, message: string): MockResult { return { status, data: { message, success: false } }; }
function requireAuth(ctx: Ctx): MockResult | null {
  return ctx.auth ? null : fail(401, 'Unauthorized (mock) — no/expired session token');
}
function requireAdmin(ctx: Ctx): MockResult | null {
  const guard = requireAuth(ctx);
  if (guard) return guard;
  const role = (ctx.auth as AnyRecord).role;
  if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'].includes(role)) return fail(403, 'Forbidden (mock) — admin role required');
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBody(data: any): AnyRecord {
  if (!data) return {};
  if (typeof data === 'string') { try { return JSON.parse(data); } catch { return {}; } }
  return data; // FormData or already an object
}

function parseQueryFromUrl(url: string): Record<string, string> {
  const qIndex = url.indexOf('?');
  if (qIndex === -1) return {};
  const result: Record<string, string> = {};
  new URLSearchParams(url.slice(qIndex + 1)).forEach((v, k) => { result[k] = v; });
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fileUrl(form: any): string {
  try {
    const file = form?.get?.('file');
    if (file && typeof URL !== 'undefined' && URL.createObjectURL) return URL.createObjectURL(file);
  } catch {
    // not a browser File / FormData — fall through to a placeholder
  }
  return 'https://cdn.growvio.app/mock/placeholder.png';
}

function findBook(bookId: string) {
  return db.books.find((b) => b.id === bookId);
}

function levelEntry(bookId: string, level: number) {
  return (db.levelStatus[bookId] || []).find((l) => l.level === level);
}

// ══════════════════════════════════════════════════════════════════════════
// AUTH — services/authService.ts
// ══════════════════════════════════════════════════════════════════════════
on('POST', '/api/auth/login', ({ body }) => {
  const email = String(body.email || '').toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === email);
  if (!user || user.password !== body.password) return fail(401, 'Invalid email or password');
  if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'].includes(user.role)) {
    return fail(403, 'This account does not have access to the admin portal.');
  }
  return ok({ token: makeToken(user.id), user: toPublicUser(user) });
});

on('GET', '/api/auth/me', (ctx) => {
  const guard = requireAuth(ctx); if (guard) return guard;
  return ok(toPublicUser(ctx.auth as AnyRecord));
});

// ══════════════════════════════════════════════════════════════════════════
// BOOKS — services/bookService.ts
// ══════════════════════════════════════════════════════════════════════════
on('GET', '/api/admin/books', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const { status = 'ALL', page = '0', size = '20' } = ctx.query;
  let list = db.books;
  if (status && status !== 'ALL') list = list.filter((b) => b.status === status);
  const p = Number(page); const s = Number(size);
  const paged = list.slice(p * s, p * s + s);
  return ok({ books: paged.map(toAdminBook), total: list.length, page: p });
});

on('GET', '/api/admin/books/:bookId', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const book = findBook(ctx.params.bookId);
  return book ? ok(toAdminBook(book)) : fail(404, 'Book not found');
});

on('POST', '/api/admin/books', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const id = `bk_${1000 + db.books.length + 1}`;
  const book = { id, slug: id, rating: 0, totalReads: 0, status: 'DRAFT', createdAt: new Date().toISOString(), ...ctx.body };
  db.books.push(book);
  db.levelStatus[id] = [1, 2, 3, 4, 5, 6, 7].map((level) => ({
    level, name: ['Key Points', 'Flashcards', 'Infographic', 'Deep Dive', 'Quiz', 'Workbook', 'Cheat Sheet'][level - 1],
    status: 'NOT_STARTED', requiredPlan: level <= 3 ? 'FREE' : 'STARTER',
  }));
  persist();
  return ok(toAdminBook(book), 201);
});

on('PUT', '/api/admin/books/:bookId', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const idx = db.books.findIndex((b) => b.id === ctx.params.bookId);
  if (idx === -1) return fail(404, 'Book not found');
  db.books[idx] = { ...db.books[idx], ...ctx.body, updatedAt: new Date().toISOString() };
  persist();
  return ok(toAdminBook(db.books[idx]));
});

on('DELETE', '/api/admin/books/:bookId', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const idx = db.books.findIndex((b) => b.id === ctx.params.bookId);
  if (idx === -1) return fail(404, 'Book not found');
  db.books.splice(idx, 1);
  delete db.levelStatus[ctx.params.bookId];
  persist();
  return ok(null);
});

on('POST', '/api/admin/books/:bookId/publish', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const book = findBook(ctx.params.bookId);
  if (!book) return fail(404, 'Book not found');
  book.status = 'PUBLISHED';
  persist();
  return ok({ success: true, bookId: book.id, status: 'PUBLISHED' });
});

on('POST', '/api/admin/books/:bookId/unpublish', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const book = findBook(ctx.params.bookId);
  if (!book) return fail(404, 'Book not found');
  book.status = 'DRAFT';
  persist();
  return ok({ success: true, bookId: book.id, status: 'DRAFT' });
});

// ══════════════════════════════════════════════════════════════════════════
// CONTENT — services/contentService.ts
// ══════════════════════════════════════════════════════════════════════════
on('GET', '/api/admin/books/:bookId/levels', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  return ok({ bookId: ctx.params.bookId, levels: db.levelStatus[ctx.params.bookId] || [] });
});

on('GET', '/api/admin/books/:bookId/levels/:level', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const book = findBook(ctx.params.bookId);
  const entry = levelEntry(ctx.params.bookId, Number(ctx.params.level));
  if (!book || !entry) return fail(404, 'Level not found');
  return ok({ level: entry.level, status: entry.status, requiredPlan: entry.requiredPlan, content: book[`level${entry.level}`], updatedAt: book.updatedAt || book.createdAt });
});

on('PUT', '/api/admin/books/:bookId/levels/:level', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const book = findBook(ctx.params.bookId);
  const entry = levelEntry(ctx.params.bookId, Number(ctx.params.level));
  if (!book || !entry) return fail(404, 'Level not found');
  book[`level${entry.level}`] = ctx.body.content;
  entry.status = ctx.body.status || entry.status;
  entry.requiredPlan = ctx.body.requiredPlan || entry.requiredPlan;
  book.updatedAt = new Date().toISOString();
  const vKey = `${ctx.params.bookId}:${entry.level}`;
  db.versions[vKey] = db.versions[vKey] || { draftVersion: 0, publishedVersion: 0 };
  db.versions[vKey].draftVersion += 1;
  persist();
  return ok({ success: true, level: entry.level, status: entry.status, updatedAt: book.updatedAt });
});

on('POST', '/api/admin/books/:bookId/levels/:level/publish', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const entry = levelEntry(ctx.params.bookId, Number(ctx.params.level));
  if (!entry) return fail(404, 'Level not found');
  entry.status = 'PUBLISHED';
  persist();
  return ok({ success: true, level: entry.level, status: 'PUBLISHED' });
});

on('POST', '/api/admin/books/:bookId/levels/:level/unpublish', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const entry = levelEntry(ctx.params.bookId, Number(ctx.params.level));
  if (!entry) return fail(404, 'Level not found');
  entry.status = 'DRAFT';
  persist();
  return ok({ success: true, level: entry.level, status: 'DRAFT' });
});

on('GET', '/api/admin/books/:bookId/levels/:level/ai-draft', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const book = findBook(ctx.params.bookId);
  if (!book) return fail(404, 'Book not found');
  const content = book[`level${ctx.params.level}`];
  const blocks = content?.richText
    ? [{ type: 'markdown', text: content.richText }]
    : [{ type: 'heading', text: book.title }, { type: 'paragraph', text: JSON.stringify(content).slice(0, 800) }];
  return ok({ blocks, generatedAt: new Date().toISOString() });
});

on('PUT', '/api/admin/books/:bookId/levels/:level/draft', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.level}`;
  db.drafts[key] = ctx.body;
  db.versions[key] = db.versions[key] || { draftVersion: 0, publishedVersion: 0 };
  db.versions[key].draftVersion += 1;
  persist();
  return ok({ success: true, savedAt: new Date().toISOString(), version: db.versions[key].draftVersion });
});

on('POST', '/api/admin/books/:bookId/levels/:level/publish-final', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.level}`;
  db.published[key] = { blocks: ctx.body, publishedAt: new Date().toISOString() };
  db.versions[key] = db.versions[key] || { draftVersion: 0, publishedVersion: 0 };
  db.versions[key].publishedVersion += 1;
  const entry = levelEntry(ctx.params.bookId, Number(ctx.params.level));
  if (entry) entry.status = 'PUBLISHED';
  persist();
  return ok({ success: true, level: Number(ctx.params.level), status: 'PUBLISHED', version: db.versions[key].publishedVersion, publishedAt: db.published[key].publishedAt });
});

on('GET', '/api/admin/books/:bookId/levels/:level/published', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.level}`;
  const entry = db.published[key];
  if (!entry) return fail(404, 'No published version yet');
  return ok({ version: db.versions[key]?.publishedVersion ?? 1, blocks: entry.blocks, publishedAt: entry.publishedAt });
});

on('POST', '/api/admin/books/:bookId/levels/:level/rollback', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  return ok({ success: true, level: Number(ctx.params.level), currentVersion: ctx.body.toVersion, rolledBackAt: new Date().toISOString() });
});

on('GET', '/api/admin/books/:bookId/supporting-docs', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  return ok(db.supportingDocs[ctx.params.bookId] || []);
});

on('GET', '/api/admin/books/:bookId/levels/:level/version-status', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.level}`;
  const v = db.versions[key] || { draftVersion: 0, publishedVersion: 0 };
  return ok({ draftVersion: v.draftVersion, publishedVersion: v.publishedVersion, hasUnpublishedChanges: v.draftVersion > v.publishedVersion });
});

on('GET', '/api/admin/books/:bookId/levels/:level/preview', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  return ok({ previewUrl: `https://app.growvio.app/preview/${ctx.params.bookId}/level/${ctx.params.level}?token=pv_mock_${Date.now()}`, expiresAt: new Date(Date.now() + 86400000).toISOString() });
});

on('GET', '/api/admin/analytics/content-costs', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;

  // Shape matches ContentCostData in pages/ContentCostsPage.tsx.
  const costByLevel: Record<number, number> = {
    1: 8.40, 2: 14.85, 3: 6.20, 4: 42.30, 5: 38.10, 6: 19.75, 7: 11.92,
  };
  const totalCostUsd = Object.values(costByLevel).reduce((sum, v) => sum + v, 0);
  const costByModel = {
    'claude-sonnet-4-5-20250929': Number((totalCostUsd * 0.795).toFixed(2)),
    'claude-haiku-4-5-20251001': Number((totalCostUsd * 0.205).toFixed(2)),
  };

  const booksGenerated = db.books.length;
  const levelsGenerated = Object.values(db.levelStatus)
    .reduce((sum, levels) => sum + levels.filter((l: AnyRecord) => l.status === 'PUBLISHED').length, 0);

  const MODELS = Object.keys(costByModel);
  const recentGenerations = db.books.slice(0, 6).flatMap((b, i) => {
    const levels = db.levelStatus[b.id] || [];
    const lvl = levels[i % levels.length];
    if (!lvl) return [];
    return [{
      bookId: b.id,
      levelNumber: lvl.level,
      model: MODELS[i % MODELS.length],
      costUsd: Number((1.2 + i * 0.85).toFixed(4)),
      generatedAt: new Date(Date.now() - i * 86400000).toISOString(),
      generatedBy: 'admin@growvio.dev',
      success: true,
    }];
  });

  return ok({
    totalCostUsd: Number(totalCostUsd.toFixed(2)),
    thisMonthCostUsd: Number((totalCostUsd * 0.33).toFixed(2)),
    booksGenerated,
    levelsGenerated,
    avgCostPerBook: Number((totalCostUsd / Math.max(booksGenerated, 1)).toFixed(4)),
    avgCostPerLevel: Number((totalCostUsd / Math.max(levelsGenerated, 1)).toFixed(4)),
    costByLevel,
    costByModel,
    recentGenerations,
  });
});

on('POST', '/api/admin/books/:bookId/levels/:levelNumber/editor-lock', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.levelNumber}`;
  const lock = { sessionId: `sess_mock_${Date.now()}`, lockedBy: (ctx.auth as AnyRecord).email, expiresAt: new Date(Date.now() + 10 * 60000).toISOString() };
  db.editorLocks[key] = lock;
  persist();
  return ok(lock);
});

on('DELETE', '/api/admin/books/:bookId/levels/:levelNumber/editor-lock', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.levelNumber}`;
  if (db.editorLocks[key]?.sessionId === ctx.body?.sessionId) delete db.editorLocks[key];
  persist();
  return ok(null);
});

on('PUT', '/api/admin/books/:bookId/levels/:levelNumber/editor-lock/heartbeat', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.levelNumber}`;
  const lock = db.editorLocks[key];
  if (!lock || lock.sessionId !== ctx.body?.sessionId) return fail(409, 'Lock expired or held by someone else (mock)');
  lock.expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
  persist();
  return ok({ expiresAt: lock.expiresAt });
});

on('GET', '/api/admin/books/:bookId/editor-status', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const prefix = `${ctx.params.bookId}:`;
  const result: Record<string, AnyRecord> = {};
  for (const [key, lock] of Object.entries(db.editorLocks)) {
    if (key.startsWith(prefix)) result[key.slice(prefix.length)] = { lockedBy: lock.lockedBy, expiresAt: lock.expiresAt };
  }
  return ok(result);
});

on('POST', '/api/admin/books/:bookId/levels/:levelNumber/schedule', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.levelNumber}`;
  db.schedules[key] = { scheduledAt: ctx.body.scheduledAt };
  persist();
  return ok({ success: true, level: Number(ctx.params.levelNumber), scheduledAt: ctx.body.scheduledAt });
});

on('DELETE', '/api/admin/books/:bookId/levels/:levelNumber/schedule', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  delete db.schedules[`${ctx.params.bookId}:${ctx.params.levelNumber}`];
  persist();
  return ok(null);
});

on('POST', '/api/admin/books/:bookId/levels/:levelNumber/ab-test/start', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.levelNumber}`;
  const test = { abTestId: `ab_mock_${Date.now()}`, status: 'RUNNING', variantBContent: ctx.body.variantBContent };
  db.abTests[key] = test;
  persist();
  return ok({ success: true, ...test, level: Number(ctx.params.levelNumber), startedAt: new Date().toISOString() });
});

on('POST', '/api/admin/books/:bookId/levels/:levelNumber/ab-test/conclude', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const key = `${ctx.params.bookId}:${ctx.params.levelNumber}`;
  const test = db.abTests[key];
  if (!test) return fail(404, 'No running A/B test (mock)');
  test.status = 'CONCLUDED';
  test.winner = ctx.body.winner;
  persist();
  return ok({ success: true, abTestId: test.abTestId, level: Number(ctx.params.levelNumber), winner: test.winner, concludedAt: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════════════════════
// UPLOAD — services/uploadService.ts
// ══════════════════════════════════════════════════════════════════════════
on('POST', '/api/admin/books/:bookId/reference/pdf', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const url = fileUrl(ctx.body);
  db.supportingDocs[ctx.params.bookId] = (db.supportingDocs[ctx.params.bookId] || []).filter((d) => d.type !== 'PDF');
  db.supportingDocs[ctx.params.bookId].push({ type: 'PDF', url, uploadedAt: new Date().toISOString() });
  persist();
  return ok({ url, key: `refs/${ctx.params.bookId}/source.pdf`, uploadedAt: new Date().toISOString() });
});

on('POST', '/api/admin/books/:bookId/reference/infographic', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  const url = fileUrl(ctx.body);
  db.supportingDocs[ctx.params.bookId] = (db.supportingDocs[ctx.params.bookId] || []).filter((d) => d.type !== 'INFOGRAPHIC');
  db.supportingDocs[ctx.params.bookId].push({ type: 'INFOGRAPHIC', url, uploadedAt: new Date().toISOString() });
  persist();
  return ok({ url, key: `refs/${ctx.params.bookId}/infographic.png`, uploadedAt: new Date().toISOString() });
});

on('DELETE', '/api/admin/books/:bookId/reference/pdf', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  db.supportingDocs[ctx.params.bookId] = (db.supportingDocs[ctx.params.bookId] || []).filter((d) => d.type !== 'PDF');
  persist();
  return ok(null);
});

on('DELETE', '/api/admin/books/:bookId/reference/infographic', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  db.supportingDocs[ctx.params.bookId] = (db.supportingDocs[ctx.params.bookId] || []).filter((d) => d.type !== 'INFOGRAPHIC');
  persist();
  return ok(null);
});

on('POST', '/api/admin/books/:bookId/levels/2/cards/:order/image', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  return ok({ url: fileUrl(ctx.body) });
});

on('POST', '/api/admin/books/:bookId/levels/3/image', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  return ok({ url: fileUrl(ctx.body) });
});

on('POST', '/api/admin/books/:bookId/levels/4/pdf', (ctx) => {
  const guard = requireAdmin(ctx); if (guard) return guard;
  return ok({ pdfUrl: fileUrl(ctx.body), pdfKey: `levels/${ctx.params.bookId}/4/deep-dive.pdf`, pageCount: 12, wordCount: 3400, inlineText: '# Mock Deep Dive\n\nExtracted text preview (mock upload).' });
});

// ══════════════════════════════════════════════════════════════════════════
// Dispatcher used by mockAdapter.ts
// ══════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dispatch(config: any): Promise<[number, unknown]> {
  const method = String(config.method || 'get').toUpperCase();
  const rawUrl: string = config.url || '';
  const urlPath = rawUrl.split('?')[0];
  const auth = getAuthUser(config);
  const body = parseBody(config.data);
  const query: Record<string, string> = { ...parseQueryFromUrl(rawUrl), ...(config.params || {}) };

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(urlPath);
    if (!match) continue;
    const params: Record<string, string> = {};
    route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
    const result = await route.handler({ params, query, body, auth, config });
    return [result.status, result.data];
  }
  return [404, { message: `[Mock] No route registered for ${method} ${urlPath}`, success: false }];
}

// Exported for aiGenerationService's mock short-circuit (avoids a real Anthropic call).
export function getBookById(bookId: string) {
  return findBook(bookId);
}
export { toPublicUser };
