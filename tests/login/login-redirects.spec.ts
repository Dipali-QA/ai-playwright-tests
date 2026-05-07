// Consolidated: covers specs/login-plan.md (1.16, 1.17, 1.18)
import { test, expect } from '../../fixtures';

test.describe('Login — Auth Redirects', () => {
  test('direct nav to /cart.html while unauthenticated redirects to login @regression', async ({ page, loginPage }) => {
    await page.goto('/cart.html');
    await expect(page).not.toHaveURL(/\/cart\.html$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('direct nav to /checkout-step-one.html while unauthenticated redirects to login @regression', async ({ page, loginPage }) => {
    await page.goto('/checkout-step-one.html');
    await expect(page).not.toHaveURL(/\/checkout-step-one\.html$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('direct nav to /inventory.html while unauthenticated redirects to login @regression', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(page).not.toHaveURL(/\/inventory\.html$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
