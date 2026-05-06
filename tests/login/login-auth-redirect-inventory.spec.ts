// spec: specs/login-plan.md (1.15)
import { test, expect } from '../../fixtures';

test.describe('Login', () => {
  test('direct nav to /inventory.html while unauthenticated redirects to login @regression', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(page).not.toHaveURL(/\/inventory\.html$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
