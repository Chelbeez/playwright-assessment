import { test as base, expect } from '@playwright/test';
import { COFFEE_MENU } from '../data/menu';
import { AddToCartDialog } from '../pages/AddToCartDialog';
import { CartPage } from '../pages/CartPage';
import { CheckoutDialog } from '../pages/CheckoutDialog';
import { MenuPage } from '../pages/MenuPage';
import { PromoDialog } from '../pages/PromoDialog';

/**
 * The only place tests should import `test`/`expect` from.
 *
 * Benefits for a junior contributor:
 *  - page objects arrive as typed fixtures, so a spec reads `await menuPage.addToCart('Mocha')`
 *    instead of constructing objects or repeating `beforeEach` boilerplate;
 *  - every test gets a fresh browser context (and therefore an empty cart) for free;
 *  - the menu payload is pinned, so assertions never break because the shop changed a price.
 */
export type Fixtures = {
  menuPage: MenuPage;
  cartPage: CartPage;
  checkoutDialog: CheckoutDialog;
  promoDialog: PromoDialog;
  addToCartDialog: AddToCartDialog;

  /**
   * Auto-fixture: serves a local copy of `GET /list.json`.
   * Registered before the test body runs, so it is always in place before navigation.
   */
  stubbedMenu: void;
};

export const test = base.extend<Fixtures>({
  stubbedMenu: [
    async ({ page }, use) => {
      await page.route('**/list.json', (route) => route.fulfill({ json: COFFEE_MENU }));
      await use();
    },
    { auto: true },
  ],

  menuPage: async ({ page }, use) => {
    await use(new MenuPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutDialog: async ({ page }, use) => {
    await use(new CheckoutDialog(page));
  },

  promoDialog: async ({ page }, use) => {
    await use(new PromoDialog(page));
  },

  addToCartDialog: async ({ page }, use) => {
    await use(new AddToCartDialog(page));
  },
});

export { expect };
