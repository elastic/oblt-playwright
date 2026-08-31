import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { test } from '@playwright/test';

// External command success replaces a Playwright assertion.
// eslint-disable-next-line playwright/expect-expect
test('Upload reports to Elasticsearch', () => {
  execFileSync(
    'bash',
    [path.resolve(__dirname, '../src/utils/upload-to-es.sh')],
    { stdio: 'inherit' },
  );
});
