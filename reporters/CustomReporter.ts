
import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult
} from '@playwright/test/reporter';

import fs from 'fs';
import path from 'path';

class CustomReporter implements Reporter {
private results: {
  title: string;
  status: string;
  duration: number;
  error: string | undefined;
}[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message
    });
  }

  onEnd(result: FullResult) {
    const total = this.results.length;
    const passed = this.results.filter(t => t.status === 'passed').length;
    const failed = this.results.filter(t => t.status === 'failed').length;
    const skipped = this.results.filter(t => t.status === 'skipped').length;

    const report = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ImmverseAI Test Dashboard</title>

<style>
* { box-sizing: border-box; }

body {
  margin: 0;
  padding: 30px;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #151515, #292929);
  color: white;
}

h1 { color: #F48031; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.card {
  padding: 25px;
  border-radius: 16px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(12px);
}

.card h2 { color: #F48031; }

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255,255,255,0.08);
}

th, td {
  padding: 14px;
  border-bottom: 1px solid #555;
  text-align: left;
}

th { color: #F48031; }

.passed { color: #4ade80; }
.failed { color: #ff6b6b; }
.skipped { color: #facc15; }

.error {
  color: #ff9999;
  font-size: 12px;
}
</style>
</head>

<body>
<h1>ImmverseAI Automation Dashboard</h1>
<p>Playwright Test Execution Summary</p>

<div class="cards">
  <div class="card"><h2>${total}</h2>Total Tests</div>
  <div class="card"><h2>${passed}</h2>Passed</div>
  <div class="card"><h2>${failed}</h2>Failed</div>
  <div class="card"><h2>${skipped}</h2>Skipped</div>
  <div class="card"><h2>${result.duration} ms</h2>Duration</div>
</div>

<h2>Test Execution Details</h2>

<table>
<thead>
<tr>
<th>Test Case</th>
<th>Status</th>
<th>Duration</th>
<th>Error</th>
</tr>
</thead>
<tbody>
${this.results.map(test => `
<tr>
<td>${test.title}</td>
<td class="${test.status}">${test.status}</td>
<td>${test.duration} ms</td>
<td class="error">${test.error ?? '-'}</td>
</tr>
`).join('')}
</tbody>
</table>

</body>
</html>`;

    const reportDir = path.join(process.cwd(), 'reports');

    fs.mkdirSync(reportDir, { recursive: true });

    fs.writeFileSync(
      path.join(reportDir, 'index.html'),
      report,
      'utf-8'
    );

    console.log('Custom dashboard generated: reports/index.html');
  }
}

export default CustomReporter;
