// pages/ProductDetailPage.ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  protected readonly path = '/inventory-item.html';

  readonly backToProductsButton: Locator;
  readonly productName:          Locator;
  readonly productPrice:         Locator;

  constructor(page: Page) {
    super(page);
    this.backToProductsButton = page.getByRole('button', { name: 'Back to products' });
    this.productName          = page.locator('[data-test="inventory-item-name"]');
    this.productPrice         = page.locator('[data-test="inventory-item-price"]');
  }

  async waitForReady(): Promise<void> {
    await expect(this.backToProductsButton).toBeVisible();
  }

  async goto(): Promise<void> {
    throw new Error(
      'ProductDetailPage is reachable only via the inventory page (FR-INV-06). ' +
      'Navigate by calling inventoryPage.clickProductName(name) or clickProductImage(name).'
    );
  }
}
