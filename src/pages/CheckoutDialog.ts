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

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Payment details' });
    this.form = page.getByRole('form', { name: 'Payment form' });
  }

  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.form).toBeVisible();
  }

  async expectHidden(): Promise<void> {
    await expect(this.heading).toBeHidden();
  }

  async fill(customer: Customer): Promise<void> {
    await this.form.getByLabel('Name', { exact: true }).fill(customer.name);
    await this.form.getByLabel('Email', { exact: true }).fill(customer.email);
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
