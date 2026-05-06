// spec: specs/inventory-plan.md (1.11)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('cart badge is hidden when the cart is empty on initial load @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
