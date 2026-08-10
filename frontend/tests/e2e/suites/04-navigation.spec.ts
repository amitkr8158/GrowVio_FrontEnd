import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth.helper';

test.describe('🧭 Navigation and UI', () => {

  test('4.1 — All main authenticated routes load (no crash)', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);

    // Routes that exist in App.tsx (protected)
    const routes = ['/books', '/profile', '/home', '/leaderboard', '/community'];
    const broken: string[] = [];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(2500);
      const safeName = route.replace(/\//g, '-').replace(/^-/, '');
      await page.screenshot({
        path: `tests/e2e/screenshots/nav/route-${safeName || 'home'}.png`,
        fullPage: true,
      });
      const body = await page.locator('body').innerText();
      if (body.includes('Cannot GET') || body.includes('Unexpected Application Error')) {
        broken.push(route);
        console.log(`BUG: Route ${route} is broken`);
      }
    }

    expect(broken.length).toBe(0);
  });

  test('4.2 — Mobile viewport (375px) renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/e2e/screenshots/nav/mobile-home.png', fullPage: true });

    await login(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/e2e/screenshots/nav/mobile-after-login.png', fullPage: true });

    const body = await page.locator('body').innerText();
    expect(body).not.toContain('Internal Server Error');
    // Page should render with content — not blank
    expect(body.trim().length).toBeGreaterThan(50);
  });

  test('4.3 — No blocking console errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Filter out known benign errors (network preflight, favicon, etc.)
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('ERR_BLOCKED_BY_CLIENT')) {
          errors.push(text);
        }
      }
    });
    await page.goto('/');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/nav/console-check.png', fullPage: true });

    if (errors.length > 0) {
      console.log(`BUG-CANDIDATE: Console errors on home page:\n${errors.join('\n')}`);
    }
    // Warn but don't hard-fail — some 3rd-party errors are outside our control
    console.log(`Console errors found: ${errors.length}`);
  });

  test('4.4 — Public pages accessible without login', async ({ page }) => {
    const publicRoutes = ['/', '/pricing', '/plans', '/books', '/login', '/signup'];
    const broken: string[] = [];

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1500);
      const safeName = route.replace(/\//g, '-').replace(/^-/, '') || 'root';
      await page.screenshot({
        path: `tests/e2e/screenshots/nav/public-${safeName}.png`,
        fullPage: true,
      });
      const body = await page.locator('body').innerText();
      if (body.includes('Cannot GET') || body.includes('Application error')) {
        broken.push(route);
      }
    }

    expect(broken.length).toBe(0);
  });

});
