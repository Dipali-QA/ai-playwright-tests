// spec: specs/login-plan.md (1.8)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Login', () => {
  test('both fields empty shows username-required error (FR-LOGIN-05 precedence) @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitEmptyForm();
    await expect(loginPage.errorMessage).toHaveText(testData.errorMessages.usernameRequired);
  });
});
