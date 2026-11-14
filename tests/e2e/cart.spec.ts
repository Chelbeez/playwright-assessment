import { coffeeByName } from '../../src/data/menu';
import { test } from '../../src/fixtures/test';

test.describe('Cart', () => {
  test('shows an empty state when nothing has been added', async ({ menuPage, cartPage }) => {
    await menuPage.open();
    await menuPage.openCart();

    await cartPage.expectEmpty();
    await cartPage.expectCartCount(0);
  });

  test('quantity controls and remove-all keep the cart in sync', async ({ menuPage, cartPage }) => {
    const espresso = coffeeByName('Espresso');

    await menuPage.open();
    await menuPage.addToCart(espresso.name);
    await menuPage.openCart();

    await cartPage.expectLineItem(espresso.name, { quantity: 1, unitPrice: espresso.price });
    await cartPage.expectTotal(espresso.price);

    await cartPage.increaseQuantity(espresso.name);
    await cartPage.expectLineItem(espresso.name, { quantity: 2, unitPrice: espresso.price });
    await cartPage.expectTotal(espresso.price * 2);

    await cartPage.decreaseQuantity(espresso.name);
    await cartPage.expectLineItem(espresso.name, { quantity: 1, unitPrice: espresso.price });

    await cartPage.removeItem(espresso.name);
    await cartPage.expectEmpty();
    await cartPage.expectCartCount(0);
  });
});
