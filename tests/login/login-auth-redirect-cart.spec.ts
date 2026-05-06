// spec: specs/login-plan.md (1.16)
import { test, expect } from '../../fixtures';

test.describe('Login', () => {
  test('direct nav to /cart.html while unauthenticated redirects to login @regression', async ({ page, loginPage }) => {
    await page.goto('/cart.html');
    await expect(page).not.toHaveURL(/\/cart\.html$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
