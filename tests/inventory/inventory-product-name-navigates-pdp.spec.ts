// spec: specs/inventory-plan.md (1.12)
import { test, expect } from '../../fixtures';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('clicking a product name navigates to the Product Detail page @regression', async ({ inventoryPage, productDetailPage }) => {
    await inventoryPage.goto();
    await inventoryPage.clickProductName('Sauce Labs Backpack');
    await productDetailPage.waitForReady();
    await expect(productDetailPage.productName).toHaveText('Sauce Labs Backpack');
  });
});
