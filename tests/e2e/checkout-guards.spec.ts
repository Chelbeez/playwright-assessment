import { buildCustomer } from '../../src/data/customer';
import { coffeeByName } from '../../src/data/menu';
import { SUCCESS_MESSAGE } from '../../src/data/messages';
import { expect, test } from '../../src/fixtures/test';

/**
 * Negative paths for checkout.
 *
 * Happy-path coverage cannot show that guard rails work: these tests assert that the
 * browser's own validation blocks submission and that abandoning the dialog leaves the
 * cart untouched (i.e. no partial order state leaks out of the modal).
 */
test.describe('Checkout guards', () => {
  test('refuses to submit an empty payment form', async ({
    menuPage,
    cartPage,
    checkoutDialog,
    page,
  }) => {
    const coffee = coffeeByName('Espresso');

    await menuPage.open();
    await menuPage.addToCart(coffee.name);
    await menuPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutDialog.expectVisible();

    await checkoutDialog.submit();

    // The dialog stays open, nothing is ordered, and the cart is not cleared.
    await checkoutDialog.expectVisible();
    await expect(page.getByText(SUCCESS_MESSAGE, { exact: true })).toBeHidden();
    await cartPage.expectCartCount(1);
    await cartPage.expectLineItem(coffee.name, { quantity: 1, unitPrice: coffee.price });
  });

  test('rejects a malformed email address', async ({ menuPage, cartPage, checkoutDialog }) => {
    const coffee = coffeeByName('Americano');

    await menuPage.open();
    await menuPage.addToCart(coffee.name);
    await menuPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutDialog.expectVisible();

    await checkoutDialog.fill(buildCustomer({ email: 'not-an-email' }));
    await checkoutDialog.submit();

    await checkoutDialog.expectVisible();
    await expect(checkoutDialog.emailInput).toHaveJSProperty('validity.valid', false);
    await cartPage.expectCartCount(1);
  });

  test('dismissing the payment dialog keeps the cart intact', async ({
    menuPage,
    cartPage,
    checkoutDialog,
  }) => {
    const coffee = coffeeByName('Cafe Latte');

    await menuPage.open();
    await menuPage.addToCart(coffee.name);
    await menuPage.openCart();
    await cartPage.proceedToCheckout();
    await checkoutDialog.expectVisible();

    await checkoutDialog.dismiss();

    await cartPage.expectCartCount(1);
    await cartPage.expectLineItem(coffee.name, { quantity: 1, unitPrice: coffee.price });
    await cartPage.expectTotal(coffee.price);
  });
});
