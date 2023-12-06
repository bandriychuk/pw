/* eslint n/no-process-env: 0 */ // --> OFF
import dotenv from 'dotenv';
import * as path from 'path';
import { PlaywrightTestConfig, defineConfig, devices } from '@playwright/test';

const e2eProjects = [
  {
    use: { ...devices['Desktop Chrome'] },
    testDir: './playwright/tests/e2e/',
    name: 'chromium',
  },
];

const intProjects = [
  {
    testDir: './playwright/tests/integration',
    use: { ...devices['Desktop Chrome'] },
    name: 'chromium',
  },
];

const localReporters: PlaywrightTestConfig['reporter'] = [
  ['html', { outputFolder: 'playwright/test-results' }],
  ['list'],
];

const ciReporters: PlaywrightTestConfig['reporter'] = [
  ['list'],
  ['junit', { outputFile: 'playwright/build/test-results/reporter/results.xml' }],
  ['html', { outputFolder: 'playwright/test-results' }],
  [
    'allure-playwright',
    {
      environmentInfo: {
        E2E_NODE_VERSION: process.version,
        E2E_OS: process.platform,
      },
      outputFolder: './playwright/allure-results',
      suiteTitle: true,
      detail: true,
    },
  ],
];

dotenv.config({
  path: path.resolve(__dirname, process.env.E2E ? '.env.e2e' : '.env.int'),
});

const playwrightConfiguration = (configuration: PlaywrightTestConfig = {}): PlaywrightTestConfig => ({
  use: {
    testIdAttribute: 'data-automation',
    screenshot: 'only-on-failure',
    timezoneId: 'Europe/London',
    video: 'on',
    ignoreHTTPSErrors: true,
    actionTimeout: 45000,
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: !process.env.E2E
    ? {
        reuseExistingServer: false,
        command: 'pnpm dev',
        timeout: 120 * 1000,
        port: 3000,
      }
    : undefined,
  retries: process.env.CI ? parseInt(process.env.PLAYWRIGHT_RETRIES || '2') : 0,
  reporter: process.env.CI ? ciReporters : localReporters,
  projects: process.env.E2E ? e2eProjects : intProjects,
  workers: process.env.CI ? 4 : 4,
  expect: {
    timeout: 20_000,
  },
  globalTimeout: 60 * 10 * 1000,
  fullyParallel: true,
  timeout: 120 * 1000,
  ...configuration,
});

export default defineConfig(playwrightConfiguration());
