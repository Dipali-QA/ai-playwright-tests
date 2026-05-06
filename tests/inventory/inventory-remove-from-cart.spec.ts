// spec: specs/inventory-plan.md (1.9)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('removing a product toggles the button back to Add and hides the cart badge @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeProductFromCart('Sauce Labs Bike Light');

    const card = inventoryPage.productCard('Sauce Labs Bike Light');
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Remove' })).toBeHidden();
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
