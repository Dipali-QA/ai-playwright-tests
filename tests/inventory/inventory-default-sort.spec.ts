// spec: specs/inventory-plan.md (1.4)
import { test, expect } from '../../fixtures';
import { testData } from '../../fixtures/testData';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.resetAppState();
  });

  test('default sort is Name (A to Z) @regression', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    expect(await inventoryPage.getProductNames()).toEqual(testData.inventory.expectedNamesAZ);
  });
});
