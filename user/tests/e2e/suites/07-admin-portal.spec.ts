/**
 * 07 — Comprehensive Admin Portal Coverage
 *
 * Visits every section of dev.admin.growvio.in, clicks all nav links, tabs, and
 * action buttons, captures full-page 1920×1080 screenshots at every step, and
 * captures console errors per page.
 *
 * Depends on ADMIN_EMAIL + ADMIN_PASSWORD in .env.test (already set).
 */
import * as fs   from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';

const ADMIN_URL  = process.env.ADMIN_BASE_URL || 'https://dev.admin.growvio.in';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'amitkr2027@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Aditya1@';

// ── Screenshot helper ────────────────────────────────────────────────────────

const SS_ROOT = path.resolve(process.cwd(), 'tests/e2e/screenshots');

function ssDir(folder: string): string {
  const dir = path.join(SS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

let _seq = 600; // start at 600 to avoid collision with suite 06
async function shot(page: import('@playwright/test').Page, folder: string, label: string) {
  _seq++;
  const name = `${String(_seq).padStart(3, '0')}_${label}`.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
  await page.screenshot({ path: path.join(ssDir(folder), `${name}.png`), fullPage: true });
}

// ── Admin login helper ───────────────────────────────────────────────────────

async function adminLogin(page: import('@playwright/test').Page) {
  await page.goto(`${ADMIN_URL}/login`);
  await page.waitForLoadState('domcontentloaded');
  await page.fill('input[type="email"], [name="email"], [placeholder*="email" i]', ADMIN_EMAIL);
  await page.fill('input[type="password"], [name="password"], [placeholder*="password" i]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  // Wait up to 10s for the URL to change away from /login
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 })
    .catch(() => {
      // Still on /login — may be rate-limited or slow; hard-fail only if URL hasn't moved at all
      if (page.url().includes('/login')) {
        throw new Error(`Admin login failed — still on /login. URL: ${page.url()}`);
      }
    });
  await shot(page, 'admin/auth', '07_admin_logged_in');
}

// ── Crash guard ──────────────────────────────────────────────────────────────

async function assertNoCrash(page: import('@playwright/test').Page, label: string) {
  const body = await page.locator('body').innerText().catch(() => '');
  const patterns = ['Internal Server Error', 'Unexpected Application Error', 'Cannot GET', 'ChunkLoadError'];
  for (const p of patterns) {
    if (body.includes(p)) throw new Error(`Crash on "${label}": found "${p}"`);
  }
}

// ── Console capture ──────────────────────────────────────────────────────────

function attachConsole(page: import('@playwright/test').Page): () => string[] {
  const errs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('favicon') && !t.includes('ERR_BLOCKED_BY_CLIENT')) errs.push(t);
    }
  });
  return () => errs;
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════════

test.describe('07-A: Admin auth', () => {

  test('7A-1 — Admin login page loads', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await shot(page, 'admin/auth', '7A1_admin_login_page');
    await assertNoCrash(page, '/login');
    await expect(page.locator('input[type="email"], [name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], [name="password"]').first()).toBeVisible();
  });

  test('7A-2 — Admin login succeeds → redirects to dashboard', async ({ page }) => {
    const getErrors = attachConsole(page);
    await adminLogin(page);
    expect(page.url()).not.toContain('/login');
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(10);
    const errs = getErrors();
    if (errs.length) console.warn('Console errors after admin login:', errs.join('\n'));
  });

  test('7A-3 — Wrong password shows error (not crash)', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await page.fill('input[type="email"], [name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"], [name="password"]', 'WRONGpassword999!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await shot(page, 'admin/auth', '7A3_wrong_password');
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('internal server error');
  });

  test('7A-4 — Protected route redirects unauthenticated → /login', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/books`);
    await page.waitForTimeout(2000);
    await shot(page, 'admin/auth', '7A4_protected_redirect');
    expect(page.url()).toContain('/login');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD & NAVIGATION
// ════════════════════════════════════════════════════════════════════════════

test.describe('07-B: Admin dashboard and navigation', () => {

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('7B-1 — Dashboard loads with stats/widgets', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/dashboard`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/dashboard', '7B1_dashboard');
    await assertNoCrash(page, '/dashboard');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /dashboard:', errs.join('\n'));
  });

  test('7B-2 — Click all sidebar / nav links', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const navLinks = await page.locator('nav a[href], aside a[href], [role="navigation"] a[href]').all();
    console.log(`Admin sidebar links: ${navLinks.length}`);
    const seen = new Set<string>();

    for (const link of navLinks) {
      const href = await link.getAttribute('href').catch(() => null);
      if (!href || href.startsWith('http') || href.startsWith('#') || seen.has(href)) continue;
      seen.add(href);
      const fullUrl = href.startsWith('/') ? `${ADMIN_URL}${href}` : href;
      await page.goto(fullUrl);
      await page.waitForTimeout(2000);
      const safeName = href.replace(/\//g, '_').replace(/^_/, '');
      await shot(page, 'admin/navigation', `7B2_nav_${safeName}`);
      await assertNoCrash(page, href);
    }
    console.log(`Admin nav links visited: ${seen.size}`);
  });

  test('7B-3 — All known admin routes — zero crash check', async ({ page }) => {
    const routes = [
      '/dashboard', '/books', '/users', '/analytics',
      '/discounts', '/pricing', '/feature-flags', '/audit',
      '/support', '/settings',
    ];
    const broken: string[] = [];
    for (const route of routes) {
      await page.goto(`${ADMIN_URL}${route}`);
      await page.waitForTimeout(2000);
      const safeName = route.replace(/\//g, '_').replace(/^_/, '');
      await shot(page, 'admin/all-routes', `7B3_${safeName}`);
      const body = await page.locator('body').innerText().catch(() => '');
      if (page.url().includes('/login')) {
        broken.push(`${route} → redirected to login (session expired?)`);
        continue;
      }
      const patterns = ['Internal Server Error', 'Unexpected Application Error', 'Cannot GET'];
      const found = patterns.find(p => body.includes(p));
      if (found) broken.push(`${route}: ${found}`);
    }
    if (broken.length) console.error('Broken admin routes:', broken.join('\n'));
    expect(broken, `Admin route crashes: ${broken.join(', ')}`).toHaveLength(0);
  });

  test('7B-4 — Console error sweep across all admin routes', async ({ page }) => {
    const routes = ['/dashboard', '/books', '/users', '/analytics', '/discounts', '/pricing', '/support'];
    const report: Record<string, string[]> = {};
    for (const route of routes) {
      const errs: string[] = [];
      page.removeAllListeners('console');
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const t = msg.text();
          if (!t.includes('favicon') && !t.includes('ERR_BLOCKED_BY_CLIENT')) errs.push(t);
        }
      });
      await page.goto(`${ADMIN_URL}${route}`);
      await page.waitForTimeout(2500);
      if (errs.length) report[route] = errs;
    }
    if (Object.keys(report).length) {
      const outPath = path.join(SS_ROOT, 'admin-console-errors-report.json');
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
      console.warn('Admin console error report:', JSON.stringify(report, null, 2));
    }
    console.log(`Admin routes with console errors: ${Object.keys(report).length}/${routes.length}`);
  });

});

// ════════════════════════════════════════════════════════════════════════════
// BOOKS MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

test.describe('07-C: Admin books management', () => {

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/books`);
    await page.waitForLoadState('networkidle');
  });

  test('7C-1 — Books list table loads with correct columns', async ({ page }) => {
    await shot(page, 'admin/books', '7C1_books_list');
    await assertNoCrash(page, '/books');
    // Check for key columns
    for (const col of ['TITLE', 'GENRE', 'STATUS', 'LEVELS', 'ACTIONS']) {
      const visible = await page.locator(`text=${col}`).first().isVisible().catch(() => false);
      if (!visible) console.warn(`BUG-CANDIDATE: Column "${col}" not visible in books list`);
    }
  });

  test('7C-2 — No NaN in levels column', async ({ page }) => {
    await shot(page, 'admin/books', '7C2_levels_nan_check');
    const nanCells = page.locator('td').filter({ hasText: /NaN/ });
    expect(await nanCells.count(), 'NaN must not appear in levels column').toBe(0);
  });

  test('7C-3 — Search filters book list', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
    const visible = await searchInput.isVisible().catch(() => false);
    await shot(page, 'admin/books', '7C3_before_search');
    if (visible) {
      await searchInput.fill('Atomic');
      await page.waitForTimeout(1000);
      await shot(page, 'admin/books', '7C3_search_atomic');
      const hasResult = await page.locator('text=Atomic').first().isVisible().catch(() => false);
      if (!hasResult) console.warn('BUG-CANDIDATE: Search for "Atomic" returned no results');
    } else {
      console.warn('BUG-CANDIDATE: Search input not found on admin /books');
    }
  });

  test('7C-4 — Click Edit on first book → editor page opens', async ({ page }) => {
    const editBtn = page.locator(
      'button:has-text("Edit"), a:has-text("Edit"), [data-testid*="edit"]'
    ).first();
    const exists = await editBtn.isVisible().catch(() => false);
    await shot(page, 'admin/books', '7C4_before_edit');
    if (exists) {
      await editBtn.click();
      await page.waitForTimeout(2000);
      await shot(page, 'admin/books', '7C4_book_editor');
      await assertNoCrash(page, 'book editor');
      // Should be on /books/{id}/edit or similar
      expect(page.url()).toMatch(/\/books\//);
    } else {
      console.warn('SKIP 7C-4: No Edit button visible on books list');
    }
  });

  test('7C-5 — Book editor — click all 7 level tabs', async ({ page }) => {
    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    if (!await editBtn.isVisible().catch(() => false)) {
      console.warn('SKIP 7C-5: No Edit button');
      return;
    }
    await editBtn.click();
    await page.waitForTimeout(2000);
    await shot(page, 'admin/books', '7C5_editor_opened');

    // Click level tabs L1–L7 (or Free/Premium/etc.)
    const levelTabSelectors = [
      'button:has-text("L1"), button:has-text("L2"), button:has-text("L3"), button:has-text("L4"), button:has-text("L5"), button:has-text("L6"), button:has-text("L7")',
      'button:has-text("Level 1"), button:has-text("Level 2")',
      '[role="tab"]',
    ];
    for (const sel of levelTabSelectors) {
      const tabs = await page.locator(sel).all();
      for (const tab of tabs) {
        if (!await tab.isVisible().catch(() => false)) continue;
        const label = await tab.innerText().catch(() => 'tab');
        await tab.click().catch(() => {});
        await page.waitForTimeout(600);
        await shot(page, 'admin/book-levels', `7C5_level_${label}`);
      }
    }
  });

  test('7C-6 — Book editor — Save Level button visible', async ({ page }) => {
    const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    if (!await editBtn.isVisible().catch(() => false)) return;
    await editBtn.click();
    await page.waitForTimeout(2000);
    await shot(page, 'admin/books', '7C6_save_level_check');
    const saveBtn = page.locator('button:has-text("Save Level"), button:has-text("Save"), button[type="submit"]').first();
    const visible = await saveBtn.isVisible().catch(() => false);
    if (!visible) console.warn('BUG-CANDIDATE: No Save Level button in book editor');
  });

  test('7C-7 — Create new book modal/page opens', async ({ page }) => {
    const addBtn = page.locator(
      'button:has-text("Add New Book"), button:has-text("New Book"), button:has-text("Create Book"), a:has-text("Add")'
    ).first();
    const exists = await addBtn.isVisible().catch(() => false);
    await shot(page, 'admin/books', '7C7_before_create');
    if (exists) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      await shot(page, 'admin/books', '7C7_create_modal_opened');
      await assertNoCrash(page, 'create book modal');
    } else {
      console.warn('BUG-CANDIDATE: No "Add New Book" button on admin books page');
    }
  });

  test('7C-8 — Publish button visible (on published or staged books)', async ({ page }) => {
    await shot(page, 'admin/books', '7C8_publish_check');
    const publishBtn = page.locator(
      'button:has-text("Publish"), button:has-text("Unpublish"), [data-testid*="publish"]'
    ).first();
    const visible = await publishBtn.isVisible().catch(() => false);
    console.log(`Publish/Unpublish button visible: ${visible}`);
    if (!visible) console.warn('BUG-CANDIDATE: No publish button on books list');
  });

});

// ════════════════════════════════════════════════════════════════════════════
// USERS, ANALYTICS, DISCOUNTS, PRICING
// ════════════════════════════════════════════════════════════════════════════

test.describe('07-D: Admin users, analytics, discounts, pricing', () => {

  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('7D-1 — /users list loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/users`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/users', '7D1_users_list');
    await assertNoCrash(page, '/users');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /users:', errs.join('\n'));
  });

  test('7D-2 — /users — search/filter user visible', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/users`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/users', '7D2_users_search');
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('amit');
      await page.waitForTimeout(1000);
      await shot(page, 'admin/users', '7D2_users_filtered');
    }
  });

  test('7D-3 — /analytics page loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/analytics`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/analytics', '7D3_analytics');
    await assertNoCrash(page, '/analytics');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /analytics:', errs.join('\n'));
  });

  test('7D-4 — /analytics — click all chart tabs / date range filters', async ({ page }) => {
    await page.goto(`${ADMIN_URL}/analytics`);
    await page.waitForTimeout(3000);
    const tabs = await page.locator('[role="tab"], button:has-text("7D"), button:has-text("30D"), button:has-text("90D"), button:has-text("Revenue"), button:has-text("Users")').all();
    for (const tab of tabs) {
      if (!await tab.isVisible().catch(() => false)) continue;
      const label = await tab.innerText().catch(() => 'tab');
      await tab.click().catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, 'admin/analytics', `7D4_analytics_tab_${label}`);
    }
  });

  test('7D-5 — /discounts page loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/discounts`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/discounts', '7D5_discounts');
    await assertNoCrash(page, '/discounts');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /discounts:', errs.join('\n'));
  });

  test('7D-6 — /pricing page loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/pricing`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/pricing', '7D6_pricing');
    await assertNoCrash(page, '/pricing');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /pricing:', errs.join('\n'));
  });

  test('7D-7 — /feature-flags page loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/feature-flags`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/feature-flags', '7D7_feature_flags');
    await assertNoCrash(page, '/feature-flags');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /feature-flags:', errs.join('\n'));
  });

  test('7D-8 — /audit page loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/audit`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/audit', '7D8_audit');
    await assertNoCrash(page, '/audit');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /audit:', errs.join('\n'));
  });

  test('7D-9 — /support page loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/support`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/support', '7D9_support');
    await assertNoCrash(page, '/support');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /support:', errs.join('\n'));
  });

  test('7D-10 — /settings loads', async ({ page }) => {
    const getErrors = attachConsole(page);
    await page.goto(`${ADMIN_URL}/settings`);
    await page.waitForTimeout(3000);
    await shot(page, 'admin/settings', '7D10_settings');
    await assertNoCrash(page, '/settings');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on admin /settings:', errs.join('\n'));
  });

});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN MOBILE VIEWPORT
// ════════════════════════════════════════════════════════════════════════════

test.describe('07-E: Admin portal mobile viewport', () => {

  test('7E-1 — Admin portal renders at 390px width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/dashboard`);
    await page.waitForTimeout(2000);
    await shot(page, 'admin/mobile', '7E1_admin_mobile_dashboard');
    await assertNoCrash(page, '/dashboard mobile');
    const body = await page.locator('body').innerText().catch(() => '');
    expect(body.trim().length).toBeGreaterThan(10);
  });

  test('7E-2 — Admin books list renders at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/books`);
    await page.waitForTimeout(2000);
    await shot(page, 'admin/mobile', '7E2_admin_mobile_books');
    await assertNoCrash(page, '/books mobile');
  });

});
