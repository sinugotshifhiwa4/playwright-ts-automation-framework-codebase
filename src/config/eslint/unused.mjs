import unusedImports from "eslint-plugin-unused-imports";
import { ALL_CODE } from "./constants.mjs";

/**
 * Dead-import removal.
 *
 * This is a separate module from unused.mjs's obvious neighbour
 * (@typescript-eslint/no-unused-vars, in typescript.mjs) for one practical
 * reason: `no-unused-vars` reports unused imports but will not auto-fix them,
 * whereas `unused-imports/no-unused-imports` deletes them. Because lint-staged
 * runs `eslint --fix`, that difference means unused imports are silently cleaned
 * up at commit time instead of failing the commit and interrupting the engineer.
 *
 * Applies to tooling as well as TypeScript, so the ESLint configuration polices
 * itself.
 */
export default [
  {
    files: ALL_CODE,

    plugins: { "unused-imports": unusedImports },

    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
];
