import { expect, type Locator, type Page } from '@playwright/test';
import { PROMO_MESSAGE } from '../data/messages';

/**
 * Bonus (c): the promotional Mocha pop-up shown when the cart count hits a multiple of 3.
 *
 * The overlay is a `div.promo` with no ARIA role, so the container is the one place in
 * this framework that uses a CSS class. Every assertion and action inside it still uses
 * accessible names, so copy/layout changes surface as clear failures rather than silently
 * passing.
 */
export class PromoDialog {
  readonly root: Locator;
  readonly acceptButton: Locator;
  readonly declineButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('div.promo');
    this.acceptButton = page.getByRole('button', { name: 'Yes, of course!' });
    this.declineButton = page.getByRole('button', { name: "Nah, I'll skip." });
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toContainText(PROMO_MESSAGE);
    await expect(this.acceptButton).toBeVisible();
    await expect(this.declineButton).toBeVisible();
  }

  async expectHidden(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  /** Adds "(Discounted) Mocha" to the cart and closes the pop-up. */
  async accept(): Promise<void> {
    await this.acceptButton.click();
    await this.expectHidden();
  }

  async decline(): Promise<void> {
    await this.declineButton.click();
    await this.expectHidden();
  }
}
