// spec: specs/login-plan.md (1.3)
import { test, expect } from '../../fixtures';

test.describe('Login', () => {
  test('login page renders all required UI elements @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
