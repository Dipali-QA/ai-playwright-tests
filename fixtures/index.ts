// fixtures/index.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';

type Fixtures = {
  loginPage:         LoginPage;
  inventoryPage:     InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage:          CartPage;
};

/**
 * Custom Playwright test export with all page objects pre-wired as fixtures.
 * Tests import { test, expect } from this module — never from '@playwright/test'.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect } from '@playwright/test';
