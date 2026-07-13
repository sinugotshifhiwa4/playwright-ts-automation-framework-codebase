import playwright from "eslint-plugin-playwright";

import { FILE_GROUPS } from "./constants.mjs";
import framework from "./rules/index.mjs";

/**
 * Test-authoring rules. Scoped to FILE_GROUPS.tests, so none of this leaks into
 * the framework source.
 *
 * This module is composed *last* in eslint.config.mjs. Flat config resolves
 * later blocks over earlier ones, and this is the narrowest scope in the setup,
 * so it gets the final say on how a spec file must look.
 *
 * The rules are grouped by the failure they prevent rather than alphabetically,
 * because the grouping is the actual documentation: it tells the next engineer
 * *why* a rule is on.
 *
 * To extend: run `npx eslint --inspect-config` to browse the plugin's full rule
 * list, and add to the group whose failure mode it prevents.
 */
export default [
  {
    files: FILE_GROUPS.tests,

    plugins: { playwright, framework },

    rules: {
      ...playwright.configs["flat/recommended"].rules,

      // ----------------------------------------------------------------------
      // A gate, not advice. `recommended` ships no-skipped-test as "warn", which
      // means it never blocks anything. Pinned to "error" here.
      //
      // The two options encode the same single idea: a test may be skipped
      // *because of a condition evaluated at runtime*, never *because someone
      // switched it off*.
      //
      //   allowConditional  test.skip(browserName === "webkit", "reason") is the
      //                     supported way to gate a test on a platform. Blocking
      //                     it — as a naive `.skip` grep does — only pushes
      //                     people into worse workarounds. Allowed.
      //                     A bare test.skip() is still rejected.
      //
      //   disallowFixme     off by default, which leaves test.fixme("...", fn) —
      //                     a permanently disabled test — completely unguarded.
      //                     That is the exact failure mode this rule exists to
      //                     prevent, so it is turned on.
      //
      // See docs/01-config/QUALITY_ARCHITECTURE.md §8 for the accepted/rejected matrix.
      // ----------------------------------------------------------------------
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": [
        "error",
        { allowConditional: true, disallowFixme: true },
      ],
      "playwright/no-commented-out-tests": "error",

      // ----------------------------------------------------------------------
      // Flakiness. Every rule here bans a construct whose failure mode is a test
      // that passes on a fast laptop and fails on a loaded CI runner.
      // ----------------------------------------------------------------------
      "playwright/no-wait-for-timeout": "error", // arbitrary sleeps
      "playwright/no-wait-for-selector": "error", // superseded by locators
      "playwright/no-networkidle": "error", // discouraged by Playwright itself
      "playwright/no-element-handle": "error", // detaches from auto-waiting
      "playwright/no-force-option": "error", // hides a real interactability bug
      "playwright/no-nth-methods": "error", // index-based, breaks on reorder
      "playwright/no-page-pause": "error", // debugging leftover
      "playwright/no-eval": "error",
      "playwright/missing-playwright-await": "error",
      "playwright/no-useless-await": "error",

      // ----------------------------------------------------------------------
      // Assertion quality. Web-first assertions retry; bare expects do not.
      // ----------------------------------------------------------------------
      "playwright/prefer-web-first-assertions": "error",
      "playwright/no-standalone-expect": "error",
      "playwright/valid-expect": "error",
      "playwright/expect-expect": "error", // a test that asserts nothing passes vacuously

      // ----------------------------------------------------------------------
      // Locator quality. Semantic locators survive a redesign; CSS chains do not.
      // ----------------------------------------------------------------------
      "playwright/prefer-native-locators": "error",
      "playwright/no-get-by-title": "error",

      // ----------------------------------------------------------------------
      // Structure. A test with branching logic tests two things badly.
      // ----------------------------------------------------------------------
      "playwright/no-conditional-in-test": "error",
      "playwright/no-conditional-expect": "error",
      "playwright/valid-describe-callback": "error",
      "playwright/max-nested-describe": ["error", { max: 2 }],

      // ----------------------------------------------------------------------
      // House rule. See config/eslint/rules/no-duplicate-titles.mjs.
      // ----------------------------------------------------------------------
      "framework/no-duplicate-titles": "error",
    },
  },
];
