import { defineConfig, devices } from '@playwright/test';

/**
 * Point the suite at a local build or a staging deploy with `BASE_URL`.
 * Defaults to the live demo so a fresh clone runs without any setup.
 */
const baseURL = process.env.BASE_URL ?? 'https://coffee-cart.app';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // 45s leaves room for the app's deliberate `makeItSlow()` task on cold CI runners.
  timeout: 45_000,

  // Web-first assertions poll for up to 10s. This is not a sleep: it returns as soon
  // as the condition is met, and it is the only permitted way to wait.
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL,

    // The app exposes dedicated test hooks (`data-test="checkout"`), so wire them up
    // as the default `getByTestId` attribute.
    testIdAttribute: 'data-test',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
