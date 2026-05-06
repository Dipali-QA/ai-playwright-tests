// spec: specs/login-plan.md (1.12)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('excessively long username shows credentials-mismatch error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.exceededLength);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.credentialsMismatch);
  });
});
