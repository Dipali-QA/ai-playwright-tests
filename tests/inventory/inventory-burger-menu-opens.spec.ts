// spec: specs/inventory-plan.md (1.15)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('burger icon opens the side navigation panel @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.resetAppStateLink).toBeHidden();

    await inventoryPage.openBurgerMenu();
    await expect(inventoryPage.resetAppStateLink).toBeVisible();
  });
});
