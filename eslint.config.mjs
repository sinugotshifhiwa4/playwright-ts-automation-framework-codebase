import prettier from "eslint-config-prettier";

import base from "./src/config/eslint/base.mjs";
import globals from "./src/config/eslint/globals.mjs";
import ignores from "./src/config/eslint/ignores.mjs";
import imports from "./src/config/eslint/imports.mjs";
import playwright from "./src/config/eslint/playwright.mjs";
import typescript from "./src/config/eslint/typescript.mjs";
import unused from "./src/config/eslint/unused.mjs";

/**
 * The composition root. This file contains no rules — it only declares the order
 * the modules stack in, and each module owns exactly one concern.
 *
 * Order is the whole design. ESLint flat config is an ordered array in which a
 * later block overrides an earlier one for any file both blocks match, so the
 * sequence runs from widest scope to narrowest:
 *
 *   ignores     what must never be parsed              (whole run)
 *   globals     how each file type is parsed           (all files)
 *   base        correct JavaScript                     (all code)
 *   typescript  correct types, correct async           (typed TS)
 *   imports     a healthy module graph                 (all code)
 *   unused      no dead imports                        (all code)
 *   playwright  correct tests                          (specs only)
 *   prettier    disables every rule Prettier owns      (whole run)
 *
 * `prettier` is last on purpose: it exists solely to switch off stylistic rules
 * that would otherwise fight the formatter, so it must be able to override
 * everything above it. If it were placed earlier, a later module could re-enable
 * a rule Prettier owns and the two tools would undo each other's work on every
 * save.
 *
 * To extend: write a new module under src/config/eslint/, then insert it here at the
 * position matching its scope. Do not add rules to this file.
 */
export default [
  ...ignores,
  ...globals,
  ...base,
  ...typescript,
  ...imports,
  ...unused,
  ...playwright,
  prettier,
];
