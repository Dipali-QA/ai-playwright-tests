// Consolidated: covers specs/login-plan.md (1.12, 1.13, 1.14, 1.15)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login — UI & Behaviour', () => {
  test('password field masks characters @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.passwordField).toHaveAttribute('type', 'password');
  });

  test('error message can be dismissed with the X button @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.wrongUsername);
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.dismissError();
    await expect(loginPage.errorMessage).not.toBeVisible();
  });

  test('info panel displays accepted usernames @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.infoPanelUsernames).toBeVisible();
  });

  test('info panel displays shared password @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.infoPanelPassword).toBeVisible();
  });

  test('login page renders all core UI elements @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.usernameField).toBeVisible();
    await expect(loginPage.passwordField).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });
});
