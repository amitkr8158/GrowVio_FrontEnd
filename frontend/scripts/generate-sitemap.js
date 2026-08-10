#!/usr/bin/env node
/**
 * Growvio Sitemap Generator
 * =========================
 * Fetches all books from book-service and generates:
 *   - /dist/sitemap.xml   — submitted to Google Search Console
 *   - /dist/robots.txt    — tells crawlers where the sitemap is
 *
 * Run: node scripts/generate-sitemap.js
 * Add to build: "build": "vite build && node scripts/generate-sitemap.js"
 *
 * Env:
 *   BOOK_SERVICE_URL  — defaults to http://localhost:8082
 *   SITE_URL          — defaults to https://growvio.com
 */

const fs   = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:8082'
const SITE_URL         = process.env.SITE_URL         || 'https://growvio.com'
const OUT_DIR          = path.join(__dirname, '../dist')

// Static pages always in sitemap
const STATIC_PAGES = [
  { loc: '/',        changefreq: 'weekly',  priority: '1.0' },
  { loc: '/books',   changefreq: 'daily',   priority: '0.9' },
  { loc: '/login',   changefreq: 'monthly', priority: '0.3' },
  { loc: '/signup',  changefreq: 'monthly', priority: '0.5' },
  { loc: '/checkout',changefreq: 'monthly', priority: '0.4' },
]

async function fetchBooks() {
  const url = `${BOOK_SERVICE_URL}/api/books`
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { resolve([]) }
      })
    }).on('error', () => resolve([]))
  })
}

function escapeXml(s) {
  if (typeof s !== 'string') return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSitemap(books) {
  const today = new Date().toISOString().split('T')[0]

  const staticUrls = STATIC_PAGES.map(p => `
  <url>
    <loc>${escapeXml(SITE_URL + p.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  const bookUrls = books.map(b => `
  <url>
    <loc>${escapeXml(SITE_URL + '/books/' + b.id)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${escapeXml(b.coverImageUrl || '')}</image:loc>
      <image:title>${escapeXml(b.title)}</image:title>
    </image:image>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${bookUrls}
</urlset>`
}

function buildRobots() {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.warn(`[sitemap] dist/ not found — skipping (run 'vite build' first)`)
    process.exit(0)
  }

  console.log('[sitemap] Fetching books from', BOOK_SERVICE_URL)
  const books = await fetchBooks()
  console.log(`[sitemap] Found ${books.length} books`)

  const sitemap = buildSitemap(books)
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), sitemap, 'utf8')
  console.log('[sitemap] Written dist/sitemap.xml')

  const robots = buildRobots()
  fs.writeFileSync(path.join(OUT_DIR, 'robots.txt'), robots, 'utf8')
  console.log('[sitemap] Written dist/robots.txt')
}

main().catch(e => { console.error(e); process.exit(1) })
