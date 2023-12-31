import { defineConfig, devices } from '@playwright/test';
import { constants } from 'buffer';
import path from 'path';

require('dotenv').config();
let apiKey = process.env.API_KEY;

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
  timeout: 300000,
  expect: {timeout: 300000},

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
      name: 'stateful_setup',
      testMatch: 'stateful.setup.ts',
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
      name: 'stateful_teardown',
      testMatch: 'stateful.teardown.setup.ts',
      use: {
        viewport: {width: 1920, height: 1080},
        storageState: STORAGE_STATE,
        testIdAttribute: 'data-test-subj',
      },
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
      name: 'stateful',
      testMatch: '**\/*.stateful.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1080},
        storageState: STORAGE_STATE,
      },
      dependencies: ['stateful_setup'],
      //teardown: 'stateful_teardown',
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
      //teardown: 'serverless_teardown',
    },
    {
      name: 'api',
      testMatch: 'api_tests.spec.ts',
      use: {
        extraHTTPHeaders: {
          "Content-Type": "application/json;charset=UTF-8",
          "accept": "application/json",
          "kbn-xsrf": "true",
          "Authorization": apiKey,
        },
      },
      dependencies: [],
    },
  ],
});
