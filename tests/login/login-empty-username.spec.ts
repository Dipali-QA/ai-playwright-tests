// spec: specs/login-plan.md (1.6)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('empty username submit shows username-required error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.emptyUsername);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.usernameRequired);
  });
});
