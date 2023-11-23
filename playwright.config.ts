import { defineConfig, devices } from '@playwright/test';
import { constants } from 'buffer';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  //workers: process.env.CI ? 1 : undefined,
  workers: 3,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Timeouts */
  timeout: 100000,
  expect: {timeout: 100000},

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.ELASTIC_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    testIdAttribute: 'data-test-subj',
    video: {
      mode: 'off',
      size: {width: 1920, height: 1080}},
    
    permissions: ["clipboard-read"],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'ess_setup',
      testMatch: 'ess.setup.ts',
    },
    {
      name: 'serverless_setup',
      testMatch: 'serverless.setup.ts',
      use: {
        testIdAttribute: 'data-test-id',
        viewport: {width: 1920, height: 1080},
      }
    },
    {
      name: 'serverless_teardown',
      testMatch: 'serverless.teardown.setup.ts',
      use: {
        viewport: {width: 1920, height: 1080},
        storageState: STORAGE_STATE,
        testIdAttribute: 'data-test-subj',
      },
    },
    {
      name: 'ess',
      testMatch: '**\/*.ess.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1080},
        storageState: STORAGE_STATE,
      },
      dependencies: ['ess_setup'],
    },
    {
      name: 'serverless',
      testMatch: '**\/*.serverless.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1080},
        storageState: STORAGE_STATE,
      },
      dependencies: ['serverless_setup'],
      teardown: 'serverless_teardown',
    },
  ],
});
