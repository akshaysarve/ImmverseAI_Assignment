
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 1 : 0,

  workers: 1,

  reporter: [
    ['list'],
    ['./reporters/CustomReporter.ts']
  ],

  timeout: 60000,

  expect: {
    timeout: 10000
  },

  use: {
    baseURL: 'https://parabank.parasoft.com/parabank/',
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
