// spec: specs/login-plan.md (1.13)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('locked-out user with correct password shows locked-out error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(testData.users.lockedUser);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.userLockedOut);
  });
});
