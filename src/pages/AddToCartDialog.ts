import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Bonus (b): the native `<dialog>` opened by right-clicking a cup.
 *
 * Because this is a real `<dialog element>` opened with `showModal()`, it exposes the
 * `dialog` role — and Playwright's `dialog` *event* does not fire for it (that event is
 * for `alert`/`confirm`/`prompt`). Locator assertions are the right tool here.
 */
export class AddToCartDialog {
  readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('dialog');
  }

  async expectOpenFor(coffee: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toContainText(`Add ${coffee} to the cart?`);
  }

  async expectClosed(): Promise<void> {
    await expect(this.root).toBeHidden();
  }

  async confirm(): Promise<void> {
    await this.root.getByRole('button', { name: 'Yes', exact: true }).click();
  }

  async cancel(): Promise<void> {
    await this.root.getByRole('button', { name: 'No', exact: true }).click();
  }
}
