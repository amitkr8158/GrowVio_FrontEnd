import {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestRecord {
  title: string;
  status: string;
  duration: number;
  error?: string;
  screenshots: string[];
  suite: string;
}

class PDFReporter implements Reporter {
  private results: TestRecord[] = [];
  private startTime: Date = new Date();

  onTestEnd(test: TestCase, result: TestResult) {
    const screenshots = result.attachments
      .filter(a => a.name === 'screenshot')
      .map(a => a.path || '');

    this.results.push({
      title:       test.title,
      status:      result.status,
      duration:    result.duration,
      error:       result.error?.message?.substring(0, 500), // cap length
      screenshots,
      suite:       test.parent.title,
    });
  }

  async onEnd(_result: FullResult) {
    const passed   = this.results.filter(r => r.status === 'passed').length;
    const failed   = this.results.filter(r => r.status === 'failed').length;
    const skipped  = this.results.filter(r => r.status === 'skipped').length;
    const total    = this.results.length;
    const duration = Math.round((Date.now() - this.startTime.getTime()) / 1000);

    const html = this.generateHTML(passed, failed, skipped, total, duration);
    const dir  = 'tests/e2e/reports';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, 'growvio-test-report.html'), html, 'utf-8');
    console.log('\n📊 GrowVio Report → tests/e2e/reports/growvio-test-report.html');
    console.log(`✅ Passed: ${passed}  ❌ Failed: ${failed}  ⏭️ Skipped: ${skipped}  Total: ${total} | ${duration}s`);
  }

  private generateHTML(
    passed: number,
    failed: number,
    skipped: number,
    total: number,
    duration: number,
  ): string {
    const scorePercent = total > 0 ? Math.round((passed / total) * 100) : 0;
    const scoreColor   = scorePercent >= 80 ? '#16a34a' :
                         scorePercent >= 50 ? '#d97706' : '#dc2626';
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const env  = process.env.E2E_BASE_URL || 'https://dev.growvio.in';

    const suites = [...new Set(this.results.map(r => r.suite))];

    const suiteHTML = suites.map(suite => {
      const tests       = this.results.filter(r => r.suite === suite);
      const suitePassed = tests.filter(r => r.status === 'passed').length;
      const suiteTotal  = tests.length;

      const testRows = tests.map(t => {
        const icon  = t.status === 'passed' ? '✅' :
                      t.status === 'failed' ? '❌' : '⏭️';
        const bgCol = t.status === 'passed' ? '#f0fdf4' :
                      t.status === 'failed' ? '#fff1f2' : '#fefce8';
        const errorHtml = t.error ? `
          <div style="background:#fff5f5;border-left:3px solid #dc2626;
               padding:8px 12px;margin-top:8px;border-radius:4px;
               font-family:monospace;font-size:11px;color:#7f1d1d;
               white-space:pre-wrap;word-break:break-all;line-height:1.5">
            ${t.error.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>` : '';
        const ssHtml = t.screenshots.length > 0 ? `
          <div style="margin-top:6px;font-size:11px;color:#6b7280">
            📸 ${t.screenshots.length} screenshot(s) saved
          </div>` : '';

        return `
          <tr style="background:${bgCol}">
            <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #f1f5f9">
              <span style="font-weight:500">${icon} ${t.title.replace(/</g, '&lt;')}</span>
              ${errorHtml}${ssHtml}
            </td>
            <td style="padding:10px;text-align:center;width:110px;border-bottom:1px solid #f1f5f9;
                       font-size:12px;font-weight:600;
                       color:${t.status === 'passed' ? '#16a34a' : t.status === 'failed' ? '#dc2626' : '#92400e'}">
              ${t.status.toUpperCase()}
            </td>
            <td style="padding:10px;text-align:center;width:70px;border-bottom:1px solid #f1f5f9;
                       font-size:12px;color:#6b7280">
              ${(t.duration / 1000).toFixed(1)}s
            </td>
          </tr>`;
      }).join('');

      const headerBg = suitePassed === suiteTotal ? '#16a34a' :
                       suitePassed > 0 ? '#d97706' : '#dc2626';

      return `
        <div style="margin-bottom:28px;border-radius:12px;overflow:hidden;
             box-shadow:0 1px 4px rgba(0,0,0,0.08);border:1px solid #e2e8f0">
          <div style="background:#1e293b;color:white;padding:14px 18px;
               display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:15px;font-weight:600">${suite}</span>
            <span style="background:${headerBg};padding:4px 14px;
                   border-radius:20px;font-size:12px;font-weight:600">
              ${suitePassed}/${suiteTotal} passed
            </span>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:8px 14px;text-align:left;font-size:11px;
                           text-transform:uppercase;letter-spacing:0.05em;
                           color:#94a3b8;border-bottom:2px solid #e2e8f0">Test Case</th>
                <th style="padding:8px;text-align:center;font-size:11px;
                           text-transform:uppercase;letter-spacing:0.05em;
                           color:#94a3b8;border-bottom:2px solid #e2e8f0;width:110px">Status</th>
                <th style="padding:8px;text-align:center;font-size:11px;
                           text-transform:uppercase;letter-spacing:0.05em;
                           color:#94a3b8;border-bottom:2px solid #e2e8f0;width:70px">Time</th>
              </tr>
            </thead>
            <tbody>${testRows}</tbody>
          </table>
        </div>`;
    }).join('');

    const bugList = this.results
      .filter(r => r.status === 'failed')
      .map((t, i) => `
        <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:10px;
             padding:16px;margin-bottom:14px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="background:#dc2626;color:white;border-radius:50%;min-width:26px;
                   height:26px;display:flex;align-items:center;justify-content:center;
                   font-size:12px;font-weight:700;margin-top:1px">${i + 1}</div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:600;color:#7f1d1d;margin-bottom:4px">
                ${t.title.replace(/</g, '&lt;')}
              </div>
              <div style="font-size:12px;color:#6b7280;margin-bottom:8px">
                Suite: ${t.suite}
              </div>
              ${t.error ? `
                <div style="font-family:monospace;font-size:11px;color:#991b1b;
                     background:#fff;padding:10px;border-radius:6px;
                     border:1px solid #fecaca;white-space:pre-wrap;
                     word-break:break-all;line-height:1.5">
                  ${t.error.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>` : ''}
            </div>
          </div>
        </div>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GrowVio — E2E Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      line-height: 1.6;
    }
    @media print {
      body { background: white; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div style="max-width:920px;margin:0 auto;padding:32px 16px">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);
         border-radius:16px;padding:36px;margin-bottom:28px;color:white;text-align:center">
      <div style="font-size:52px;margin-bottom:10px">📚</div>
      <h1 style="font-size:26px;font-weight:700;margin-bottom:6px;letter-spacing:-0.5px">
        GrowVio — Automated QA Report
      </h1>
      <p style="font-size:13px;opacity:0.6;margin-bottom:4px">${date} (IST)</p>
      <p style="font-size:13px;opacity:0.6">Environment: ${env}</p>
    </div>

    <!-- SCORE CARDS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px">
      <div style="background:white;border-radius:12px;padding:20px;text-align:center;
           box-shadow:0 1px 3px rgba(0,0,0,0.08);border:2px solid ${scoreColor}">
        <div style="font-size:38px;font-weight:800;color:${scoreColor}">${scorePercent}%</div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;
                    color:#64748b;margin-top:4px;font-weight:600">Overall Score</div>
      </div>
      <div style="background:#f0fdf4;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:38px;font-weight:800;color:#16a34a">${passed}</div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;
                    color:#166534;margin-top:4px;font-weight:600">Passed</div>
      </div>
      <div style="background:#fff1f2;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:38px;font-weight:800;color:#dc2626">${failed}</div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;
                    color:#7f1d1d;margin-top:4px;font-weight:600">Failed</div>
      </div>
      <div style="background:#f8fafc;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:38px;font-weight:800;color:#475569">${duration}s</div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;
                    color:#64748b;margin-top:4px;font-weight:600">Duration</div>
      </div>
    </div>

    <!-- GUIDE FOR NON-TECHNICAL READERS -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;
         padding:20px 24px;margin-bottom:28px">
      <h2 style="font-size:15px;font-weight:600;color:#92400e;margin-bottom:8px">
        📖 How to read this report
      </h2>
      <p style="font-size:13px;color:#78350f;line-height:1.8">
        This report was generated by an automated robot that opened the GrowVio website in a
        real Chrome browser, clicked through every feature exactly like a real user, and took
        a screenshot at every step. <strong>✅ Green = working correctly.</strong>
        <strong>❌ Red = broken and needs a developer to fix it.</strong>
        The "Bug List" section at the bottom summarises every issue with the exact error
        message — share it directly with the engineering team.
      </p>
    </div>

    <!-- TEST RESULTS -->
    <h2 style="font-size:17px;font-weight:700;margin-bottom:16px;color:#0f172a">
      🧪 Test Results by Feature
    </h2>
    ${suiteHTML}

    <!-- BUG LIST or ALL PASS -->
    ${failed > 0 ? `
    <div class="page-break">
    <h2 style="font-size:17px;font-weight:700;margin:32px 0 16px;color:#dc2626">
      🐛 Bug List — ${failed} issue${failed > 1 ? 's' : ''} found
    </h2>
    ${bugList}
    </div>` : `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;
         padding:28px;text-align:center;margin-top:28px">
      <div style="font-size:40px;margin-bottom:10px">🎉</div>
      <h2 style="font-size:18px;font-weight:700;color:#15803d">
        All ${total} tests passed — No bugs found!
      </h2>
      <p style="font-size:13px;color:#166534;margin-top:6px">
        GrowVio is working correctly across all tested flows.
      </p>
    </div>`}

    <!-- FOOTER -->
    <div style="text-align:center;padding:32px 0 16px;font-size:12px;color:#94a3b8">
      GrowVio Automated Test Suite &bull; Powered by Playwright &bull; ${date}
      <br><br>
      <button class="no-print"
        onclick="window.print()"
        style="background:#1e293b;color:white;border:none;padding:10px 20px;
               border-radius:8px;cursor:pointer;font-size:13px;font-weight:600">
        🖨️ Save as PDF
      </button>
    </div>

  </div>
</body>
</html>`;
  }
}

export default PDFReporter;
