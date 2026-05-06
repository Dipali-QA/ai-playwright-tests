// tests/seed.spec.ts
import { test } from '../fixtures';

test('seed', async ({ page }) => {
  // The Planner runs this test to bootstrap the environment:
  // global setup, auth state, and all fixtures are initialised here.
  // baseURL is set in playwright.config.ts — do not import env here.
  // Do not add assertions or tags — this is a pure navigation seed.
  await page.goto('/');
});
