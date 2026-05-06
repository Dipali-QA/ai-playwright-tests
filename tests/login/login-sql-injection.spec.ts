// spec: specs/login-plan.md (1.11)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('SQL-injection-style input shows credentials-mismatch error (no special handling) @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.sqlInjection);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.credentialsMismatch);
  });
});
