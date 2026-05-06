// spec: specs/inventory-plan.md (1.6)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('sorting by Price (low to high) re-orders products correctly @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.selectSort('lohi');
    expect(await inventoryPage.getProductPrices()).toEqual(testData.inventory.expectedPricesLowHigh);
  });
});
