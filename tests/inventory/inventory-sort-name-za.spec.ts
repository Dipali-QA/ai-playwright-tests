// spec: specs/inventory-plan.md (1.5)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('sorting by Name (Z to A) re-orders products correctly @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.selectSort('za');
    expect(await inventoryPage.getProductNames()).toEqual(testData.inventory.expectedNamesZA);
  });
});
