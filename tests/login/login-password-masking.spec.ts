// spec: specs/login-plan.md (1.5)
import { test, expect } from '../../fixtures';

test.describe('Login', () => {
  test('password field masks entered characters @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.passwordField).toHaveAttribute('type', 'password');
  });
});
