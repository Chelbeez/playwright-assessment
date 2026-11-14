import { coffeeByName } from '../../src/data/menu';
import { test } from '../../src/fixtures/test';

/**
 * Bonus (b): right-clicking the cup opens a native `<dialog>` asking for confirmation.
 * This is a DOM dialog, not a browser `confirm()`, so no `page.on('dialog')` handler is
 * involved — the assertions below drive it directly.
 */
test.describe('Right-click add-to-cart dialog', () => {
  test('confirming adds the coffee and closes the dialog', async ({
    menuPage,
    addToCartDialog,
  }) => {
    const espresso = coffeeByName('Espresso');

    await menuPage.open();
    await menuPage.openAddToCartDialog(espresso.name);

    await addToCartDialog.expectOpenFor(espresso.name);
    await addToCartDialog.confirm();
    await addToCartDialog.expectClosed();

    await menuPage.expectCartCount(1);
  });

  test('cancelling leaves the cart empty', async ({ menuPage, addToCartDialog }) => {
    const mocha = coffeeByName('Mocha');

    await menuPage.open();
    await menuPage.openAddToCartDialog(mocha.name);

    await addToCartDialog.expectOpenFor(mocha.name);
    await addToCartDialog.cancel();
    await addToCartDialog.expectClosed();

    await menuPage.expectCartCount(0);
  });
});
