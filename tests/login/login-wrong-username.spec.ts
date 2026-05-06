// spec: specs/login-plan.md (1.9)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('wrong username shows credentials-mismatch error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.wrongUsername);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.credentialsMismatch);
  });
});
