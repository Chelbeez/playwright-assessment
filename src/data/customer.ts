/**
 * Customer data for the payment form.
 *
 * Generated per test so parallel runs never collide, and so a real inbox is never
 * touched. Specs describe *behaviour*; this module owns *values*.
 */

export type Customer = {
  name: string;
  email: string;
};

const FIRST_NAMES = ['Ada', 'Grace', 'Alan', 'Katherine'] as const;
const LAST_NAMES = ['Lovelace', 'Hopper', 'Turing', 'Johnson'] as const;

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)]!;
}

export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  const unique = `${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}`;

  return {
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    email: `qa.${unique}@example.com`,
    ...overrides,
  };
}
