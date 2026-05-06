// spec: specs/login-plan.md (1.7)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('username provided with empty password shows password-required error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.emptyPassword);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.passwordRequired);
  });
});
