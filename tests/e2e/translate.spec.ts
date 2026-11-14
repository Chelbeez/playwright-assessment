import { ORDERABLE_COFFEES, coffeeByName } from '../../src/data/menu';
import { expect, test } from '../../src/fixtures/test';

/** Any CJK character proves the title switched to the Chinese translation. */
const CHINESE_TEXT = /[\u4e00-\u9fff]/;

/**
 * Bonus (a): double-clicking a coffee title translates it to Chinese; double-clicking
 * again toggles back. The cup's `aria-label` never changes, which is why the page object
 * can still find the card after the title text has been swapped.
 */
test.describe('Title translation', () => {
  test('double-click translates a title to Chinese and back', async ({ menuPage }) => {
    const espresso = coffeeByName('Espresso');

    await menuPage.open();
    await expect(menuPage.title(espresso.name)).toContainText(espresso.name);

    await menuPage.translateTitle(espresso.name);
    await expect(menuPage.title(espresso.name)).toHaveText(CHINESE_TEXT);

    await menuPage.translateTitle(espresso.name);
    await expect(menuPage.title(espresso.name)).toContainText(espresso.name);
  });

  test('every coffee on the menu has a Chinese translation', async ({ menuPage }) => {
    await menuPage.open();

    for (const coffee of ORDERABLE_COFFEES) {
      await menuPage.translateTitle(coffee.name);
      await expect(menuPage.title(coffee.name), `${coffee.name} should be translated`).toHaveText(
        CHINESE_TEXT,
      );
    }
  });
});
