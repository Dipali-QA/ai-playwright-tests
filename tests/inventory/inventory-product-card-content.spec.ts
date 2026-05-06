// spec: specs/inventory-plan.md (1.3)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('each product card displays image, name, description and price @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();

    for (const product of testData.inventory.expectedProducts) {
      const card = inventoryPage.productCard(product.name);
      await expect.soft(card.locator('.inventory_item_img img')).toBeVisible();
      await expect.soft(card.locator('[data-test="inventory-item-name"]')).toHaveText(product.name);
      await expect.soft(card.locator('[data-test="inventory-item-desc"]')).not.toHaveText('');
      await expect.soft(card.locator('[data-test="inventory-item-price"]')).toHaveText(`$${product.price.toFixed(2)}`);
    }
  });
});
