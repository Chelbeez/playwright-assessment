# Plan — `playwright-assessment`

A living plan for the coffee-cart.app E2E suite: what exists, why it is shaped this way, what is left,
and the rules a contributor follows. Update the status column as work lands — this document is the
single source of truth for "how we do testing here".

---

## 1. Objective

Automate the order journey on <https://coffee-cart.app> (add product → promo pop-up → checkout → submit
payment → verify success) with a foundation a junior engineer can extend safely:

| Requirement                         | Where it is satisfied                                   |
| ----------------------------------- | ------------------------------------------------------- |
| Page Object Model                   | `src/pages/*`                                           |
| Playwright fixtures for setup/state | `src/fixtures/test.ts`                                  |
| Zero hard-coded sleeps              | lint rule in `eslint.config.mjs` + web-first assertions |
| Test data isolated from logic       | `src/data/*`                                            |
| GitHub Actions pipeline             | `.github/workflows/e2e.yml`                             |
| Bonus a — title translation         | `tests/e2e/translate.spec.ts`                           |
| Bonus b — right-click dialog        | `tests/e2e/context-menu.spec.ts`                        |
| Bonus c — 3rd-item promo            | `tests/e2e/promo.spec.ts`                               |

## 2. Status

| Phase | Scope                                                    | State   |
| ----- | -------------------------------------------------------- | ------- |
| 0     | Reconnaissance of the live app and its bundle            | ✅ done |
| 1     | Foundation: config, TypeScript, lint, format, data layer | ✅ done |
| 2     | Page objects + fixtures                                  | ✅ done |
| 3     | Core purchase flow specs                                 | ✅ done |
| 4     | Bonus features (a, b, c)                                 | ✅ done |
| 5     | CI pipeline, local verification, publishing              | ✅ done |
| 6     | Hardening backlog (§9)                                   | ⏳ open |

Current baseline: **51 tests**, all passing on Chromium, Firefox and WebKit, including the negative and
resilience paths added in the first hardening pass.

## 3. Architecture

```
tests/e2e/*.spec.ts        behaviour only — no selectors, no URLs, no literals
        │
src/fixtures/test.ts       injects page objects, pins the menu payload per test
        │
src/pages/*.ts             locators + intent methods + assertions (expect* helpers)
        │
src/data/*.ts              menu catalogue, customer factory, user-facing copy
```

**Why this split.** A spec should read like the business requirement. Anything that could change for a
reason unrelated to behaviour (a price, a CSS class, a route) lives in one layer, so a change has exactly
one place to land.

- **Page objects** own locators and expose intent (`cartPage.proceedToCheckout()`), never raw selectors.
- **Fixtures** remove `beforeEach` boilerplate and give every test a fresh context, hence an empty cart.
  The app keeps the cart in memory only, so a new context _is_ clean state — no cleanup code.
- **Data modules** keep magic strings out of specs and make the menu stub possible.

## 4. Locator strategy

Priority order, enforced by review:

1. `getByRole` with an accessible name
2. `getByLabel` (with `{ exact: true }` — see below)
3. the app's own `data-test` contract (`testIdAttribute` is configured)
4. CSS class — last resort, must carry a comment explaining why

Findings from recon that shaped the locators:

| Observation                                                                       | Consequence                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Cup graphic is a `div` with `aria-label="<coffee>"`                               | `getByLabel(name, { exact: true })` is the click target       |
| `getByLabel('Espresso')` also matches _Espresso Macchiato_ / _Espresso Con Panna_ | exact matching everywhere                                     |
| Cart page renders a hover preview with the same coffee names                      | rows anchored on `Remove all <name>`, unique to the table     |
| Payment modal is a `div`, but the inner form has `aria-label`                     | `getByRole('form', { name: 'Payment form' })` scopes it       |
| Promo overlay has no ARIA role                                                    | one documented CSS-class container, roles inside              |
| Right-click opens a native `<dialog>`                                             | `getByRole('dialog')`; `page.on('dialog')` does **not** apply |

## 5. Determinism

| Risk                                   | Mitigation                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Live catalogue changes                 | `/list.json` stubbed with the pinned fixture                                        |
| App's artificial `makeItSlow()` delay  | web-first assertions poll; no delay is written down                                 |
| Success snackbar disappears after 3.6s | assert immediately on the toast, not after navigating                               |
| Promo overlay intercepting clicks      | suites explicitly accept/decline before continuing                                  |
| Several coffees share a name prefix    | exact matching                                                                      |
| Shared state between tests             | new context per test; unique customer email per test                                |
| Catalogue API fails or is slow         | `stubMenu()` returns a 500 or injects latency; assertions wait on the real response |

**The rule:** if a test needs `waitForTimeout`, the framework is missing an assertion or a fixture. Fix the
framework, not the test. Lint enforces it (`playwright/no-wait-for-timeout` + a `no-restricted-syntax` ban on
`setTimeout`), so a "temporary" sleep cannot be merged.

## 6. CI strategy

| Trigger             | Browsers                  | Why                                                |
| ------------------- | ------------------------- | -------------------------------------------------- |
| `pull_request`      | Chromium                  | fast feedback on every push to a branch            |
| push to `main`      | Chromium, Firefox, WebKit | full engine coverage before it ships               |
| `workflow_dispatch` | full matrix               | on-demand investigation                            |
| nightly cron        | full matrix               | catches drift in the live site and browser updates |

`quality` job runs Prettier check, ESLint and `tsc --noEmit` in parallel with the e2e matrix. Reports,
traces and videos are uploaded on every run, including failures.

## 7. Conventions for contributors

- Import `test`/`expect` from `src/fixtures/test`, never from `@playwright/test` directly.
- Name asserting helpers `expect*` so lint recognises them as assertions.
- One behaviour per test; no shared mutable state between tests.
- No `waitForTimeout`, no `page.waitForSelector`, no `{ force: true }` — all three fail lint.
- Put new copy/prices in `src/data`, not in the spec.
- Prefer `expect(locator).toBeVisible()` over asserting on `isVisible()` return values.
- Run `npm run lint && npm run test:chromium` before opening a PR.

## 8. Risks

| Risk                                    | Impact                                      | Mitigation / next step                                                                                   |
| --------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Third-party site availability           | Suite fails for reasons outside our control | Add a `@smoke` tag and skip network-dependent jobs on outage; consider a containerised local build later |
| Translation dictionary is app-internal  | Bonus (a) test breaks if copy changes       | Assert "CJK characters present", not exact strings                                                       |
| Snackbar timeout (3.6s) on slow runners | Possible flake under heavy parallel load    | Assertion targets the toast first; if CI proves noisy, capture it via a response/state check             |
| Promo rule tied to cart count           | New promo thresholds change expected counts | Rule is centralised in the promo spec and derived from `COFFEE_MENU`                                     |
| Pricing changes in the live app         | Assertions drift                            | Menu is stubbed; update `src/data/menu.ts` deliberately                                                  |

## 9. Hardening backlog

Ordered by value per hour. Already landed in the hardening pass: negative checkout cases
(`checkout-guards.spec.ts`) and catalogue failure/latency coverage (`catalogue.spec.ts`).

| Priority | Item                                                                          | Notes                                             |
| -------- | ----------------------------------------------------------------------------- | ------------------------------------------------- |
| P1       | Tag suites (`@smoke`, `@regression`) and add a PR job that runs only `@smoke` | keeps PR feedback under a minute                  |
| P1       | Shard the matrix (`--shard=1/2`) once the suite exceeds ~3 minutes            | `strategy.matrix.shard`                           |
| P2       | Visual assertions on the cart table                                           | `toHaveScreenshot`, baselines per browser         |
| P2       | Accessibility smoke check (axe-core) on menu and cart                         | catches missing labels/roles                      |
| P3       | API-level setup for non-UI preconditions                                      | only worth it once a real API exists              |
| P3       | Report publishing (GitHub Pages or a dashboard)                               | artifacts are enough for now                      |
| P4       | Contract test against `/list.json` shape                                      | detects catalogue-schema drift before UI tests do |

## 10. Definition of done

A change is complete when:

- [ ] the spec reads as a business behaviour, with no selectors or literals in it;
- [ ] failures are actionable (assertion message names what was expected);
- [ ] no sleeps, no forced actions, no `only`;
- [ ] green locally on Chromium;
- [ ] green in CI on all three engines;
- [ ] traces are useful on failure (they are captured automatically on retry).
