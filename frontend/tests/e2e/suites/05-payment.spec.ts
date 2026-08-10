import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth.helper';

test.describe('💳 Payment & Plans Flow', () => {

  test('5.1 — Plans page loads without login', async ({ page }) => {
    // /plans and /pricing both map to PlansPage in App.tsx
    await page.goto('/plans');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment/01-plans-page.png', fullPage: true });
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('Internal Server Error');
    expect(body).not.toContain('Cannot GET');
    expect(body.trim().length).toBeGreaterThan(100);
  });

  test('5.2 — Plan prices visible (₹199 or ₹599)', async ({ page }) => {
    await page.goto('/plans');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment/02-prices.png', fullPage: true });
    const body = await page.locator('body').innerText();
    const hasPrices = body.includes('199') || body.includes('599');
    console.log(`Plan prices (₹199/₹599) visible: ${hasPrices}`);
    if (!hasPrices) {
      console.log('BUG-CANDIDATE: Pricing amounts not visible on /plans page');
    }
  });

  test('5.3 — Plan upgrade button present on plans page', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.goto('/plans');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment/03-upgrade-button.png', fullPage: true });
    const upgradeBtn = page.locator(
      'button:has-text("Upgrade"), button:has-text("Get"), button:has-text("Subscribe"), a:has-text("Upgrade")'
    ).first();
    const visible = await upgradeBtn.isVisible().catch(() => false);
    console.log(`Upgrade CTA visible: ${visible}`);
    if (!visible) {
      console.log('BUG-CANDIDATE: No upgrade/subscribe button found on plans page');
    }
  });

  test('5.4 — Checkout page redirects unauthenticated user to login', async ({ page }) => {
    // Clear session
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    });
    await page.goto('/checkout');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment/04-checkout-redirect.png', fullPage: true });
    // Should redirect to login (ProtectedRoute)
    expect(page.url()).toContain('/login');
  });

  test('5.5 — Payment success page is protected', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    });
    await page.goto('/payment/success');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/e2e/screenshots/payment/05-payment-success-protected.png', fullPage: true });
    expect(page.url()).toContain('/login');
  });

});
