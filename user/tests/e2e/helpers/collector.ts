import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { generatePDFReport } from './pdf-report';
import * as path from 'path';

const REPORTS_DIR = path.resolve(process.cwd(), 'tests/e2e/reports');

type ResultEntry = {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  duration?: number;
};

class GrowvioReporter implements Reporter {
  private results: ResultEntry[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({
      name: test.title,
      status: result.status === 'passed' ? 'pass'
             : result.status === 'skipped' ? 'skip' : 'fail',
      error: result.errors[0]?.message?.substring(0, 200),
      duration: result.duration
    });
  }

  async onEnd() {
    const outputPath = path.join(
      REPORTS_DIR,
      `GrowVio_TestFlow_${new Date().toISOString().split('T')[0]}.pdf`
    );
    await generatePDFReport(this.results, outputPath);
    console.log(`\n✅ PDF report saved: ${outputPath}`);
  }
}

export default GrowvioReporter;
