import { expect, type Locator } from '@playwright/test';
import { money } from '../data/menu';
import { BasePage } from './BasePage';

export type LineItemExpectation = {
  quantity: number;
  unitPrice: number;
  total?: number;
};

/**
 * The cart (`/cart`).
 *
 * The `Pay` component also renders a hover preview of the cart, which contains the same
 * coffee names. Every row lookup is therefore anchored on the "Remove all <name>" button,
 * which only exists in the cart table. Plain `getByText('Espresso')` would be ambiguous.
 */
export class CartPage extends BasePage {
  static readonly path = '/cart';

  /** The app ships `data-test="checkout"`; that is a contract, not a styling detail. */
  get checkoutButton(): Locator {
    return this.page.getByTestId('checkout');
  }

  get emptyMessage(): Locator {
    return this.page.getByText('No coffee, go add some.', { exact: true });
  }

  lineItem(name: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByRole('button', { name: `Remove all ${name}`, exact: true }) });
  }

  async expectLineItem(name: string, expectation: LineItemExpectation): Promise<void> {
    const row = this.lineItem(name);

    await expect(row).toBeVisible();
    await expect(row).toContainText(name);
    await expect(row).toContainText(`${money(expectation.unitPrice)} x ${expectation.quantity}`);

    if (expectation.total !== undefined) {
      await expect(row).toContainText(money(expectation.total));
    }
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible();
  }

  async expectTotal(amount: number): Promise<void> {
    await expect(this.checkoutButton).toHaveText(`Total: ${money(amount)}`);
  }

  async increaseQuantity(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `Add one ${name}`, exact: true }).click();
  }

  async decreaseQuantity(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `Remove one ${name}`, exact: true }).click();
  }

  async removeItem(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `Remove all ${name}`, exact: true }).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
