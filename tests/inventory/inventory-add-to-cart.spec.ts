// spec: specs/inventory-plan.md (1.8)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('adding a product toggles the button to Remove and updates the cart badge to 1 @smoke @critical', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addProductToCart('Sauce Labs Backpack');

    const card = inventoryPage.productCard('Sauce Labs Backpack');
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeHidden();
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});
