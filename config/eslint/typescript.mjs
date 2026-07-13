import tseslint from "typescript-eslint";

import { FILE_GROUPS } from "./constants.mjs";

/**
 * Type-aware linting — the rules that need the TypeScript compiler, not just a
 * parse tree.
 *
 * This is the most valuable module in the setup, because it is the only one that
 * can catch the single most common cause of flaky Playwright suites: a promise
 * that was never awaited. `no-floating-promises` cannot be implemented without
 * type information, which is why globals.mjs bothers to wire up a tsconfig
 * project at all.
 *
 * Applies to FILE_GROUPS.typed only. Files outside the tsconfig program get
 * syntax-level rules from base.mjs and nothing from here.
 *
 * To extend: rules requiring type info go here; anything else goes in base.mjs.
 */
export default [
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: FILE_GROUPS.typed,
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: FILE_GROUPS.typed,
  })),

  {
    files: FILE_GROUPS.typed,

    rules: {
      // ----------------------------------------------------------------------
      // Async correctness. A missing `await` in a page object is the number one
      // source of "passes locally, fails in CI" flakiness, and every rule below
      // exists to make that impossible to write.
      // ----------------------------------------------------------------------
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/return-await": ["error", "always"],
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          // Playwright hooks legitimately take async callbacks in void positions.
          checksVoidReturn: { arguments: false },
          checksConditionals: true,
          checksSpreads: true,
        },
      ],

      // ----------------------------------------------------------------------
      // Type integrity. `any` is a hole in the type system; once one appears in
      // a page object, everything downstream of it silently loses checking.
      // ----------------------------------------------------------------------
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-non-null-assertion": "error",

      // Public surface must be self-documenting: a page object method's return
      // type is part of its contract. Inline callbacks are exempt, so
      // `test("...", async ({ page }) => {})` stays clean.
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],

      // ----------------------------------------------------------------------
      // Consistency
      // ----------------------------------------------------------------------
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],

      "lines-between-class-members": [
        "error",
        "always",
        { exceptAfterSingleLine: false },
      ],
    },
  },
];
