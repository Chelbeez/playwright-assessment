import { expect, type Locator, type Page } from '@playwright/test';
import type { Customer } from '../data/customer';

/**
 * The "Payment details" modal opened by the checkout button.
 *
 * It is a plain `<div class="modal">`, but the inner `<form aria-label="Payment form">`
 * carries an accessible name, which gives us `getByRole('form', { name: ... })` as a
 * semantic, styling-proof scope for the fields.
 */
export class CheckoutDialog {
  readonly heading: Locator;
  readonly form: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Payment details' });
    this.form = page.getByRole('form', { name: 'Payment form' });

    // The close control is an icon-only button whose text is a font glyph ("A-"), so it
    // has no meaningful accessible name. Scope it to the heading's container instead.
    this.closeButton = this.heading.locator('xpath=..').getByRole('button');
  }

  get nameInput(): Locator {
    return this.form.getByLabel('Name', { exact: true });
  }

  get emailInput(): Locator {
    return this.form.getByLabel('Email', { exact: true });
  }

  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.form).toBeVisible();
  }

  async expectHidden(): Promise<void> {
    await expect(this.heading).toBeHidden();
  }

  async fill(customer: Customer): Promise<void> {
    await this.nameInput.fill(customer.name);
    await this.emailInput.fill(customer.email);
  }

  /** Abandon checkout without submitting (the icon-only close control). */
  async dismiss(): Promise<void> {
    await this.closeButton.click();
    await this.expectHidden();
  }

  /**
   * Submitting runs the app's artificial `makeItSlow()` task. No wait is needed: the
   * click resolves once the handler returns and callers assert on the success snackbar,
   * which Playwright polls for automatically.
   */
  async submit(): Promise<void> {
    await this.form.getByRole('button', { name: 'Submit' }).click();
  }
}
