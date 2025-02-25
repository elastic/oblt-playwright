import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let apiKey = process.env.API_KEY;

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // workers: 4,
  reporter: [[process.env.CI ? 'json' : 'json'], ["json", { outputFile: "playwright-report/results.json" }]],
  timeout: 800000,
  expect: {timeout: 800000},

  use: {
    baseURL: process.env.KIBANA_HOST,
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
