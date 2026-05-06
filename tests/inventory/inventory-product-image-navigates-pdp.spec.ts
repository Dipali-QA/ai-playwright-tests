// spec: specs/inventory-plan.md (1.13)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('clicking a product image navigates to the Product Detail page @regression', async ({ inventoryPage, productDetailPage }) => {
    await inventoryPage.goto();
    await inventoryPage.clickProductImage('Sauce Labs Fleece Jacket');
    await productDetailPage.waitForReady();
    await expect(productDetailPage.productName).toHaveText('Sauce Labs Fleece Jacket');
  });
});
