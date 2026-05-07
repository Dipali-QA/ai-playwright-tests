// Consolidated: covers specs/login-plan.md (1.5, 1.6, 1.7, 1.8, 1.10, 1.11)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login — Validation', () => {
  test('empty username shows username-required error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.emptyUsername);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.usernameRequired);
  });

  test('username provided with empty password shows password-required error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.emptyPassword);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.passwordRequired);
  });

  test('both fields empty shows username-required error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitEmptyForm();
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.usernameRequired);
  });

  test('username exceeding max length is handled gracefully @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.exceededLength);
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('SQL-injection-style input shows credentials-mismatch error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.sqlInjection);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.credentialsMismatch);
  });
});
