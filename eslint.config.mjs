import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'package-lock.json',
      // Local checkout of this repo, if someone keeps a clean clone alongside it.
      'Repo/**',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // Anchor TS resolution to this project so a sibling clone (with its own
        // tsconfig.json) cannot make the parser ambiguous.
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      /**
       * The "zero hard-coded sleeps" rule from the brief, enforced mechanically.
       * A junior cannot merge `waitForTimeout` even if they forget the convention.
       */
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message:
            'Hard-coded sleeps are banned. Use web-first assertions, e.g. await expect(locator).toBeVisible().',
        },
        {
          selector: "CallExpression[callee.name='setTimeout']",
          message:
            'Timer-based waits are banned. Rely on Playwright auto-waiting and web-first assertions.',
        },
      ],
    },
  },

  {
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      /**
       * Assertions live in page objects by design. Every asserting helper is prefixed
       * with `expect*` (expectCartCount, expectLineItem, ...), so a regex on the callee
       * name treats those calls as assertions instead of flagging "no expect()".
       */
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect'] }],

      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-skipped-test': 'warn',
    },
  },

  // Must stay last: turns off stylistic rules that Prettier already owns.
  prettier,
);
