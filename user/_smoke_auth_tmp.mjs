import { chromium } from 'playwright-core'

const BASE = 'http://localhost:5174'

const browser = await chromium.launch()
const page = await browser.newPage()
const consoleMsgs = []
page.on('console', (msg) => consoleMsgs.push(msg.text()))
page.on('pageerror', (err) => consoleMsgs.push('PAGEERROR: ' + String(err)))

function log(label, value) { console.log(label + ':', value) }

try {
  // 1. Go to login, fill in ADMIN credentials
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.selectOption('select', 'ADMIN')
  await page.fill('input[type="email"]', 'admin@growvio.dev')
  await page.fill('input[type="password"]', 'Admin@123')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(1200)

  log('1) URL after login', page.url())
  log('1) admin_token set', !!(await page.evaluate(() => localStorage.getItem('admin_token'))))
  log('1) admin_user', await page.evaluate(() => localStorage.getItem('admin_user')))

  // 2. Reload the page — should STAY logged in if persistence works
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  log('2) URL after reload', page.url())
  log('2) admin_token still set after reload', !!(await page.evaluate(() => localStorage.getItem('admin_token'))))
  const bodyAfterReload = await page.locator('body').innerText()
  log('2) shows Access Denied after reload?', bodyAfterReload.includes('Access Denied'))
  log('2) shows Sign in (bounced to login) after reload?', bodyAfterReload.includes('Sign in') || page.url().includes('/login'))

  // 3. Click logout
  const logoutBtn = page.getByText('Logout')
  if (await logoutBtn.count()) {
    await logoutBtn.click()
    await page.waitForTimeout(800)
    log('3) URL after logout click', page.url())
    log('3) admin_token cleared', !(await page.evaluate(() => localStorage.getItem('admin_token'))))
  } else {
    log('3) Logout button NOT FOUND on this page', await page.locator('body').innerText())
  }

  // 4. Try to hit a protected route directly after logout
  await page.goto(`${BASE}/books`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  log('4) URL when visiting /books after logout', page.url())

  // 5. Now test SUPER_ADMIN login (not the hardcoded ADMIN role)
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.selectOption('select', 'SUPER_ADMIN')
  await page.fill('input[type="email"]', 'superadmin@growvio.dev')
  await page.fill('input[type="password"]', 'SuperAdmin@123')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(1200)
  log('5) URL after SUPER_ADMIN login', page.url())
  log('5) admin_token set (super admin)', !!(await page.evaluate(() => localStorage.getItem('admin_token'))))
  const bodyAfterSuperAdmin = await page.locator('body').innerText()
  log('5) shows Access Denied for SUPER_ADMIN?', bodyAfterSuperAdmin.includes('Access Denied'))

  console.log('--- console/page errors ---')
  console.log(consoleMsgs.filter(m => /error/i.test(m)).join('\n'))
} finally {
  await browser.close()
}
