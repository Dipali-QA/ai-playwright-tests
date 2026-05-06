// pages/InventoryPage.ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  readonly heading:             Locator;
  readonly productCards:        Locator;
  readonly productNames:        Locator;
  readonly productDescriptions: Locator;
  readonly productPrices:       Locator;
  readonly sortDropdown:        Locator;
  readonly cartIcon:            Locator;
  readonly cartBadge:           Locator;
  readonly burgerMenuButton:    Locator;
  readonly sideMenu:            Locator;
  readonly resetAppStateLink:   Locator;
  readonly closeMenuButton:     Locator;

  constructor(page: Page) {
    super(page);
    this.heading             = page.getByText('Products', { exact: true });
    this.productCards        = page.locator('[data-test="inventory-item"]');
    this.productNames        = page.locator('[data-test="inventory-item-name"]');
    this.productDescriptions = page.locator('[data-test="inventory-item-desc"]');
    this.productPrices       = page.locator('[data-test="inventory-item-price"]');
    this.sortDropdown        = page.locator('[data-test="product-sort-container"]');
    this.cartIcon            = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge           = page.locator('[data-test="shopping-cart-badge"]');
    this.burgerMenuButton    = page.getByRole('button', { name: 'Open Menu' });
    this.sideMenu            = page.locator('.bm-menu-wrap');
    this.resetAppStateLink   = page.getByRole('link', { name: 'Reset App State' });
    this.closeMenuButton     = page.getByRole('button', { name: 'Close Menu' });
  }

  async waitForReady(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  productCard(name: string): Locator {
    return this.productCards.filter({ hasText: name });
  }

  async selectSort(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    return this.productNames.allInnerTexts();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.productPrices.allInnerTexts();
    return texts.map(t => Number(t.replace('$', '')));
  }

  async addProductToCart(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProductFromCart(name: string): Promise<void> {
    await this.productCard(name).getByRole('button', { name: 'Remove' }).click();
  }

  async clickProductName(name: string): Promise<void> {
    await this.productCard(name).locator('[data-test="inventory-item-name"]').click();
  }

  async clickProductImage(name: string): Promise<void> {
    await this.productCard(name).locator('.inventory_item_img a').click();
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async openBurgerMenu(): Promise<void> {
    await this.burgerMenuButton.click();
    await expect(this.resetAppStateLink).toBeVisible();
  }

  async closeBurgerMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await expect(this.resetAppStateLink).toBeHidden();
  }

  async resetAppState(): Promise<void> {
    await this.openBurgerMenu();
    await this.resetAppStateLink.click();
    await this.closeBurgerMenu();
  }

  async getCartBadgeCount(): Promise<number> {
    if (await this.cartBadge.isVisible()) {
      return Number(await this.cartBadge.innerText());
    }
    return 0;
  }
}
