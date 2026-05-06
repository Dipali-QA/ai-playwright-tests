// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  timeout: 30 * 1000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI
    ? Number(process.env.WORKERS ?? 2)
    : undefined,
  outputDir: './test-results',
  reporter: [
    ['list'],
    ['html',              { outputFolder: 'reports/html',          open: 'never' }],
    ['junit',             { outputFile:   'reports/junit/results.xml' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],
  use: {
    baseURL: env.baseUrl,
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace:      'retain-on-failure',
    video:      'retain-on-failure',
  },
  projects: [
    // --- Core projects (always enabled) ---
    {
      // Runs global.setup.ts once before authenticated projects
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      // Login tests run without saved auth state — fresh browser every time.
      // Intentionally NOT depending on 'setup' — login tests must NOT
      // inherit storageState. See Rule C5 in CLAUDE.md.
      name: 'login-tests',
      testMatch: /tests[\\/]login[\\/].*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },
    {
      // Default regression/smoke browser.
      //
      // testIgnore excludes login specs so they don't double-run here
      // under saved auth — they belong only to the 'login-tests' project
      // which runs them on a fresh browser (Rule C5).
      //
      // tests/seed.spec.ts is INTENTIONALLY NOT excluded — the Planner
      // agent runs it under this project to bootstrap into the
      // authenticated app (storageState makes `page.goto('/')` land on
      // the post-login page). It also doubles as a quick smoke check
      // that auth state is still valid.
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: /tests[\\/]login[\\/].*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
    },

    // --- Optional cross-browser projects ---
    // Enable explicitly when the SRS or product team requires them.
    // Pattern is identical — copy and adjust device.
    // {
    //   name: 'firefox',
    //   dependencies: ['setup'],
    //   use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' },
    // },
    // {
    //   name: 'mobile-chrome',
    //   dependencies: ['setup'],
    //   use: { ...devices['Pixel 7'], storageState: '.auth/user.json' },
    // },
  ],
});
