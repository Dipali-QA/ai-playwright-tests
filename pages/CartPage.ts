// pages/CartPage.ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText('Your Cart', { exact: true });
  }

  async waitForReady(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }
}
