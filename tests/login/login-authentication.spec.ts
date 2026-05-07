// Consolidated: covers specs/login-plan.md (1.1, 1.2, 1.3, 1.4)
import { test, expect} from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login — Authentication', () => {
  test('standard user logs in successfully @smoke @critical', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(testData.users.validUser);
    await expect(inventoryPage.heading).toBeVisible();
  });

  test('locked-out user sees locked-account error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(testData.users.lockedUser);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.lockedOut);
  });

  test('wrong username shows credentials-mismatch error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.wrongUsername);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.credentialsMismatch);
  });

  test('wrong password shows credentials-mismatch error @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitWithCredentials(testData.invalidCredentials.wrongPassword);
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.credentialsMismatch);
  });
});
