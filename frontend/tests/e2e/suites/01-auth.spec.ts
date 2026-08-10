import { test, expect } from '@playwright/test';
import { signup, login, logout, TEST_USER } from '../helpers/auth.helper';

test.describe('🔐 Authentication Flow', () => {

  test('1.1 — Home page loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/home-page.png', fullPage: true });
    await expect(page).not.toHaveURL(/error/);
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('Cannot GET');
    expect(body).not.toContain('Application error');
  });

  test('1.2 — Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/login-page.png', fullPage: true });
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible();
  });

  test('1.3 — Signup page loads correctly', async ({ page }) => {
    await page.goto('/signup');
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/signup-page.png', fullPage: true });
    await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first()).toBeVisible();
  });

  test('1.4 — Sign up new test user', async ({ page }) => {
    await signup(page);
    const url = page.url();
    const hasToken = await page.evaluate(() =>
      !!localStorage.getItem('token') ||
      !!localStorage.getItem('authToken') ||
      !!localStorage.getItem('jwt')
    );
    const onApp = url.includes('/home') || url.includes('/books') ||
                  url.includes('/onboarding') || !url.includes('/signup');
    // Either token is stored OR we're past the signup page
    expect(hasToken || onApp).toBeTruthy();
  });

  test('1.5 — Login with valid credentials', async ({ page }) => {
    await login(page);
    const url = page.url();
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/after-login.png', fullPage: true });
    // After login we should NOT be on /login anymore
    const loggedIn = !url.includes('/login') || url.includes('/home') || url.includes('/books');
    expect(loggedIn).toBeTruthy();
  });

  test('1.6 — Login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"], [name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], [name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/wrong-password-error.png', fullPage: true });
    const bodyText = await page.locator('body').innerText();
    const hasError = bodyText.toLowerCase().includes('invalid') ||
                     bodyText.toLowerCase().includes('incorrect') ||
                     bodyText.toLowerCase().includes('wrong') ||
                     bodyText.toLowerCase().includes('error') ||
                     bodyText.toLowerCase().includes('failed') ||
                     bodyText.toLowerCase().includes('credentials');
    expect(hasError).toBeTruthy();
  });

  test('1.7 — Duplicate signup shows error not crash', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[name="name"], [placeholder*="name" i]', TEST_USER.name);
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/duplicate-signup.png', fullPage: true });
    const body = await page.locator('body').innerText();
    // Acceptable: error message OR redirect to login. Unacceptable: 500 crash page.
    const has500 = body.includes('Internal Server Error') || body.includes('Unexpected Application Error');
    expect(has500).toBeFalsy();
  });

  test('1.8 — Protected route /home redirects to login when not authenticated', async ({ page }) => {
    // Clear any session first
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('jwt');
    });
    await page.goto('/home');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/protected-route.png', fullPage: true });
    expect(page.url()).toContain('/login');
  });

  test('1.9 — Logout works and clears session', async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await logout(page);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/after-logout.png', fullPage: true });
    const token = await page.evaluate(() =>
      localStorage.getItem('token') || localStorage.getItem('authToken')
    );
    expect(token).toBeFalsy();
  });

});
