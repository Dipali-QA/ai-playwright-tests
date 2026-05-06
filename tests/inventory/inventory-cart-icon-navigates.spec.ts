// spec: specs/inventory-plan.md (1.14)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('cart icon navigates to the Cart page @smoke', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.openCart();
    await cartPage.waitForReady();
    expect(cartPage.getUrl()).toContain('/cart.html');
  });
});
