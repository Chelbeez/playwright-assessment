import type { Page } from '@playwright/test';
import { COFFEE_MENU, type Coffee } from '../data/menu';

/** The app loads its catalogue from this endpoint on mount. */
export const MENU_ENDPOINT = '**/list.json';

export type MenuStub = {
  /** Catalogue to serve instead of the pinned default. */
  menu?: readonly Coffee[];
  /** HTTP status to return; any non-200 makes the app fall back to an empty menu. */
  status?: number;
  /** Artificial response latency, in milliseconds. */
  latencyMs?: number;
};

/**
 * Controls the catalogue response for a single test.
 *
 * Playwright matches routes last-registered-first, so calling this inside a test
 * overrides the pinned stub installed by the `stubbedMenu` auto-fixture.
 */
export async function stubMenu(page: Page, stub: MenuStub = {}): Promise<void> {
  const { menu = COFFEE_MENU, status = 200, latencyMs = 0 } = stub;

  await page.route(MENU_ENDPOINT, async (route) => {
    if (latencyMs > 0) {
      // Deliberate server latency: this is the condition under test, not a test
      // synchronisation wait. Tests themselves still contain no timers at all.
      // eslint-disable-next-line no-restricted-syntax
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
    }

    if (status !== 200) {
      await route.fulfill({ status, body: 'catalogue unavailable' });
      return;
    }

    await route.fulfill({ json: [...menu] });
  });
}
