// spec: specs/inventory-plan.md (1.2)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('inventory page displays all six products after login @smoke', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.productCards).toHaveCount(6);
  });
});
