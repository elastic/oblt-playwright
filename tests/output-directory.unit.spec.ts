import { expect, test } from '@playwright/test';

// env.ts reads process.env at import time, so each case loads a fresh copy.
function resolveOutputDirectory(env: { CI?: string; REPORT_DIR?: string }): string {
  const saved = { CI: process.env.CI, REPORT_DIR: process.env.REPORT_DIR };
  const modulePath = require.resolve('oblt-playwright/env');
  try {
    for (const [key, value] of Object.entries(env)) process.env[key] = value;
    for (const key of Object.keys(saved)) if (!(key in env)) delete process.env[key];
    delete require.cache[modulePath];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require(modulePath) as typeof import('oblt-playwright/env')).OUTPUT_DIRECTORY;
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    delete require.cache[modulePath];
  }
}

test.describe('output directory', () => {
  test('an explicit REPORT_DIR wins when CI is true', () => {
    expect(resolveOutputDirectory({ CI: 'true', REPORT_DIR: '/tmp/bb-report' })).toBe('/tmp/bb-report');
  });

  test('an explicit REPORT_DIR is used when CI is not set', () => {
    expect(resolveOutputDirectory({ REPORT_DIR: '/tmp/bb-report' })).toBe('/tmp/bb-report');
  });

  test('CI without REPORT_DIR uses the GitHub Actions workspace', () => {
    expect(resolveOutputDirectory({ CI: 'true' })).toBe('/home/runner/work/oblt-playwright/');
  });

  test('an empty REPORT_DIR is treated as unset', () => {
    expect(resolveOutputDirectory({ CI: 'true', REPORT_DIR: '' })).toBe('/home/runner/work/oblt-playwright/');
  });

  test('defaults to ./playwright-report locally', () => {
    expect(resolveOutputDirectory({})).toBe('./playwright-report');
  });
});
