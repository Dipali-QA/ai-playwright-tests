// spec: specs/login-plan.md (1.2)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('standard user logs in successfully @smoke @critical', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(testData.users.validUser);
    await expect(inventoryPage.heading).toBeVisible();
  });
});
