/**
 * Menu fixture for https://coffee-cart.app.
 *
 * This is a copy of the app's own `GET /list.json` payload. Tests stub that request
 * with this data (see `src/fixtures/test.ts`), which means:
 *   - the suite never depends on live catalogue changes or network latency;
 *   - expected names and prices live in one typed place instead of being sprinkled
 *     through specs as magic strings.
 */

export type Ingredient = {
  name: string;
  quantity: number;
};

export type Coffee = {
  name: string;
  price: number;
  discounted?: boolean;
  recipe: Ingredient[];
};

export const COFFEE_MENU: readonly Coffee[] = [
  { name: 'Espresso', price: 10, recipe: [{ name: 'espresso', quantity: 30 }] },
  {
    name: 'Espresso Macchiato',
    price: 12,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'milk foam', quantity: 15 },
    ],
  },
  {
    name: 'Cappuccino',
    price: 19,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'steamed milk', quantity: 20 },
      { name: 'milk foam', quantity: 50 },
    ],
  },
  {
    name: 'Mocha',
    price: 8,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'chocolate syrup', quantity: 20 },
      { name: 'steamed milk', quantity: 25 },
      { name: 'whipped cream', quantity: 25 },
    ],
  },
  {
    name: 'Flat White',
    price: 18,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'steamed milk', quantity: 50 },
    ],
  },
  {
    name: 'Americano',
    price: 7,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'water', quantity: 70 },
    ],
  },
  {
    name: 'Cafe Latte',
    price: 16,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'steamed milk', quantity: 50 },
      { name: 'milk foam', quantity: 20 },
    ],
  },
  {
    name: 'Espresso Con Panna',
    price: 14,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'whipped cream', quantity: 15 },
    ],
  },
  {
    name: 'Cafe Breve',
    price: 15,
    recipe: [
      { name: 'espresso', quantity: 25 },
      { name: 'steamed milk', quantity: 30 },
      { name: 'steamed cream', quantity: 30 },
      { name: 'milk foam', quantity: 15 },
    ],
  },
  {
    // Only ever added by the promo dialog; the menu grid filters it out.
    name: '(Discounted) Mocha',
    price: 4,
    discounted: true,
    recipe: [
      { name: 'espresso', quantity: 30 },
      { name: 'chocolate syrup', quantity: 20 },
      { name: 'steamed milk', quantity: 25 },
      { name: 'whipped cream', quantity: 25 },
    ],
  },
];

/** Coffees a customer can actually order from the menu grid. */
export const ORDERABLE_COFFEES: readonly Coffee[] = COFFEE_MENU.filter(
  (coffee) => !coffee.discounted,
);

export function coffeeByName(name: string): Coffee {
  const coffee = COFFEE_MENU.find((item) => item.name === name);

  if (!coffee) {
    throw new Error(
      `Unknown coffee "${name}". Known coffees: ${COFFEE_MENU.map((item) => item.name).join(', ')}`,
    );
  }

  return coffee;
}

/** Money as the app renders it: 10 -> "$10.00". */
export function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
