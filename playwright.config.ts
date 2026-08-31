import { defineConfig, devices } from '@playwright/test';
import { 
  API_KEY,
  ELASTICSEARCH_USER,
  ELASTICSEARCH_PASSWORD
  } from './src/env';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : 2,
  reporter: [['list', { printSteps: true }]],
  timeout: 300000,
  expect: {timeout: 180000},

  use: {
    browserName: 'chromium',
    baseURL: process.env.KIBANA_HOST,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    testIdAttribute: 'data-test-subj',
    video: {
      mode: 'off',
      size: {width: 1920, height: 1200}},
    
    permissions: ["clipboard-read"],
  },

  projects: [
    {
      name: 'preflight_check',
      testMatch: 'preflight-check.ts',
      dependencies: [],
    },
    {
      name: 'auth',
      testMatch: 'auth.ts',
      use: {
        viewport: {width: 1920, height: 1200},
      },
      dependencies: ['preflight_check'],
    },
    {
      name: 'walkthrough',
      testMatch: '**\/*.walkthrough.spec.ts',
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1200},
        storageState: STORAGE_STATE,
      },
      dependencies: ['auth'],
    },
    {
      name: 'journey',
      testMatch: '**\/*.journey.spec.ts',
      teardown: 'upload-report',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1200},
        storageState: STORAGE_STATE,
        // httpCredentials: {
        //   username: ELASTICSEARCH_USER,
        //   password: ELASTICSEARCH_PASSWORD,
        //   origin: new URL(process.env.KIBANA_HOST!).origin,
        // },
      },
      dependencies: ['auth'],
    },
    {
      name: 'upload-report',
      testMatch: 'upload-report.ts',
    },
    {
      name: 'api',
      testDir: './',
      testMatch: '**\/*.api.spec.ts',
      use: {
        extraHTTPHeaders: {
          "accept": "application/json",
          "Authorization": `ApiKey ${API_KEY}`,
          "Content-Type": "application/json;charset=UTF-8",
          "kbn-xsrf": "true",          
          "x-elastic-internal-origin": "kibana"
        },
      },
      dependencies: [],
    },
    {
      name: 'bb',
      testDir: process.env.PLAYWRIGHT_TEST_DIR,
      testMatch: '**\/*.bb.spec.ts',
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1200},
        storageState: STORAGE_STATE,
      },
      dependencies: ['auth'],
    }
  ],
});
