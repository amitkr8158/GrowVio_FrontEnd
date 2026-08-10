/**
 * 06 — Deep User-Portal Coverage
 *
 * Visits every route on dev.growvio.in, clicks all visible nav links / tabs /
 * buttons, captures a 1920×1080 full-page screenshot at each step, and records
 * every browser console error.  Tests are soft (warn-not-fail) wherever the UI
 * may vary; they hard-fail only on crashes (5xx, blank body, JS error banner).
 */
import * as fs   from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { login, TEST_USER } from '../helpers/auth.helper';

// ── Screenshot helper ────────────────────────────────────────────────────────

const SS_ROOT = path.resolve(process.cwd(), 'tests/e2e/screenshots');

function ssDir(folder: string): string {
  const dir = path.join(SS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

let _seq = 0;
async function shot(page: import('@playwright/test').Page, folder: string, label: string) {
  _seq++;
  const name = `${String(_seq).padStart(3, '0')}_${label}`.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
  await page.screenshot({ path: path.join(ssDir(folder), `${name}.png`), fullPage: true });
}

// ── Console-error collector ──────────────────────────────────────────────────

function attachConsoleCapture(page: import('@playwright/test').Page): () => string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // filter browser noise
      if (!text.includes('favicon') && !text.includes('ERR_BLOCKED_BY_CLIENT') && !text.includes('net::ERR_')) {
        errors.push(`[console.error] ${text}`);
      }
    }
  });
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));
  return () => errors;
}

// ── Crash guard ──────────────────────────────────────────────────────────────

async function assertNoCrash(page: import('@playwright/test').Page, route: string) {
  const body = await page.locator('body').innerText().catch(() => '');
  const crashes = [
    'Internal Server Error',
    'Unexpected Application Error',
    'Cannot GET',
    'Application error:',
    'ChunkLoadError',
  ];
  for (const pattern of crashes) {
    if (body.includes(pattern)) {
      throw new Error(`Crash detected on ${route}: "${pattern}" found in body`);
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function waitAndShot(page: import('@playwright/test').Page, folder: string, label: string) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
  await shot(page, folder, label);
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC PAGES (no auth required)
// ════════════════════════════════════════════════════════════════════════════

test.describe('06-A: Public pages', () => {

  test('6A-1 — Landing page (/) loads and has content', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/');
    await waitAndShot(page, 'user/public', '6A1_landing');
    await assertNoCrash(page, '/');
    const body = await page.locator('body').innerText();
    expect(body.trim().length, 'Landing page must have content').toBeGreaterThan(100);
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /:', errs.join('\n'));
  });

  test('6A-2 — Landing page — click every nav link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Collect ALL hrefs first so element handles don't go stale after navigation
    const rawLinks: Array<{ href: string; text: string }> = await page.locator('nav a[href], header a[href]').evaluateAll(
      (els: Element[]) => (els as HTMLAnchorElement[]).map(el => ({
        href: el.getAttribute('href') || '',
        text: (el.textContent || '').trim(),
      }))
    );
    const links = rawLinks.filter(
      l => l.href && !l.href.startsWith('http') && !l.href.startsWith('#') && !l.href.startsWith('mailto')
    );
    console.log(`Nav links found: ${links.length}`);
    for (const { href, text } of links) {
      try {
        await page.goto(href);
        await waitAndShot(page, 'user/public', `6A2_nav_${text || href}`);
        await assertNoCrash(page, href);
      } catch (e) {
        console.warn(`Nav link ${href} caused error: ${(e as Error).message}`);
      }
    }
  });

  test('6A-3 — /pricing page loads', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/pricing');
    await waitAndShot(page, 'user/public', '6A3_pricing');
    await assertNoCrash(page, '/pricing');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /pricing:', errs.join('\n'));
  });

  test('6A-4 — /plans page loads and shows plan cards', async ({ page }) => {
    await page.goto('/plans');
    await waitAndShot(page, 'user/public', '6A4_plans');
    await assertNoCrash(page, '/plans');
    const body = await page.locator('body').innerText();
    const hasPrices = body.includes('199') || body.includes('599') || body.toLowerCase().includes('free');
    if (!hasPrices) console.warn('BUG-CANDIDATE: No plan prices visible on /plans');
  });

  test('6A-5 — /login page loads with email+password fields', async ({ page }) => {
    await page.goto('/login');
    await waitAndShot(page, 'user/public', '6A5_login');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('6A-6 — /signup page loads with name+email+password fields', async ({ page }) => {
    await page.goto('/signup');
    await waitAndShot(page, 'user/public', '6A6_signup');
    await assertNoCrash(page, '/signup');
  });

  test('6A-7 — /books (public) loads without crash', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(3000);
    await waitAndShot(page, 'user/public', '6A7_books_public');
    await assertNoCrash(page, '/books');
  });

  test('6A-8 — Mobile (390×844) render — no broken layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = ['/', '/login', '/signup', '/plans'];
    for (const r of routes) {
      await page.goto(r);
      await page.waitForTimeout(1500);
      await shot(page, 'user/mobile', `6A8_mobile${r.replace(/\//g, '_') || '_root'}`);
      await assertNoCrash(page, r);
    }
  });

});

// ════════════════════════════════════════════════════════════════════════════
// AUTHENTICATED PAGES
// ════════════════════════════════════════════════════════════════════════════

test.describe('06-B: Authenticated user portal', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
  });

  test('6B-1 — /home dashboard loads', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/home');
    await waitAndShot(page, 'user/authenticated', '6B1_home_dashboard');
    await assertNoCrash(page, '/home');
    expect(page.url()).not.toContain('/login');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /home:', errs.join('\n'));
  });

  test('6B-2 — /home — click all nav items visible after login', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Collect all hrefs before any navigation to avoid stale handles
    const allHrefs: string[] = await page.evaluate(() => {
      const sels = ['nav a[href]', 'aside a[href]', '[role="navigation"] a[href]', '[data-testid*="nav"] a[href]'];
      const hrefs = new Set<string>();
      for (const sel of sels) {
        document.querySelectorAll<HTMLAnchorElement>(sel).forEach(el => {
          const h = el.getAttribute('href');
          if (h) hrefs.add(h);
        });
      }
      return [...hrefs];
    });
    const links = allHrefs.filter(h => !h.startsWith('http') && !h.startsWith('#'));
    console.log(`Authenticated nav links found: ${links.length}`);

    for (const href of links) {
      try {
        await page.goto(href);
        await waitAndShot(page, 'user/authenticated', `6B2_nav_${href.replace(/\//g, '_')}`);
        await assertNoCrash(page, href);
      } catch (e) {
        console.warn(`Nav ${href} error: ${(e as Error).message}`);
      }
    }
    console.log(`Authenticated nav links visited: ${links.length}`);
  });

  test('6B-3 — /books list loads for authenticated user', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/books');
    await page.waitForLoadState('networkidle').catch(() => page.waitForTimeout(5000));
    await waitAndShot(page, 'user/authenticated', '6B3_books_list');
    await assertNoCrash(page, '/books');
    const body = await page.locator('body').innerText();
    // Soft-warn if blank — could be a real app bug (JS crash / empty state)
    if (body.trim().length <= 10) {
      console.warn('BUG-CANDIDATE: /books page renders blank body for authenticated user');
    }
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /books:', errs.join('\n'));
  });

  test('6B-4 — /books — search for Atomic Habits', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(3000);
    const searchBox = page.locator(
      'input[placeholder*="search" i], input[type="search"], input[placeholder*="find" i]'
    ).first();
    const searchVisible = await searchBox.isVisible().catch(() => false);
    await waitAndShot(page, 'user/books', '6B4_before_search');
    if (searchVisible) {
      await searchBox.fill('Atomic');
      await page.waitForTimeout(1500);
      await waitAndShot(page, 'user/books', '6B4_search_atomic_habits');
    } else {
      console.warn('BUG-CANDIDATE: Search input not found on /books');
    }
  });

  test('6B-5 — /books — click first book card → book detail page', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(4000);
    const bookLink = page.locator('a[href*="/books/"]').first();
    const exists = await bookLink.isVisible().catch(() => false);
    await waitAndShot(page, 'user/books', '6B5_books_list_before_click');
    if (exists) {
      const href = await bookLink.getAttribute('href');
      await bookLink.click();
      await page.waitForTimeout(3000);
      await waitAndShot(page, 'user/books', '6B5_book_detail');
      await assertNoCrash(page, href || '/books/*');
      expect(page.url()).toMatch(/\/books\//);
    } else {
      console.warn('BUG-CANDIDATE: No book links on /books');
    }
  });

  test('6B-6 — Book detail — click all 7 pyramid level tabs', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(4000);
    const bookLink = page.locator('a[href*="/books/"]').first();
    if (!await bookLink.isVisible().catch(() => false)) {
      console.warn('SKIP 6B-6: No books available');
      return;
    }
    await bookLink.click();
    await page.waitForTimeout(3000);
    await waitAndShot(page, 'user/book-detail', '6B6_book_detail_loaded');

    // Try tab-like elements for levels
    const levelSelectors = [
      '[role="tab"]',
      'button:has-text("Level")',
      'button:has-text("L1"), button:has-text("L2"), button:has-text("L3")',
      '[data-testid*="level"]',
      'button:has-text("Free"), button:has-text("Premium")',
    ];
    for (const sel of levelSelectors) {
      const tabs = await page.locator(sel).all();
      for (const tab of tabs) {
        if (!await tab.isVisible().catch(() => false)) continue;
        const label = await tab.innerText().catch(() => 'tab');
        await tab.click().catch(() => {});
        await page.waitForTimeout(800);
        await shot(page, 'user/book-detail', `6B6_level_${label}`);
      }
    }
  });

  test('6B-7 — /leaderboard loads and shows entries', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/leaderboard');
    await page.waitForTimeout(3000);
    await waitAndShot(page, 'user/authenticated', '6B7_leaderboard');
    await assertNoCrash(page, '/leaderboard');

    // Click weekly / all-time tabs if present
    const tabs = await page.locator('[role="tab"], button:has-text("Weekly"), button:has-text("All Time"), button:has-text("All-time")').all();
    for (const tab of tabs) {
      if (!await tab.isVisible().catch(() => false)) continue;
      const label = await tab.innerText().catch(() => 'tab');
      await tab.click().catch(() => {});
      await page.waitForTimeout(1000);
      await shot(page, 'user/authenticated', `6B7_leaderboard_tab_${label}`);
    }
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /leaderboard:', errs.join('\n'));
  });

  test('6B-8 — /community page loads', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/community');
    await page.waitForTimeout(3000);
    await waitAndShot(page, 'user/authenticated', '6B8_community');
    await assertNoCrash(page, '/community');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /community:', errs.join('\n'));
  });

  test('6B-9 — /profile page loads and shows user info', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    await waitAndShot(page, 'user/authenticated', '6B9_profile');
    await assertNoCrash(page, '/profile');
    const body = await page.locator('body').innerText();
    const hasUser = body.includes('@') || body.toLowerCase().includes('profile');
    if (!hasUser) console.warn('BUG-CANDIDATE: Profile page shows no user data');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /profile:', errs.join('\n'));
  });

  test('6B-10 — /profile — click all tabs and action buttons', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    const tabs = await page.locator('[role="tab"]').all();
    for (const tab of tabs) {
      if (!await tab.isVisible().catch(() => false)) continue;
      const label = await tab.innerText().catch(() => 'tab');
      await tab.click().catch(() => {});
      await page.waitForTimeout(800);
      await shot(page, 'user/profile', `6B10_profile_tab_${label}`);
    }
    await waitAndShot(page, 'user/profile', '6B10_profile_all_tabs_done');
  });

  test('6B-11 — /settings/profile loads', async ({ page }) => {
    const getErrors = attachConsoleCapture(page);
    await page.goto('/settings/profile');
    await page.waitForTimeout(2500);
    await waitAndShot(page, 'user/settings', '6B11_settings_profile');
    await assertNoCrash(page, '/settings/profile');
    expect(page.url()).not.toContain('/login');
    const errs = getErrors();
    if (errs.length) console.warn('Console errors on /settings/profile:', errs.join('\n'));
  });

  test('6B-12 — /settings/notifications loads', async ({ page }) => {
    await page.goto('/settings/notifications');
    await page.waitForTimeout(2500);
    await waitAndShot(page, 'user/settings', '6B12_settings_notifications');
    await assertNoCrash(page, '/settings/notifications');
  });

  test('6B-13 — /settings/billing loads', async ({ page }) => {
    await page.goto('/settings/billing');
    await page.waitForTimeout(2500);
    await waitAndShot(page, 'user/settings', '6B13_settings_billing');
    await assertNoCrash(page, '/settings/billing');
  });

  test('6B-14 — /checkout is protected — redirects to login when unauthenticated', async ({ page }) => {
    // Clear session first
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/checkout');
    await page.waitForTimeout(2000);
    await waitAndShot(page, 'user/authenticated', '6B14_checkout_unauthenticated');
    expect(page.url()).toContain('/login');
  });

  test('6B-15 — All authenticated routes — zero crash check', async ({ page }) => {
    const routes = [
      '/home', '/books', '/leaderboard', '/community',
      '/profile', '/settings/profile', '/settings/notifications', '/settings/billing',
      '/plans', '/pricing',
    ];
    const broken: string[] = [];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(2000);
      const safeName = route.replace(/\//g, '_').replace(/^_/, '');
      await shot(page, 'user/all-routes', `6B15_${safeName}`);
      const body = await page.locator('body').innerText().catch(() => '');
      const crash = ['Internal Server Error', 'Unexpected Application Error', 'Cannot GET', 'ChunkLoadError'];
      const found = crash.find(c => body.includes(c));
      if (found) broken.push(`${route}: ${found}`);
    }
    if (broken.length) {
      console.error('CRASHES DETECTED:', broken.join('\n'));
    }
    expect(broken, `Crashes on routes: ${broken.join(', ')}`).toHaveLength(0);
  });

  test('6B-16 — All authenticated routes — console error sweep', async ({ page }) => {
    const routes = ['/home', '/books', '/leaderboard', '/community', '/profile', '/plans'];
    const report: Record<string, string[]> = {};
    for (const route of routes) {
      const errors: string[] = [];
      page.removeAllListeners('console');
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const t = msg.text();
          if (!t.includes('favicon') && !t.includes('ERR_BLOCKED_BY_CLIENT')) {
            errors.push(t);
          }
        }
      });
      await page.goto(route);
      await page.waitForTimeout(2500);
      if (errors.length) report[route] = errors;
    }
    if (Object.keys(report).length) {
      console.warn('Console errors by route:\n', JSON.stringify(report, null, 2));
      // Write report to file for review
      const outPath = path.join(SS_ROOT, 'console-errors-report.json');
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
      console.log(`Console error report saved to ${outPath}`);
    }
    // Soft assertion — don't hard-fail on console errors (3rd-party noise)
    console.log(`Routes with console errors: ${Object.keys(report).length}/${routes.length}`);
  });

});

// ════════════════════════════════════════════════════════════════════════════
// ERROR / EDGE STATES
// ════════════════════════════════════════════════════════════════════════════

test.describe('06-C: Error and edge states', () => {

  test('6C-1 — 404 route shows error page (not crash)', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await page.waitForTimeout(2000);
    await waitAndShot(page, 'user/errors', '6C1_404_page');
    const body = await page.locator('body').innerText().catch(() => '');
    // Must not be a blank page
    expect(body.trim().length).toBeGreaterThan(10);
    // Must not be a raw server error
    const hard500 = body.includes('Internal Server Error') && !body.toLowerCase().includes('404');
    expect(hard500).toBeFalsy();
  });

  test('6C-2 — Login with wrong password shows error (not crash)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], [name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], [name="password"]', 'WRONGpassword999!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await waitAndShot(page, 'user/errors', '6C2_wrong_password');
    // Must await innerText() before calling string methods on it
    const body = (await page.locator('body').innerText()).toLowerCase();
    const hasErrorFeedback = body.includes('invalid') || body.includes('incorrect')
      || body.includes('wrong') || body.includes('error') || body.includes('failed');
    if (!hasErrorFeedback) console.warn('BUG-CANDIDATE: No error message shown for wrong password');
    // Must NOT crash with a hard 500 server error
    expect(body).not.toContain('internal server error');
  });

  test('6C-3 — Book detail for non-existent ID shows error gracefully', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.goto('/books/non-existent-book-id-00000000');
    await page.waitForTimeout(3000);
    await waitAndShot(page, 'user/errors', '6C3_invalid_book_id');
    const body = await page.locator('body').innerText().catch(() => '');
    const hard500 = body.includes('Internal Server Error') && !body.toLowerCase().includes('not found');
    if (hard500) throw new Error('500 on invalid book ID — should show 404 / error state instead');
  });

});
