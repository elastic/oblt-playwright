import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';
import logger from '../src/logger';
import { TRACE_FILE, uploadFile } from '../src/helpers/kibana-files';
import { outputDirectory } from '../src/helpers/reporter';

type Report = { trace_dir?: string };

// Traces are written after the journey's report, so they are uploaded here and
// the link is added to the report before it goes to Elasticsearch.
async function uploadTraces() {
  if (!fs.existsSync(outputDirectory)) {
    return;
  }

  const reports = fs.readdirSync(outputDirectory).filter((name) => /^20.*\.json$/.test(name));

  for (const name of reports) {
    const reportPath = path.join(outputDirectory, name);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8')) as Report;
    const tracePath = report.trace_dir && path.join(report.trace_dir, 'trace.zip');
    if (!tracePath || !fs.existsSync(tracePath)) {
      continue;
    }

    const fileName = name.replace(/\.json$/, '.zip');
    const url = await uploadFile(logger, fs.readFileSync(tracePath), fileName, TRACE_FILE);
    if (url) {
      fs.writeFileSync(reportPath, JSON.stringify({ ...report, trace_url: url }, null, 2));
    }
  }
}

// External command success replaces a Playwright assertion.
// eslint-disable-next-line playwright/expect-expect
test('Upload reports to Elasticsearch', async () => {
  await uploadTraces();
  execFileSync(
    'bash',
    [path.resolve(__dirname, '../src/utils/upload-to-es.sh')],
    { stdio: 'inherit' },
  );
});
