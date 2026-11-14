import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Shared chrome rendered on every route: the header and the global snackbar.
 *
 * Page objects extend this class, so cart-count and toast assertions exist in exactly
 * one place. Nothing here is page-specific and nothing here reaches into a subclass.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  get cartLink(): Locator {
    return this.page.getByRole('link', { name: 'Cart page' });
  }

  get menuLink(): Locator {
    return this.page.getByRole('link', { name: 'Menu page' });
  }

  /** The header renders the count as `cart (n)`, so assert the whole label. */
  async expectCartCount(quantity: number): Promise<void> {
    await expect(this.cartLink).toHaveText(`cart (${quantity})`);
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/\/cart$/);
  }

  async openMenu(): Promise<void> {
    await this.menuLink.click();
    await expect(this.page).toHaveURL(/\/$/);
  }

  async expectSnackbar(message: string): Promise<void> {
    await expect(this.page.getByText(message, { exact: true })).toBeVisible();
  }
}
