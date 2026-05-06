// spec: specs/inventory-plan.md (1.10)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('adding multiple products updates the cart badge to the correct total @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    await inventoryPage.addProductToCart('Sauce Labs Onesie');

    await expect(inventoryPage.cartBadge).toHaveText('3');
  });
});
