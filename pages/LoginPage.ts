// pages/LoginPage.ts
import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { User, InvalidCredential } from '../types';

export class LoginPage extends BasePage {
  protected readonly path = '/';

  readonly usernameField:        Locator;
  readonly passwordField:        Locator;
  readonly loginButton:          Locator;
  readonly errorMessage:         Locator;
  readonly errorDismissButton:   Locator;
  readonly infoPanelUsernames:   Locator;
  readonly infoPanelPassword:    Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField      = page.getByPlaceholder('Username');
    this.passwordField      = page.getByPlaceholder('Password');
    this.loginButton        = page.getByRole('button', { name: 'Login' });
    this.errorMessage       = page.locator('[data-test="error"]');
    this.errorDismissButton = page.locator('[data-test="error"] button');
    this.infoPanelUsernames = page.locator('#login_credentials');
    this.infoPanelPassword  = page.locator('.login_password');
  }

  async waitForReady(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
  }

  async login(user: User): Promise<void> {
    await this.fillAndSubmit(user);
  }

  async submitWithCredentials(creds: InvalidCredential): Promise<void> {
    await this.fillAndSubmit(creds);
  }

  async submitEmptyForm(): Promise<void> {
    await this.loginButton.click();
  }

  async dismissError(): Promise<void> {
    await this.errorDismissButton.click();
  }

  private async fillAndSubmit(input: { username: string; password: string }): Promise<void> {
    await this.usernameField.fill(input.username);
    await this.passwordField.fill(input.password);
    await this.loginButton.click();
  }
}
