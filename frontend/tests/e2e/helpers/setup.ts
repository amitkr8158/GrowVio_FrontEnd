import { Page, APIRequestContext } from '@playwright/test';
import * as path from 'path';

// ESM-safe screenshots dir — resolved from the project root
const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'tests/e2e/screenshots');

export const ADMIN_URL      = process.env.ADMIN_BASE_URL  || 'https://dev.admin.growvio.in';
export const BASE_URL       = process.env.E2E_BASE_URL    || 'https://dev.growvio.in';
export const API_URL        = 'https://api-dev.growvio.in';
export const ADMIN_EMAIL    = process.env.ADMIN_EMAIL     || '';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD  || '';

// Screenshot counter for ordering in PDF
let screenshotCounter = 0;
export const screenshotLog: Array<{
  testName: string;
  step: string;
  filePath: string;
  apiCall?: string;
  apiStatus?: number;
  apiResponse?: string;
  timestamp: string;
}> = [];

// Take named screenshot and log it
export async function capture(
  page: Page,
  testName: string,
  stepName: string,
  apiInfo?: { url: string; status: number; body?: string }
) {
  screenshotCounter++;
  const safeName = `${String(screenshotCounter).padStart(3,'0')}_${testName}_${stepName}`
    .replace(/[^a-z0-9_]/gi, '_')
    .toLowerCase();
  const filePath = path.join(SCREENSHOTS_DIR, `${safeName}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  screenshotLog.push({
    testName,
    step: stepName,
    filePath,
    apiCall: apiInfo?.url,
    apiStatus: apiInfo?.status,
    apiResponse: apiInfo?.body ? apiInfo.body.substring(0, 300) : undefined,
    timestamp: new Date().toISOString()
  });
  console.log(`📸 Screenshot: ${safeName}`);
}

// Login helper
export async function adminLogin(page: Page) {
  await page.goto(`${ADMIN_URL}/login`);
  await capture(page, 'setup', 'login_page_loaded');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

  // Intercept the login API call
  const [response] = await Promise.all([
    page.waitForResponse(
      r => r.url().includes('/api/auth/login') && r.request().method() === 'POST'
    ),
    page.click('button[type="submit"]')
  ]);
  const status = response.status();
  let body = '';
  try { body = await response.text(); } catch {}
  await capture(page, 'setup', 'after_login', {
    url: response.url(),
    status,
    body
  });
  return { loginStatus: status, loginBody: body };
}

// API call helper with logging
export async function apiCall(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  token?: string,
  data?: object
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response;
  if (method === 'GET') {
    response = await request.get(url, { headers });
  } else if (method === 'POST') {
    response = await request.post(url, { headers, data });
  } else if (method === 'PUT') {
    response = await request.put(url, { headers, data });
  } else {
    response = await request.delete(url, { headers });
  }

  let responseBody = '';
  try { responseBody = await response.text(); } catch {}

  console.log(`🌐 ${method} ${url} → ${response.status()}`);
  screenshotLog.push({
    testName: 'API',
    step: `${method} ${url}`,
    filePath: '',
    apiCall: url,
    apiStatus: response.status(),
    apiResponse: responseBody.substring(0, 500),
    timestamp: new Date().toISOString()
  });

  return { status: response.status(), body: responseBody };
}
