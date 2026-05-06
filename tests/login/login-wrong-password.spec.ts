// spec: specs/login-plan.md (1.10)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('valid username with wrong password shows credentials-mismatch error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.wrongPassword);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.credentialsMismatch);
  });
});
