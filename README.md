# playwright-assessment

A Playwright + TypeScript end-to-end framework for [coffee-cart.app](https://coffee-cart.app/), built so a
team of junior engineers can add tests without breaking things or introducing flakiness.

The suite covers the full order journey — **add product → handle the promo pop-up → checkout → submit
payment → verify success** — plus the three special features on the site (title translation, right-click
add-to-cart dialog, and the every-third-item promo).

```
33 tests · chromium / firefox / webkit · ~30s wall clock
```

---

## Quick start

```bash
npm ci                      # install dependencies
npx playwright install      # download browsers (one-time)
npm test                    # run everything, all browsers
```

Node 20+ is required.

## Scripts

| Script                  | What it does                                    |
| ----------------------- | ----------------------------------------------- |
| `npm test`              | Full suite across installed browsers            |
| `npm run test:chromium` | Fast single-browser run (what CI does on PRs)   |
| `npm run test:headed`   | Watch the browser while tests run               |
| `npm run test:ui`       | Playwright's time-travel UI mode                |
| `npm run report`        | Open the last HTML report                       |
| `npm run lint`          | ESLint, including the no-hardcoded-sleeps guard |
| `npm run typecheck`     | `tsc --noEmit`                                  |
| `npm run format`        | Prettier write                                  |

Point the suite somewhere else with `BASE_URL=https://staging.example.com npm test`.

## Project layout

```
src/
  pages/            Page objects — one per screen or dialog
    BasePage.ts       shared header, cart badge, snackbar
    MenuPage.ts       menu grid, translation, right-click
    CartPage.ts       line items, quantity controls, totals
    CheckoutDialog.ts payment form
    PromoDialog.ts    every-third-item offer
    AddToCartDialog.ts right-click confirmation
  fixtures/
    test.ts         the only export specs import: `test` and `expect`
  data/
    menu.ts         typed copy of the app's catalogue + money helpers
    customer.ts     per-test customer factory
    messages.ts     user-visible copy asserted by tests
tests/
  e2e/              specs, grouped by behaviour
```

## Coverage

| Area               | Spec                   | Notes                                                              |
| ------------------ | ---------------------- | ------------------------------------------------------------------ |
| Purchase journey   | `purchase.spec.ts`     | Required flow, including a run where the promo interrupts checkout |
| Cart               | `cart.spec.ts`         | Empty state, quantity stepper, remove-all                          |
| Promo pop-up       | `promo.spec.ts`        | Fires on the 3rd item only; accept and decline paths               |
| Title translation  | `translate.spec.ts`    | Bonus (a) — double-click, plus every menu item                     |
| Right-click dialog | `context-menu.spec.ts` | Bonus (b) — confirm and cancel                                     |

## Design decisions

**Page Object Model.** Every screen and dialog has a class that owns its locators and exposes intent-level
methods (`cartPage.proceedToCheckout()`), never raw selectors. Specs read like the business flow.

**Locators are semantic first.** Roles and accessible names (`getByRole`, `getByLabel`) do the heavy lifting.
Two deliberate exceptions, both commented in code:

- the checkout button uses the app's own `data-test="checkout"` hook;
- the promo overlay has no ARIA role, so its container is located by class while everything inside it is
  still found by role.

**Exact matching where names collide.** `getByLabel('Espresso')` also matches _Espresso Macchiato_ and
_Espresso Con Panna_, so name lookups are always `{ exact: true }`.

**Fixtures, not `beforeEach`.** `src/fixtures/test.ts` injects page objects into every test and pins the menu
payload. A test gets a fresh browser context (and therefore an empty cart) automatically.

**Test data is separate from test logic.** Prices and names come from `src/data/menu.ts`; customer details
come from `buildCustomer()`, which generates a unique email per test. The menu payload is stubbed at the
network layer, so a price change in the live shop cannot silently invalidate assertions.

**Zero hard-coded sleeps.** There is no `waitForTimeout` anywhere, and lint fails the build if one appears —
the rule is enforced, not just documented. Waiting is done with web-first assertions and auto-waiting.
`playwright.config.ts` sets a 10s _poll ceiling_, not a delay: assertions return the moment they pass.

## Adding a test

1. Open the relevant page object in `src/pages/` and add an intent-level method if one is missing.
2. Write the spec under `tests/e2e/`, importing `test`/`expect` from `src/fixtures/test`.
3. Run `npm run lint && npm run test:chromium`.

Because assertions live in page objects, every asserting helper is prefixed with `expect*`
(`expectCartCount`, `expectLineItem`, …). ESLint uses that prefix to recognise a test as having assertions.

## CI

`.github/workflows/e2e.yml` runs two jobs:

- **quality** — Prettier check, ESLint, and `tsc --noEmit`.
- **e2e** — Playwright against a browser matrix. Pull requests run Chromium for a fast signal; pushes to
  `main`, manual runs, and the nightly schedule run all three engines. The HTML report, traces, and videos
  are uploaded as artifacts on every run, pass or fail.

## Troubleshooting

| Symptom                                        | Fix                                                    |
| ---------------------------------------------- | ------------------------------------------------------ |
| `browserType.launch: Executable doesn't exist` | `npx playwright install`                               |
| Missing Linux system libraries                 | `npx playwright install --with-deps`                   |
| Tests hit a different environment              | Check `BASE_URL`                                       |
| Debugging a flake                              | `npx playwright show-trace test-results/.../trace.zip` |
