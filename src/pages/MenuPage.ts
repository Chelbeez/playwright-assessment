import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The coffee menu (`/`).
 *
 * Locator notes for contributors:
 *  - The cup graphic is a `div` carrying `aria-label="<coffee name>"`. It is the whole
 *    click target, and it is the only element whose label is exactly the coffee name.
 *  - `getByLabel('Espresso')` without `exact` also matches "Espresso Macchiato" and
 *    "Espresso Con Panna", so every lookup here is exact.
 *  - Each coffee lives in a list item, so `card()` scopes title/price lookups and keeps
 *    them working after a title is translated to Chinese.
 */
export class MenuPage extends BasePage {
  static readonly path = '/';

  /** Navigate without assuming the catalogue loaded (used by resilience specs). */
  async goto(): Promise<void> {
    await this.page.goto(MenuPage.path);
  }

  async open(): Promise<void> {
    await this.goto();
    await expect(this.page.getByRole('heading', { level: 4 }).first()).toBeVisible();
  }

  /** The clickable cup for a coffee (also the right-click target). */
  cup(name: string): Locator {
    return this.page.getByLabel(name, { exact: true });
  }

  card(name: string): Locator {
    return this.page.getByRole('listitem').filter({ has: this.cup(name) });
  }

  /** The `<h4>` holding "Name + price". Its text changes when translated. */
  title(name: string): Locator {
    return this.card(name).getByRole('heading', { level: 4 });
  }

  async addToCart(name: string): Promise<void> {
    await this.cup(name).click();
  }

  /** Bonus (a): double-clicking the title translates it to Chinese (and back). */
  async translateTitle(name: string): Promise<void> {
    await this.title(name).dblclick();
  }

  /** Bonus (b): right-clicking the cup opens a native add-to-cart dialog. */
  async openAddToCartDialog(name: string): Promise<void> {
    await this.cup(name).click({ button: 'right' });
  }

  async expectVisible(): Promise<void> {
    await expect(this.cup('Espresso')).toBeVisible();
  }
}
