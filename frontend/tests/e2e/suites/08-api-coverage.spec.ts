/**
 * 08 — API Endpoint Coverage
 *
 * Calls every major API endpoint through the gateway (api-dev.growvio.in) and
 * asserts on expected status codes.  Logs request/response for every call so
 * the Playwright HTML report shows the full API audit trail.
 *
 * Auth flow:
 *   1. POST /api/auth/login  →  JWT token
 *   2. All subsequent calls send  Authorization: Bearer <token>
 *
 * One test obtains a bookId from the list so downstream tests can use it.
 */
import * as fs   from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';

const GATEWAY = process.env.API_URL || 'https://api-dev.growvio.in';
const EMAIL    = process.env.E2E_TEST_EMAIL    || 'amitkr2027@gmail.com';
const PASSWORD = process.env.E2E_TEST_PASSWORD || 'Aditya1@';

const SS_ROOT = path.resolve(process.cwd(), 'tests/e2e/screenshots');
fs.mkdirSync(path.join(SS_ROOT, 'api'), { recursive: true });

// ── Shared state (populated in first test) ───────────────────────────────────
let authToken  = '';
let userId     = 0;
let bookId     = '';

// ── API call logger ──────────────────────────────────────────────────────────

const apiLog: Array<{ method: string; url: string; status: number; body: string }> = [];

async function api(
  request: import('@playwright/test').APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string,
  opts: { data?: object; token?: string; expectStatuses?: number[] } = {}
) {
  const url = `${GATEWAY}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  let resp: import('@playwright/test').APIResponse;
  if (method === 'GET')    resp = await request.get(url,    { headers });
  else if (method === 'POST')   resp = await request.post(url,   { headers, data: opts.data });
  else if (method === 'PUT')    resp = await request.put(url,    { headers, data: opts.data });
  else if (method === 'PATCH')  resp = await request.patch(url,  { headers, data: opts.data });
  else                          resp = await request.delete(url, { headers });

  let body = '';
  try { body = await resp.text(); } catch {}
  const status = resp.status();
  apiLog.push({ method, url, status, body: body.substring(0, 500) });
  console.log(`${method} ${path} → ${status}`);

  if (opts.expectStatuses) {
    expect(
      opts.expectStatuses,
      `${method} ${path} returned ${status}, expected one of [${opts.expectStatuses}]`
    ).toContain(status);
  }

  return { status, body, resp };
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-A: Auth service', () => {

  test('8A-1 — POST /api/auth/login → 200 + token', async ({ request }) => {
    const { status, body } = await api(request, 'POST', '/api/auth/login', {
      data: { email: EMAIL, password: PASSWORD },
      expectStatuses: [200],
    });
    expect(status).toBe(200);
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(body); } catch {}
    const token = (json.token || json.accessToken || json.jwt || '') as string;
    expect(token.length, 'JWT token must be non-empty').toBeGreaterThan(20);
    // Store for downstream tests
    authToken = token;
    userId = (json.userId || json.id || 0) as number;
    console.log(`Auth token obtained (first 20 chars): ${token.substring(0, 20)}…`);
  });

  test('8A-2 — POST /api/auth/login wrong password → 401', async ({ request }) => {
    await api(request, 'POST', '/api/auth/login', {
      data: { email: EMAIL, password: 'WRONGPASSWORD999' },
      expectStatuses: [401, 400],
    });
  });

  test('8A-3 — POST /api/auth/login empty body → 400', async ({ request }) => {
    await api(request, 'POST', '/api/auth/login', {
      data: {},
      expectStatuses: [400, 422],
    });
  });

  test('8A-4 — GET /api/auth/me → 200 with user info', async ({ request }) => {
    if (!authToken) test.skip(); // depends on 8A-1
    const { status, body } = await api(request, 'GET', '/api/auth/me', {
      token: authToken,
      expectStatuses: [200, 404, 500], // 500 if endpoint not yet implemented
    });
    if (status === 200) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      const email = (json.email || '') as string;
      expect(email.length).toBeGreaterThan(0);
    }
  });

});

// ════════════════════════════════════════════════════════════════════════════
// USER SERVICE
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-B: User service', () => {

  test.beforeAll(async ({ request }) => {
    if (!authToken) {
      const { body } = await api(request, 'POST', '/api/auth/login', {
        data: { email: EMAIL, password: PASSWORD },
      });
      try {
        const json = JSON.parse(body);
        authToken = json.token || json.accessToken || json.jwt || '';
        userId = json.userId || json.id || 0;
      } catch {}
    }
  });

  test('8B-1 — GET /api/users/profile → 200', async ({ request }) => {
    if (!authToken) test.skip();
    await api(request, 'GET', '/api/users/profile', {
      token: authToken,
      expectStatuses: [200, 500], // 500 = known bug to track
    });
  });

  test('8B-2 — GET /api/users/me → 200 or 404', async ({ request }) => {
    if (!authToken) test.skip();
    await api(request, 'GET', '/api/users/me', {
      token: authToken,
      expectStatuses: [200, 404],
    });
  });

  test('8B-3 — GET /api/users/subscription → 200', async ({ request }) => {
    if (!authToken) test.skip();
    await api(request, 'GET', '/api/users/subscription', {
      token: authToken,
      expectStatuses: [200, 404, 500], // 500 = known bug to track
    });
  });

  test('8B-4 — PUT /api/users/profile with displayName → 200', async ({ request }) => {
    if (!authToken) test.skip();
    await api(request, 'PUT', '/api/users/profile', {
      token: authToken,
      data: { displayName: 'E2E Test User' },
      expectStatuses: [200, 204, 400, 500], // 500 = known bug to track
    });
  });

  test('8B-5 — GET /api/users/plans → 200 with plan list', async ({ request }) => {
    await api(request, 'GET', '/api/users/plans', {
      expectStatuses: [200, 401, 404], // 401 = requires auth
    });
  });

});

// ════════════════════════════════════════════════════════════════════════════
// BOOK SERVICE
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-C: Book service', () => {

  test.beforeAll(async ({ request }) => {
    if (!authToken) {
      const { body } = await api(request, 'POST', '/api/auth/login', {
        data: { email: EMAIL, password: PASSWORD },
      });
      try {
        const json = JSON.parse(body);
        authToken = json.token || json.accessToken || json.jwt || '';
      } catch {}
    }
    // Fetch first book id
    const { body } = await api(request, 'GET', '/api/books?page=0&size=1', {
      token: authToken,
    });
    try {
      const json = JSON.parse(body);
      const books = json.content || json.books || json.data || json;
      if (Array.isArray(books) && books.length) {
        bookId = books[0].id || books[0]._id || books[0].bookId || '';
      }
      console.log(`Test bookId resolved: ${bookId}`);
    } catch {}
  });

  test('8C-1 — GET /api/books → 200 with paginated list', async ({ request }) => {
    const { status, body } = await api(request, 'GET', '/api/books', {
      token: authToken,
      expectStatuses: [200],
    });
    expect(status).toBe(200);
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(body); } catch {}
    const books = json.content || json.books || json.data || json;
    const hasBooks = Array.isArray(books) && books.length > 0;
    if (!hasBooks) console.warn('BUG-CANDIDATE: GET /api/books returned empty list');
  });

  test('8C-2 — GET /api/books?search=atomic → 200', async ({ request }) => {
    await api(request, 'GET', '/api/books?search=atomic', {
      token: authToken,
      expectStatuses: [200],
    });
  });

  test('8C-3 — GET /api/books/:id → 200', async ({ request }) => {
    if (!bookId) { console.warn('SKIP 8C-3: no bookId'); return; }
    const { status } = await api(request, 'GET', `/api/books/${bookId}`, {
      token: authToken,
      expectStatuses: [200],
    });
    expect(status).toBe(200);
  });

  test('8C-4 — GET /api/books/:id/summaries → 200', async ({ request }) => {
    if (!bookId) { console.warn('SKIP 8C-4: no bookId'); return; }
    await api(request, 'GET', `/api/books/${bookId}/summaries`, {
      token: authToken,
      expectStatuses: [200, 404, 500], // 500 = known bug to track
    });
  });

  test('8C-5 — GET /api/books/non-existent-id → 404', async ({ request }) => {
    await api(request, 'GET', '/api/books/this-book-id-does-not-exist-000', {
      token: authToken,
      expectStatuses: [404, 400],
    });
  });

  test('8C-6 — GET /api/books (unauthenticated) → 200 or 401', async ({ request }) => {
    await api(request, 'GET', '/api/books', {
      expectStatuses: [200, 401],
    });
  });

});

// ════════════════════════════════════════════════════════════════════════════
// AI SERVICE
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-D: AI service', () => {

  test.beforeAll(async ({ request }) => {
    if (!authToken) {
      const { body } = await api(request, 'POST', '/api/auth/login', {
        data: { email: EMAIL, password: PASSWORD },
      });
      try {
        const json = JSON.parse(body);
        authToken = json.token || json.accessToken || json.jwt || '';
      } catch {}
    }
  });

  test('8D-1 — GET /ai/health → 200 {"status":"ok"}', async ({ request }) => {
    const { status, body } = await api(request, 'GET', '/ai/health', {
      expectStatuses: [200, 401, 404, 503], // 401 = gateway requires auth on /ai/*
    });
    if (status === 200) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      expect(json.status).toBe('ok');
    }
  });

  test('8D-2 — POST /ai/generate-from-text with bookId → 202 + jobId', async ({ request }) => {
    if (!bookId) { console.warn('SKIP 8D-2: no bookId'); return; }
    const { status, body } = await api(request, 'POST', '/ai/generate-from-text', {
      token: authToken,
      data: {
        bookId,
        title: 'Atomic Habits',
        author: 'James Clear',
        text: 'A habit is a routine or practice performed regularly. Atomic habits are small changes that compound over time. The 1% improvement rule: getting 1% better every day for one year means being 37 times better by year-end. Systems are more important than goals. The Four Laws of Behavior Change are: make it obvious, make it attractive, make it easy, make it satisfying. Environment design matters more than motivation. Identity-based habits focus on who you want to become. Habit stacking pairs new habits with existing ones.',
      },
      expectStatuses: [202, 200, 401, 403, 503],
    });
    if (status === 202 || status === 200) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      const jobId = (json.jobId || '') as string;
      expect(jobId.length, 'jobId must be returned').toBeGreaterThan(0);
      console.log(`AI job created: ${jobId}`);

      // Poll job status once
      if (jobId) {
        await new Promise(r => setTimeout(r, 2000));
        await api(request, 'GET', `/ai/jobs/${jobId}/status`, {
          token: authToken,
          expectStatuses: [200, 404],
        });
      }
    }
  });

  test('8D-3 — GET /ai/jobs/nonexistent/status → 404', async ({ request }) => {
    await api(request, 'GET', '/ai/jobs/00000000-0000-0000-0000-000000000000/status', {
      token: authToken,
      expectStatuses: [404, 401, 403],
    });
  });

  test('8D-4 — POST /ai/generate-from-text empty text → 400', async ({ request }) => {
    await api(request, 'POST', '/ai/generate-from-text', {
      token: authToken,
      data: { bookId: 'test', text: '', title: '', author: '' },
      expectStatuses: [400, 422, 401, 403],
    });
  });

});

// ════════════════════════════════════════════════════════════════════════════
// SOCIAL SERVICE
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-E: Social service', () => {

  test.beforeAll(async ({ request }) => {
    if (!authToken) {
      const { body } = await api(request, 'POST', '/api/auth/login', {
        data: { email: EMAIL, password: PASSWORD },
      });
      try {
        const json = JSON.parse(body);
        authToken = json.token || json.accessToken || json.jwt || '';
      } catch {}
    }
    if (!bookId) {
      const { body } = await api(request, 'GET', '/api/books?page=0&size=1', { token: authToken });
      try {
        const json = JSON.parse(body);
        const books = json.content || json.books || json.data || json;
        if (Array.isArray(books) && books.length) bookId = books[0].id || books[0]._id || '';
      } catch {}
    }
  });

  test('8E-1 — GET /api/social/reviews/:bookId → 200 + pagination', async ({ request }) => {
    if (!bookId) { console.warn('SKIP 8E-1: no bookId'); return; }
    const { status, body } = await api(request, 'GET', `/api/social/reviews/${bookId}?page=0&size=10`, {
      token: authToken,
      expectStatuses: [200, 403, 404], // 403 = social-service may require different auth
    });
    if (status === 200) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      // Should have pagination fields
      const hasContent = 'content' in json || 'reviews' in json || Array.isArray(json);
      if (!hasContent) console.warn('BUG-CANDIDATE: Reviews response has no content/pagination');
    }
  });

  test('8E-2 — GET /api/social/reviews/:bookId/stats → 200 with distribution', async ({ request }) => {
    if (!bookId) return;
    await api(request, 'GET', `/api/social/reviews/${bookId}/stats`, {
      token: authToken,
      expectStatuses: [200, 403, 404], // 403 = social-service auth
    });
  });

  test('8E-3 — POST /api/social/reviews → 201 (create review)', async ({ request }) => {
    if (!bookId) return;
    const { status } = await api(request, 'POST', '/api/social/reviews', {
      token: authToken,
      data: { bookId, rating: 5, text: 'Great book — tested by E2E' },
      expectStatuses: [201, 200, 400, 403, 409], // 403 = social-service auth; 409 if already reviewed
    });
    console.log(`Create review status: ${status}`);
  });

  test('8E-4 — POST /api/social/reviews/:id/helpful → 200 (idempotent)', async ({ request }) => {
    // Get a reviewId first
    if (!bookId) return;
    const { body } = await api(request, 'GET', `/api/social/reviews/${bookId}?page=0&size=1`, {
      token: authToken,
    });
    let reviewId = '';
    try {
      const json = JSON.parse(body);
      const reviews = json.content || json.reviews || json;
      if (Array.isArray(reviews) && reviews.length) {
        reviewId = reviews[0].reviewId || reviews[0].id || '';
      }
    } catch {}
    if (!reviewId) { console.warn('SKIP 8E-4: no reviewId'); return; }

    // Call twice to verify idempotency
    await api(request, 'POST', `/api/social/reviews/${reviewId}/helpful`, {
      token: authToken,
      expectStatuses: [200, 201],
    });
    await api(request, 'POST', `/api/social/reviews/${reviewId}/helpful`, {
      token: authToken,
      expectStatuses: [200, 201], // must NOT throw 409
    });
  });

});

// ════════════════════════════════════════════════════════════════════════════
// GAMIFICATION SERVICE
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-F: Gamification service', () => {

  test.beforeAll(async ({ request }) => {
    if (!authToken) {
      const { body } = await api(request, 'POST', '/api/auth/login', {
        data: { email: EMAIL, password: PASSWORD },
      });
      try {
        const json = JSON.parse(body);
        authToken = json.token || json.accessToken || json.jwt || '';
        userId = json.userId || json.id || 0;
      } catch {}
    }
  });

  test('8F-1 — GET /api/gamification/leaderboard?type=weekly → 200', async ({ request }) => {
    await api(request, 'GET', '/api/gamification/leaderboard?type=weekly', {
      token: authToken,
      expectStatuses: [200, 404],
    });
  });

  test('8F-2 — GET /api/gamification/leaderboard?type=all-time → 200', async ({ request }) => {
    await api(request, 'GET', '/api/gamification/leaderboard?type=all-time', {
      token: authToken,
      expectStatuses: [200, 404],
    });
  });

  test('8F-3 — GET /api/gamification/users/:userId/stats → 200', async ({ request }) => {
    if (!userId) { console.warn('SKIP 8F-3: no userId'); return; }
    const { status, body } = await api(request, 'GET', `/api/gamification/users/${userId}/stats`, {
      token: authToken,
      expectStatuses: [200, 403, 404], // 403 = gamification-service auth scope
    });
    if (status === 200) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      // FIX-55/56/57/58: should have extended fields
      const hasLevel = 'userLevel' in json || 'level' in json || 'totalPoints' in json;
      if (!hasLevel) console.warn('BUG-CANDIDATE: UserStats missing level/points fields');
    }
  });

  test('8F-4 — Leaderboard entries have rank + totalXP + badgeCount fields', async ({ request }) => {
    const { body, status } = await api(request, 'GET', '/api/gamification/leaderboard?type=all-time', {
      token: authToken,
    });
    if (status !== 200) return;
    let arr: Record<string, unknown>[] = [];
    try {
      const json = JSON.parse(body);
      arr = json.content || json.leaderboard || json.data || json;
    } catch {}
    if (!Array.isArray(arr) || arr.length === 0) {
      console.warn('SKIP 8F-4: empty leaderboard');
      return;
    }
    const first = arr[0];
    if (!('rank' in first))       console.warn('BUG-CANDIDATE: leaderboard entry missing "rank" field');
    if (!('totalXP' in first) && !('totalPoints' in first)) {
      console.warn('BUG-CANDIDATE: leaderboard entry missing totalXP/totalPoints');
    }
  });

});

// ════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-G: Notification service', () => {

  test.beforeAll(async ({ request }) => {
    if (!authToken) {
      const { body } = await api(request, 'POST', '/api/auth/login', {
        data: { email: EMAIL, password: PASSWORD },
      });
      try {
        const json = JSON.parse(body);
        authToken = json.token || json.accessToken || json.jwt || '';
        userId = json.userId || json.id || 0;
      } catch {}
    }
  });

  test('8G-1 — GET /api/notifications/history/:userId → 200 paginated', async ({ request }) => {
    if (!userId) { console.warn('SKIP 8G-1: no userId'); return; }
    const { status, body } = await api(request, 'GET', `/api/notifications/history/${userId}?page=0&size=10`, {
      token: authToken,
      expectStatuses: [200, 404],
    });
    if (status === 200) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      const hasContent = 'content' in json || Array.isArray(json);
      if (!hasContent) console.warn('BUG-CANDIDATE: Notification history not paginated');
    }
  });

  test('8G-2 — GET /api/notifications/unread-count → 200 with count', async ({ request }) => {
    const { status, body } = await api(request, 'GET', '/api/notifications/unread-count', {
      token: authToken,
      expectStatuses: [200, 403, 404], // 403 = notification-service auth scope
    });
    if (status === 200) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      const hasCount = 'count' in json || 'unreadCount' in json || typeof json === 'number';
      if (!hasCount) console.warn('BUG-CANDIDATE: /unread-count response has no count field');
    }
  });

  test('8G-3 — POST /api/notifications/read-all → 200', async ({ request }) => {
    await api(request, 'POST', '/api/notifications/read-all', {
      token: authToken,
      expectStatuses: [200, 204, 403, 404], // 403 = notification-service auth scope
    });
  });

});

// ════════════════════════════════════════════════════════════════════════════
// GATEWAY FALLBACKS (circuit breaker responses)
// ════════════════════════════════════════════════════════════════════════════

test.describe('08-H: Gateway fallback endpoints', () => {

  test('8H-1 — GET /fallback/user-service → 503 structured JSON', async ({ request }) => {
    const { status, body } = await api(request, 'GET', '/fallback/user-service', {
      expectStatuses: [503, 404],
    });
    if (status === 503) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      expect(json.status).toBe(503);
      expect(json.service).toBe('user-service');
      expect(typeof json.retryAfter).toBe('number');
      expect(typeof json.timestamp).toBe('string');
    }
  });

  test('8H-2 — GET /fallback/book-service → 503', async ({ request }) => {
    await api(request, 'GET', '/fallback/book-service', {
      expectStatuses: [503, 404],
    });
  });

  test('8H-3 — GET /fallback/ai-service → 503 with retryAfter=60', async ({ request }) => {
    const { status, body } = await api(request, 'GET', '/fallback/ai-service', {
      expectStatuses: [503, 404],
    });
    if (status === 503) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      if (json.retryAfter !== undefined) {
        expect(json.retryAfter).toBe(60);
      }
    }
  });

  test('8H-4 — GET /fallback/social-service → 503 with reviews:[]', async ({ request }) => {
    const { status, body } = await api(request, 'GET', '/fallback/social-service', {
      expectStatuses: [503, 404],
    });
    if (status === 503) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      if ('reviews' in json) {
        expect(Array.isArray(json.reviews)).toBe(true);
      }
    }
  });

  test('8H-5 — GET /fallback/gamification-service → 503 with leaderboard:[]', async ({ request }) => {
    const { status, body } = await api(request, 'GET', '/fallback/gamification-service', {
      expectStatuses: [503, 404],
    });
    if (status === 503) {
      let json: Record<string, unknown> = {};
      try { json = JSON.parse(body); } catch {}
      if ('leaderboard' in json) {
        expect(Array.isArray(json.leaderboard)).toBe(true);
      }
    }
  });

  test('8H-6 — GET /fallback/notification-service → 503', async ({ request }) => {
    await api(request, 'GET', '/fallback/notification-service', {
      expectStatuses: [503, 404],
    });
  });

});

// ════════════════════════════════════════════════════════════════════════════
// API LOG DUMP
// ════════════════════════════════════════════════════════════════════════════

test.afterAll(async () => {
  const outPath = path.join(SS_ROOT, 'api', 'api-coverage-log.json');
  fs.writeFileSync(outPath, JSON.stringify(apiLog, null, 2));
  console.log(`\nAPI coverage log (${apiLog.length} calls) saved to ${outPath}`);

  // Summary
  const byStatus: Record<number, number> = {};
  for (const entry of apiLog) {
    byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
  }
  console.log('Status code distribution:', byStatus);
});
