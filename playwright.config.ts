import { defineConfig, devices } from '@playwright/test';
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
  workers: process.env.CI ? 1 : undefined,
  // workers: 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [[process.env.CI ? 'json' : 'json'], ["json", { outputFile: "playwright-report/results.json" }]],
  /* Timeouts */
  timeout: 400000,
  expect: {timeout: 400000},

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.KIBANA_HOST,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    testIdAttribute: 'data-test-subj',
    video: {
      mode: 'off',
      size: {width: 1920, height: 1200}},
    
    permissions: ["clipboard-read"],
  },

  projects: [
    {
      name: 'stateful_auth',
      testMatch: 'stateful.auth.ts',
      use: {
        viewport: {width: 1920, height: 1080},
        launchOptions: {
          logger: {
            isEnabled: () => true,
            log: (name, severity, message) => console.log(`[${severity}] ${name} ${message}`)
          }
        }
      }
    },
    {
      name: 'serverless_auth',
      testMatch: 'serverless.auth.ts',
      use: {
        testIdAttribute: 'data-test-id',
        viewport: {width: 1920, height: 1080},
        launchOptions: {
          logger: {
            isEnabled: () => true,
            log: (name, severity, message) => console.log(`[${severity}] ${name} ${message}`)
          }
        }
      },
    },
    {
      name: 'stateful_teardown',
      testMatch: 'stateful.teardown.setup.ts',
      use: {
        viewport: {width: 1920, height: 1080},
        storageState: STORAGE_STATE,
        testIdAttribute: 'data-test-subj',
        launchOptions: {
          logger: {
            isEnabled: () => true,
            log: (name, severity, message) => console.log(`[${severity}] ${name} ${message}`)
          }
        }
      },
    },
    {
      name: 'serverless_teardown',
      testMatch: 'serverless.teardown.setup.ts',
      use: {
        viewport: {width: 1920, height: 1080},
        storageState: STORAGE_STATE,
        testIdAttribute: 'data-test-subj',
        launchOptions: {
          logger: {
            isEnabled: () => true,
            log: (name, severity, message) => console.log(`[${severity}] ${name} ${message}`)
          }
        }
      },
    },
    {
      name: 'stateful',
      testMatch: '**\/*.stateful.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1200},
        storageState: STORAGE_STATE,
        launchOptions: {
          logger: {
            isEnabled: () => true,
            log: (name, severity, message) => console.log(`[${severity}] ${name} ${message}`)
          }
        },
      },
      dependencies: ['stateful_auth'],
      //teardown: 'stateful_teardown',
    },
    {
      name: 'serverless',
      testMatch: '**\/*.serverless.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1200},
        storageState: STORAGE_STATE,
        launchOptions: {
          logger: {
            isEnabled: () => true,
            log: (name, severity, message) => console.log(`[${severity}] ${name} ${message}`)
          }
        },
      },
      dependencies: ['serverless_auth'],
      //teardown: 'serverless_teardown',
    },
    {
      name: 'api',
      testMatch: '**\/*.api.spec.ts',
      use: {
        extraHTTPHeaders: {
          "accept": "application/json",
          "Authorization": apiKey,
          "Content-Type": "application/json;charset=UTF-8",
          "kbn-xsrf": "true",          
          "x-elastic-internal-origin": "kibana"
        },
      },
      dependencies: [],
    },
  ],
});
