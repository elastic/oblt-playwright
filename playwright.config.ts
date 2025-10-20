import { defineConfig, devices } from '@playwright/test';
import { API_KEY } from './src/env.ts';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [['list', { printSteps: true }]],
  timeout: 1000000,
  expect: {timeout: 1000000},

  use: {
    browserName: 'chromium',
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
      name: 'preflight_check',
      testMatch: 'preflight_check.ts',
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
      name: 'kibana',
      testMatch: '**\/*.kibana.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {width: 1920, height: 1200},
        storageState: STORAGE_STATE,
      },
      dependencies: ['auth'],
    },
    {
      name: 'api',
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
  ],
});
