import js from "@eslint/js";
import { ALL_CODE } from "./constants.mjs";

/**
 * Core JavaScript rules that apply to every file in the repository, TypeScript
 * and tooling alike.
 *
 * This module answers "what does correct JavaScript look like here". It has no
 * knowledge of types, of Playwright, or of the module graph — those live in
 * their own modules and layer on top of this one.
 *
 * To extend: add rules that would still make sense if TypeScript disappeared
 * tomorrow. Anything needing type information belongs in typescript.mjs.
 */
export default [
  { ...js.configs.recommended, files: ALL_CODE },

  {
    files: ALL_CODE,

    linterOptions: {
      // An `eslint-disable` comment that no longer suppresses anything is a lie
      // about the code. Failing on it stops stale suppressions accumulating.
      reportUnusedDisableDirectives: "error",
    },

    rules: {
      // Diagnostics that must never reach a shared branch. The pre-commit guard
      // blocks these too — ESLint catches them while you type, the hook catches
      // them if the editor was not running.
      "no-console": ["error", { allow: ["error", "warn"] }],
      "no-debugger": "error",
      "no-alert": "error",

      // Correctness
      eqeqeq: ["error", "smart"],
      "no-fallthrough": "error",
      "no-return-await": "off", // superseded by @typescript-eslint/return-await
      "require-atomic-updates": "error",

      // Modern syntax
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "object-shorthand": ["error", "properties"],
      "object-curly-spacing": ["error", "never"],

      // Superseded by import/no-duplicates, which understands type-only imports.
      "no-duplicate-imports": "off",
    },
  },

  // The quality scripts are CLI tools whose entire job is to print a report.
  {
    files: ["scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
    },
  },

  // A Playwright fixture that depends on no other fixture is still handed the
  // fixtures object, and the only way to say "I need nothing from it" is to
  // destructure nothing: async ({}, use). The signature is Playwright's, not the
  // author's, so the rule has nothing to catch here. It stays on everywhere else,
  // where an empty destructure really is a mistake.
  {
    files: ["fixtures/**/*.ts"],
    rules: {
      "no-empty-pattern": "off",
    },
  },
];
