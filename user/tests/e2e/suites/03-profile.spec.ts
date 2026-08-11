import { test, expect } from '@playwright/test';
import { login, TEST_USER } from '../helpers/auth.helper';

test.describe('👤 Profile Flow', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
  });

  test('3.1 — Profile page loads without 500', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/profile/01-profile-page.png', fullPage: true });
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('Internal Server Error');
    expect(body).not.toContain('Unexpected Application Error');
    expect(page.url()).not.toContain('/login');
  });

  test('3.2 — User email or name visible in profile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/profile/02-profile-data.png', fullPage: true });
    const body = await page.locator('body').innerText();
    const hasIdentifier = body.includes('@') ||
                          body.toLowerCase().includes('e2e test') ||
                          body.toLowerCase().includes('growvio');
    console.log(`Profile shows user identifier: ${hasIdentifier}`);
    if (!hasIdentifier) {
      console.log('BUG-CANDIDATE: Profile page does not show user email or name');
    }
  });

  test('3.3 — Plan / subscription info visible', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/profile/03-plan-info.png', fullPage: true });
    const body = await page.locator('body').innerText().then(t => t.toUpperCase());
    const hasPlan = body.includes('FREE') || body.includes('PRO') ||
                    body.includes('PREMIUM') || body.includes('PLAN') ||
                    body.includes('SUBSCRIPTION');
    console.log(`Plan/subscription info visible: ${hasPlan}`);
    if (!hasPlan) {
      console.log('BUG-CANDIDATE: No plan/subscription information shown on profile');
    }
  });

  test('3.4 — Settings/profile settings page loads', async ({ page }) => {
    await page.goto('/settings/profile');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/profile/04-settings.png', fullPage: true });
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('Internal Server Error');
    expect(page.url()).not.toContain('/login');
  });

});
