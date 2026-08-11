# GrowVio E2E Test Suite

Automated tests that open a real Chrome browser, test every feature of
`dev.growvio.in`, take screenshots at every step, and generate an HTML/PDF report.

## How to run

```bash
cd user

# Run all tests — generates HTML report
npm run test:e2e

# Watch the browser while tests run (good for debugging)
npm run test:e2e:headed

# Open the detailed Playwright HTML report
npm run test:e2e:report

# Test against your local dev server (must be running on :5173)
npm run test:e2e:local
```

## Where to find results

| Path | What it is |
|---|---|
| `tests/e2e/reports/growvio-test-report.html` | **Main report** — open in browser, click "Save as PDF" |
| `tests/e2e/reports/html/` | Detailed Playwright report with traces |
| `tests/e2e/screenshots/` | Every screenshot taken (named by step) |
| `tests/e2e/test-results/` | Videos of failed tests |

## Test suites (24 tests across 5 suites)

| File | Tests | What it covers |
|---|---|---|
| `01-auth.spec.ts` | 9 | Signup, login, wrong password, duplicate signup, protected route guard, logout |
| `02-books.spec.ts` | 5 | Book list page, books loaded, search visible, click book, book detail |
| `03-profile.spec.ts` | 4 | Profile page, user data, plan info, settings |
| `04-navigation.spec.ts` | 4 | All routes, mobile 375px viewport, console errors, public routes |
| `05-payment.spec.ts` | 5 | Plans page, prices, upgrade CTA, checkout guard, payment success guard |

## Test account

Tests use `e2etest@growvio.in` — a dedicated QA account that is never used by real users.
Credentials are in `user/.env.e2e` (gitignored).

## CI/CD integration

```yaml
# In your GitHub Actions workflow:
- name: Run E2E tests
  run: cd user && npm run test:e2e
  env:
    E2E_BASE_URL: https://dev.growvio.in
    E2E_TEST_EMAIL: ${{ secrets.E2E_TEST_EMAIL }}
    E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
```
