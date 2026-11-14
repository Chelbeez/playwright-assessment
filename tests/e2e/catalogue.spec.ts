import { ORDERABLE_COFFEES, type Coffee } from '../../src/data/menu';
import { stubMenu } from '../../src/fixtures/menuStub';
import { expect, test } from '../../src/fixtures/test';

/**
 * Resilience of the menu against the catalogue API.
 *
 * These tests override the pinned stub from the `stubbedMenu` auto-fixture, which is the
 * whole point of keeping the network contract in one helper: a test can describe an
 * unhappy backend in three lines, without touching a single selector.
 */
test.describe('Menu catalogue', () => {
  test('degrades to an empty menu when the catalogue request fails', async ({ menuPage, page }) => {
    await stubMenu(page, { status: 500 });

    const response = page.waitForResponse('**/list.json');
    await menuPage.goto();

    expect((await response).status()).toBe(500);

    // No coffees, no crash: the shell still renders and the cart is still usable.
    await expect(page.getByRole('heading', { level: 4 })).toHaveCount(0);
    await menuPage.expectCartCount(0);
  });

  test('renders exactly the catalogue the API returns', async ({ menuPage, page }) => {
    const customMenu: Coffee[] = [
      { name: 'Test Roast', price: 3, recipe: [{ name: 'espresso', quantity: 100 }] },
    ];

    await stubMenu(page, { menu: customMenu });
    await menuPage.open();

    // One item in, one item out — no assumptions about the production catalogue.
    await expect(page.getByRole('heading', { level: 4 })).toHaveCount(1);
    await expect(menuPage.title('Test Roast')).toContainText('Test Roast');

    await menuPage.addToCart('Test Roast');
    await menuPage.expectCartCount(1);
  });

  test('waits for a slow catalogue without any hard-coded delay', async ({ menuPage, page }) => {
    const latencyMs = 1500;
    await stubMenu(page, { latencyMs });

    const startedAt = Date.now();
    await menuPage.open();
    const elapsed = Date.now() - startedAt;

    // open() asserts the first menu heading is visible, and that can only happen after
    // the delayed response lands. The lower bound proves the wait really was observed.
    await expect(page.getByRole('heading', { level: 4 })).toHaveCount(ORDERABLE_COFFEES.length);
    expect(elapsed).toBeGreaterThanOrEqual(latencyMs - 300);
  });
});
