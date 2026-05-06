// spec: specs/login-plan.md (1.17)
import { test, expect } from '../../fixtures';

test.describe('Login', () => {
  test('direct nav to /checkout-step-one.html while unauthenticated redirects to login @regression', async ({ page, loginPage }) => {
    await page.goto('/checkout-step-one.html');
    await expect(page).not.toHaveURL(/\/checkout-step-one\.html$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
