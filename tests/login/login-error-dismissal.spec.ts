// spec: specs/login-plan.md (1.14)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('error message can be dismissed via the X icon @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.wrongPassword);
    await expect(loginPage.errorMessage).toBeVisible();

    await loginPage.dismissError();
    await expect(loginPage.errorMessage).toBeHidden();
  });
});
