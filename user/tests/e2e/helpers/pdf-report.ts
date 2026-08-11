import * as fs from 'fs';
import * as path from 'path';
import { chromium } from '@playwright/test';
import { screenshotLog } from './setup';

// Simple HTML → PDF approach using Playwright itself
export async function generatePDFReport(
  results: Array<{ name: string; status: 'pass' | 'fail' | 'skip'; error?: string; duration?: number }>,
  outputPath: string
) {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  // Build HTML report
  let screenshotRows = '';
  for (const log of screenshotLog) {
    if (!log.filePath) {
      // API call only
      screenshotRows += `
        <div class="api-entry ${(log.apiStatus || 0) < 400 ? 'pass' : 'fail'}">
          <span class="badge">${log.apiStatus}</span>
          <span class="api-url">${escapeHtml(log.step)}</span>
          ${log.apiResponse ? `<pre class="api-resp">${escapeHtml(log.apiResponse)}</pre>` : ''}
        </div>`;
    } else {
      // Screenshot with optional API
      const exists = fs.existsSync(log.filePath);
      const imgSrc = exists
        ? `data:image/png;base64,${fs.readFileSync(log.filePath).toString('base64')}`
        : '';
      screenshotRows += `
        <div class="screenshot-entry">
          <h4>${escapeHtml(log.testName)} — ${escapeHtml(log.step)}</h4>
          <p class="ts">${log.timestamp}</p>
          ${log.apiCall ? `
            <div class="api-info ${(log.apiStatus || 0) < 400 ? 'ok' : 'err'}">
              🌐 ${escapeHtml(log.apiCall)} → <strong>${log.apiStatus}</strong>
              ${log.apiResponse ? `<pre>${escapeHtml(log.apiResponse.substring(0,200))}</pre>` : ''}
            </div>` : ''}
          ${imgSrc ? `<img src="${imgSrc}" alt="${escapeHtml(log.step)}" />` : '<p class="no-img">Screenshot not available</p>'}
        </div>`;
    }
  }

  let testRows = '';
  for (const r of results) {
    testRows += `
      <tr class="${r.status}">
        <td>${escapeHtml(r.name)}</td>
        <td><span class="badge ${r.status}">${r.status.toUpperCase()}</span></td>
        <td>${r.duration ? r.duration + 'ms' : '—'}</td>
        <td>${r.error ? escapeHtml(r.error.substring(0,100)) : '—'}</td>
      </tr>`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>GrowVio E2E Test Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; background: #0f172a; color: #e2e8f0; }
  h1 { color: #7c3aed; }
  h2 { color: #10b981; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
  h4 { color: #94a3b8; margin: 0 0 4px; }
  .summary { display: flex; gap: 20px; margin: 20px 0; }
  .summary-card { background: #1e293b; border-radius: 12px; padding: 20px; flex: 1; text-align: center; }
  .summary-card .num { font-size: 48px; font-weight: bold; }
  .pass .num { color: #10b981; }
  .fail .num { color: #ef4444; }
  .skip .num { color: #f59e0b; }
  .total .num { color: #7c3aed; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #1e293b; padding: 10px; text-align: left; }
  td { padding: 8px 10px; border-bottom: 1px solid #1e293b; font-size: 13px; }
  tr.pass td { background: #0f2820; }
  tr.fail td { background: #2d1212; }
  tr.skip td { background: #2d2408; }
  .badge { padding: 3px 8px; border-radius: 100px; font-size: 11px; font-weight: bold; }
  .badge.pass { background: #10b981; color: #000; }
  .badge.fail { background: #ef4444; color: #fff; }
  .badge.skip { background: #f59e0b; color: #000; }
  .screenshot-entry { background: #1e293b; border-radius: 12px; padding: 16px; margin: 12px 0; page-break-inside: avoid; }
  .screenshot-entry img { width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #334155; }
  .api-info { background: #0f172a; border-radius: 8px; padding: 10px; margin: 8px 0; font-size: 12px; }
  .api-info.ok { border-left: 3px solid #10b981; }
  .api-info.err { border-left: 3px solid #ef4444; }
  .api-entry { background: #1e293b; border-radius: 8px; padding: 10px; margin: 6px 0; display: flex; align-items: flex-start; gap: 10px; }
  .api-entry.pass { border-left: 3px solid #10b981; }
  .api-entry.fail { border-left: 3px solid #ef4444; }
  .api-url { font-size: 12px; color: #94a3b8; }
  pre { font-size: 11px; color: #94a3b8; overflow: hidden; white-space: pre-wrap; word-break: break-all; }
  .ts { font-size: 11px; color: #64748b; margin: 0 0 8px; }
  .meta { color: #64748b; font-size: 13px; }
</style>
</head>
<body>
  <h1>🌱 GrowVio — E2E Test Report</h1>
  <p class="meta">Generated: ${timestamp} IST &nbsp;|&nbsp; Environment: dev</p>

  <div class="summary">
    <div class="summary-card total"><div class="num">${results.length}</div><div>Total</div></div>
    <div class="summary-card pass"><div class="num">${passed}</div><div>Passed</div></div>
    <div class="summary-card fail"><div class="num">${failed}</div><div>Failed</div></div>
    <div class="summary-card skip"><div class="num">${skipped}</div><div>Skipped</div></div>
  </div>

  <h2>Test Results</h2>
  <table>
    <tr><th>Test Name</th><th>Status</th><th>Duration</th><th>Error</th></tr>
    ${testRows}
  </table>

  <h2>Flow Screenshots + API Calls</h2>
  ${screenshotRows}
</body>
</html>`;

  // Write HTML
  const htmlPath = outputPath.replace('.pdf', '.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`📄 HTML report: ${htmlPath}`);

  // Convert to PDF using Playwright browser
  const browser = await chromium.launch();
  const pg = await browser.newPage();
  await pg.setContent(html, { waitUntil: 'networkidle' });
  await pg.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '15px', right: '15px' }
  });
  await browser.close();
  console.log(`📄 PDF report: ${outputPath}`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
