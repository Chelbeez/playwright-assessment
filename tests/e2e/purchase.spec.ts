import { buildCustomer } from '../../src/data/customer';
import { coffeeByName } from '../../src/data/menu';
import { SUCCESS_MESSAGE } from '../../src/data/messages';
import { expect, test } from '../../src/fixtures/test';

test.describe('Purchase journey', () => {
  test('adds a coffee, pays and shows the success confirmation', async ({
    menuPage,
    cartPage,
    checkoutDialog,
    page,
  }) => {
    const coffee = coffeeByName('Cappuccino');
    const customer = buildCustomer();

    await menuPage.open();
    await menuPage.addToCart(coffee.name);
    await menuPage.expectCartCount(1);

    await menuPage.openCart();
    await cartPage.expectLineItem(coffee.name, {
      quantity: 1,
      unitPrice: coffee.price,
      total: coffee.price,
    });
    await cartPage.expectTotal(coffee.price);

    await cartPage.proceedToCheckout();
    await checkoutDialog.expectVisible();
    await checkoutDialog.fill(customer);
    await checkoutDialog.submit();

    await checkoutDialog.expectHidden();
    await menuPage.expectSnackbar(SUCCESS_MESSAGE);

    // The app returns to the menu with an emptied cart after a successful order.
    await expect(page).toHaveURL(/\/$/);
    await menuPage.expectCartCount(0);
  });

  test('handles the promo pop-up mid-flow and still completes checkout', async ({
    menuPage,
    cartPage,
    checkoutDialog,
    promoDialog,
  }) => {
    const espresso = coffeeByName('Espresso');
    const mocha = coffeeByName('Mocha');

    await menuPage.open();
    await menuPage.addToCart(espresso.name);
    await menuPage.addToCart(espresso.name);

    // The third coffee triggers the promotional offer; decline it and carry on.
    await menuPage.addToCart(mocha.name);
    await promoDialog.expectVisible();
    await promoDialog.decline();

    await menuPage.expectCartCount(3);
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
    await cartPage.expectTotal(espresso.price * 2 + mocha.price);

    await cartPage.proceedToCheckout();
    await checkoutDialog.expectVisible();
    await checkoutDialog.fill(buildCustomer());
    await checkoutDialog.submit();

    await menuPage.expectSnackbar(SUCCESS_MESSAGE);
  });
});
