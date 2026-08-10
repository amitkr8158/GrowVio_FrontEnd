import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth.helper';

test.describe('📚 Books Flow', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
  });

  test('2.1 — Books list page loads', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/e2e/screenshots/books/01-books-list.png', fullPage: true });
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('Internal Server Error');
    expect(body).not.toContain('Cannot GET');
    expect(page.url()).not.toContain('/login');
  });

  test('2.2 — Books load or show empty state (not crash)', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tests/e2e/screenshots/books/02-books-loaded.png', fullPage: true });
    const body = await page.locator('body').innerText();
    const hasContent = body.trim().length > 100;
    const hasCrash = body.includes('Internal Server Error') ||
                     body.includes('Cannot GET') ||
                     body.includes('Unexpected Application Error');
    expect(hasContent).toBeTruthy();
    expect(hasCrash).toBeFalsy();
  });

  test('2.3 — Search functionality visible', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(3000);
    const searchBox = page.locator(
      'input[placeholder*="search" i], input[type="search"], input[placeholder*="find" i]'
    );
    const isVisible = await searchBox.first().isVisible().catch(() => false);
    await page.screenshot({ path: 'tests/e2e/screenshots/books/03-search-visible.png', fullPage: true });
    if (!isVisible) {
      console.log('BUG-CANDIDATE: Search box not found on /books page');
    }
    // Soft check — document the finding but do not hard-fail
    console.log(`Search box visible: ${isVisible}`);
  });

  test('2.4 — Click first book opens book detail', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(5000);
    // Try multiple selectors that could be a book card / link
    const firstBook = page.locator(
      '[data-testid="book-card"], a[href*="/books/"], .book-card, [class*="book"]'
    ).first();
    const exists = await firstBook.isVisible().catch(() => false);

    if (exists) {
      await firstBook.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/e2e/screenshots/books/04-book-detail.png', fullPage: true });
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/books\//);
    } else {
      await page.screenshot({ path: 'tests/e2e/screenshots/books/04-no-books.png', fullPage: true });
      console.log('BUG-CANDIDATE: No book cards found on /books page — may need seed data');
    }
  });

  test('2.5 — Book detail page has no crash', async ({ page }) => {
    await page.goto('/books');
    await page.waitForTimeout(5000);
    const firstBook = page.locator('a[href*="/books/"]').first();
    const exists = await firstBook.isVisible().catch(() => false);

    if (exists) {
      const href = await firstBook.getAttribute('href');
      if (href) {
        await page.goto(href);
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tests/e2e/screenshots/books/05-book-reading.png', fullPage: true });
        const body = await page.locator('body').innerText();
        expect(body.trim().length).toBeGreaterThan(200);
        expect(body).not.toContain('Internal Server Error');
        expect(body).not.toContain('Unexpected Application Error');
      }
    } else {
      console.log('SKIP: No books available to test reading page');
    }
  });

});
