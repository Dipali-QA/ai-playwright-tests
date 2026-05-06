// pages/BasePage.ts
import { Page } from '@playwright/test';

/**
 * BasePage — every page class extends this.
 *
 * Each subclass MUST declare:
 *   - `path`: URL relative to baseURL, beginning with '/'.
 *   - `waitForReady()`: a locator-based wait that proves the page is loaded.
 *
 * `goto()` chains `waitForReady()` automatically — every page proves it
 * loaded without leaking selectors into tests.
 */
export abstract class BasePage {
  /** URL path relative to baseURL — every subclass declares its own. Must begin with '/'. */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /**
   * Subclass must implement: wait for an element that uniquely proves
   * this page has loaded, e.g.:
   *   await expect(this.heading).toBeVisible();
   */
  abstract waitForReady(): Promise<void>;

  // ─── Navigation ─────────────────────────────────────────────

  /** Navigate to this page's URL and wait until it is ready. */
  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    if (!this.path.startsWith('/')) {
      throw new Error(
        `${this.constructor.name}.path must begin with '/' — got '${this.path}'.`
      );
    }
    await this.page.goto(this.path, options);
    await this.waitForReady();
  }

  /** Reload the current page. */
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.waitForReady();
  }

  /** Browser back-button — caller decides what page is now active. */
  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  /** Browser forward-button — caller decides what page is now active. */
  async goForward(): Promise<void> {
    await this.page.goForward({ waitUntil: 'domcontentloaded' });
  }

  // ─── Readiness ──────────────────────────────────────────────

  /** Wait for the DOM to parse — fast, suits server-rendered pages. */
  async waitForDomReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Diagnostics ────────────────────────────────────────────

  /** Current URL of the underlying page. */
  getUrl(): string {
    return this.page.url();
  }

  /** Document title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** True when the browser is on this page's URL pattern. */
  isCurrent(): boolean {
    return this.page.url().includes(this.path);
  }
}
