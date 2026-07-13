import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Absolute path to the repository root.
 *
 * Every module resolves paths from this rather than `process.cwd()`, so linting
 * behaves identically whether it was launched from the terminal, from a Husky
 * hook (whose cwd is the repo root), or from the VS Code ESLint extension
 * (whose cwd is the workspace folder).
 */
export const ROOT_DIR = path.resolve(here, "..", "..", "..");

/** The tsconfig that powers type-aware linting. Must match tsconfig.json. */
export const TSCONFIG = "./tsconfig.json";

/**
 * The single source of truth for "which files does this rule set apply to".
 *
 * Every ESLint module imports from here instead of hardcoding globs, so adding
 * a new top-level folder is a one-line change in this file rather than a
 * find-and-replace across six configs.
 *
 * `typed` must stay in sync with the `include` array in tsconfig.json — a file
 * that ESLint type-checks but tsconfig does not include will fail to parse.
 */
export const FILE_GROUPS = {
  /**
   * Tooling written as ESM: ESLint modules, quality scripts, lint-staged.
   *
   * `.js` belongs here, not in a CommonJS group: package.json declares
   * "type": "module", so a plain .js file in this repo *is* ESM. Omitting it
   * would leave any .js file completely unlinted — no no-console, no no-var,
   * nothing — because ESLint only visits what a `files` glob names.
   */
  tooling: ["**/*.mjs", "**/*.js"],

  /** The explicit CommonJS opt-out. Needs a different sourceType, so it is separate. */
  commonjs: ["**/*.cjs"],

  /** Every TypeScript file, whatever its role. */
  typescript: ["**/*.ts"],

  /** TypeScript files inside the tsconfig program, so eligible for typed rules. */
  typed: ["src/**/*.ts", "tests/**/*.ts", "fixtures/**/*.ts", "*.ts"],

  /** Framework source: page objects, fixtures, clients, utilities. */
  source: ["src/**/*.ts"],

  /** Playwright specs. */
  tests: ["tests/**/*.ts", "**/*.spec.ts"],
};

/**
 * Every file containing code, of any flavour.
 *
 * Derived rather than written out, so a new extension is added in exactly one
 * place. Hand-maintaining `[...typescript, ...tooling]` in three separate
 * modules is precisely how .cjs ended up linted by none of them.
 */
export const ALL_CODE = [
  ...FILE_GROUPS.typescript,
  ...FILE_GROUPS.tooling,
  ...FILE_GROUPS.commonjs,
];
