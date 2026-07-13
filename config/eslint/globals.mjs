import globals from "globals";
import tseslint from "typescript-eslint";

import { FILE_GROUPS, ROOT_DIR, TSCONFIG } from "./constants.mjs";

/**
 * Language options — *how* each kind of file is parsed, never *what* is allowed.
 *
 * Keeping parser wiring here means the rule modules (base / typescript /
 * playwright / imports / unused) contain rules and nothing else. If parsing ever
 * breaks ("The file does not match your project config"), this is the only file
 * you need to look at.
 */
export default [
  // Tooling (.mjs/.js) runs on Node and is never type-checked: no tsconfig
  // project, so ESLint stays fast when linting its own configuration.
  {
    files: FILE_GROUPS.tooling,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  // .cjs is the deliberate CommonJS escape hatch. It needs its own sourceType —
  // parsed as a module, `module.exports` and `require` would be syntax errors.
  {
    files: FILE_GROUPS.commonjs,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
  },

  // All TypeScript gets the TS parser, so even files outside the tsconfig
  // program (a scratch file, a new folder) still lint with syntax-only rules
  // instead of crashing the run.
  {
    files: FILE_GROUPS.typescript,
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  // Only files inside the tsconfig program get a `project`, which is what
  // unlocks type-aware rules (no-floating-promises and friends).
  {
    files: FILE_GROUPS.typed,
    languageOptions: {
      parserOptions: {
        project: [TSCONFIG],
        tsconfigRootDir: ROOT_DIR,
      },
    },
  },
];
