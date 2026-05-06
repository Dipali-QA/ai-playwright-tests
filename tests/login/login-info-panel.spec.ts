// spec: specs/login-plan.md (1.4)
import { test, expect } from '../../fixtures';

test.describe('Login', () => {
  test('info panel lists accepted usernames and shared password @smoke', async ({ loginPage }) => {
    await loginPage.goto();

    await expect(loginPage.infoPanelUsernames).toBeVisible();
    await expect.soft(loginPage.infoPanelUsernames).toContainText('standard_user');
    await expect.soft(loginPage.infoPanelUsernames).toContainText('locked_out_user');
    await expect.soft(loginPage.infoPanelUsernames).toContainText('problem_user');
    await expect.soft(loginPage.infoPanelUsernames).toContainText('performance_glitch_user');
    await expect.soft(loginPage.infoPanelUsernames).toContainText('error_user');
    await expect.soft(loginPage.infoPanelUsernames).toContainText('visual_user');

    await expect(loginPage.infoPanelPassword).toBeVisible();
    await expect(loginPage.infoPanelPassword).toContainText('secret_sauce');
  });
});
