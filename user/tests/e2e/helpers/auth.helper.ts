import { Page } from '@playwright/test';

export const TEST_USER = {
  // Use env vars in CI; fall back to defaults for local runs
  email:    process.env.E2E_TEST_EMAIL    || 'e2etest@growvio.in',
  password: process.env.E2E_TEST_PASSWORD || 'E2ETest@1234',
  name:     'E2E Test User',
};

export async function signup(page: Page) {
  await page.goto('/signup');
  await page.screenshot({ path: 'tests/e2e/screenshots/auth/01-signup-page.png', fullPage: true });

  await page.fill('[name="name"], [placeholder*="name" i]', TEST_USER.name);
  await page.fill('input[type="email"], [name="email"], [placeholder*="email" i]', TEST_USER.email);
  await page.fill('input[type="password"], [name="password"], [placeholder*="password" i]', TEST_USER.password);
  await page.screenshot({ path: 'tests/e2e/screenshots/auth/02-signup-filled.png', fullPage: true });

  await page.click('button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create account")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/e2e/screenshots/auth/03-signup-result.png', fullPage: true });
}

export async function login(page: Page) {
  await page.goto('/login');
  await page.screenshot({ path: 'tests/e2e/screenshots/auth/04-login-page.png', fullPage: true });

  await page.fill('input[type="email"], [name="email"], [placeholder*="email" i]', TEST_USER.email);
  await page.fill('input[type="password"], [name="password"], [placeholder*="password" i]', TEST_USER.password);
  await page.screenshot({ path: 'tests/e2e/screenshots/auth/05-login-filled.png', fullPage: true });

  await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tests/e2e/screenshots/auth/06-login-result.png', fullPage: true });
}

export async function logout(page: Page) {
  const logoutBtn = page.locator(
    'button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Log out"), [data-testid="logout"]'
  );
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/e2e/screenshots/auth/logout-result.png', fullPage: true });
  }
}
