import importPlugin from "eslint-plugin-import";

import { ALL_CODE, TSCONFIG } from "./constants.mjs";

/**
 * Module-graph hygiene — the shape of the dependency tree, not the contents of
 * any one file.
 *
 * The rule that earns its keep here is `import/no-cycle`. Page-object frameworks
 * drift into circular imports almost by default (a LoginPage returns a
 * DashboardPage, which links back to LoginPage), and the failure mode is a
 * baffling `undefined is not a constructor` at runtime rather than a clean
 * compile error. Catching it at lint time is dramatically cheaper.
 *
 * `import/order` is what makes the resolver dependency worth paying for: it
 * gives every file the same import layout, so diffs stay small and reviewers
 * stop arguing about ordering.
 *
 * To extend: add rules about *relationships between modules*. Rules about the
 * code inside a module belong in base.mjs or typescript.mjs.
 */
export default [
  {
    files: ALL_CODE,

    plugins: { import: importPlugin },

    settings: {
      // Without this mapping, import/no-cycle is silently DEAD on TypeScript.
      //
      // To find a cycle the plugin must parse the files a module *imports*, not
      // just the file being linted. Under the old eslintrc format it inherited
      // `parserPath` for that; flat config has no such field, so the plugin
      // falls back to the default parser, fails to read any .ts file, finds no
      // imports in it, and concludes there is no cycle — reporting nothing and
      // erroring on nothing. The rule appears enabled and catches literally zero.
      //
      // Verified: with this mapping absent, a plain A -> B -> A cycle between two
      // .ts files produces no output, while the identical cycle between two .mjs
      // files is caught. That asymmetry is the tell.
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".mts", ".cts", ".tsx"],
      },
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: TSCONFIG },
        node: true,
      },
    },

    rules: {
      "import/no-unresolved": "error",
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      "import/no-self-import": "error",
      // noUselessIndex stays off: it would demand "./rules" over "./rules/index.mjs",
      // but Node ESM has no directory-index resolution, so that import would throw
      // at runtime. The rule's default is tuned for bundlers, not for native ESM.
      "import/no-useless-path-segments": ["error", { noUselessIndex: false }],
      "import/no-duplicates": ["error", { "prefer-inline": true }],
      "import/newline-after-import": "error",

      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"],
            ["type"],
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
];
