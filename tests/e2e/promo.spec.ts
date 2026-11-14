import { coffeeByName } from '../../src/data/menu';
import { DISCOUNTED_COFFEE } from '../../src/data/messages';
import { expect, test } from '../../src/fixtures/test';

/**
 * Bonus (c): the promo pop-up appears when the cart count is a multiple of three.
 * The app rule is literally `cartCount > 0 && cartCount % 3 === 0`, so the boundaries
 * below are deterministic — no waiting, no retries.
 */
test.describe('Promo pop-up', () => {
  test('stays hidden for the first two coffees and appears on the third', async ({
    menuPage,
    promoDialog,
  }) => {
    const espresso = coffeeByName('Espresso');

    await menuPage.open();
    await menuPage.addToCart(espresso.name);
    await promoDialog.expectHidden();

    await menuPage.addToCart(espresso.name);
    await promoDialog.expectHidden();

    await menuPage.addToCart(espresso.name);
    await promoDialog.expectVisible();
  });

  test('accepting the offer adds the discounted mocha', async ({
    menuPage,
    cartPage,
    promoDialog,
  }) => {
    const espresso = coffeeByName('Espresso');
    const mocha = coffeeByName('Mocha');

    await menuPage.open();
    await menuPage.addToCart(espresso.name);
    await menuPage.addToCart(espresso.name);
    await menuPage.addToCart(mocha.name);

    await promoDialog.expectVisible();
    await promoDialog.accept();

    await menuPage.expectCartCount(4);
    await menuPage.openCart();

    await cartPage.expectLineItem(espresso.name, {
      quantity: 2,
      unitPrice: espresso.price,
      total: espresso.price * 2,
    });
    await cartPage.expectLineItem(mocha.name, {
      quantity: 1,
      unitPrice: mocha.price,
      total: mocha.price,
    });
    await cartPage.expectLineItem(DISCOUNTED_COFFEE, { quantity: 1, unitPrice: 4, total: 4 });
    await cartPage.expectTotal(espresso.price * 2 + mocha.price + 4);
  });

  test('declining the offer leaves the cart untouched', async ({
    menuPage,
    cartPage,
    promoDialog,
  }) => {
    const espresso = coffeeByName('Espresso');

    await menuPage.open();
    await menuPage.addToCart(espresso.name);
    await menuPage.addToCart(espresso.name);
    await menuPage.addToCart(espresso.name);

    await promoDialog.expectVisible();
    await promoDialog.decline();

    await menuPage.expectCartCount(3);
    await menuPage.openCart();
    await cartPage.expectLineItem(espresso.name, { quantity: 3, unitPrice: espresso.price });
    await cartPage.expectTotal(espresso.price * 3);

    // The promo item must never leak into the cart without consent.
    await expect(cartPage.lineItem(DISCOUNTED_COFFEE)).toHaveCount(0);
  });
});
