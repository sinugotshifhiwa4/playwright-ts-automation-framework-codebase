import jsdoc from "eslint-plugin-jsdoc";
import { FILE_GROUPS } from "./constants.mjs";

/**
 * Every method carries a JSDoc block. Scoped to FILE_GROUPS.source, so specs are
 * exempt — a test's name is its documentation, and a `@returns` tag above
 * `test("logs in", ...)` is noise.
 *
 * The rule is here rather than in a review checklist for the reason every gate in
 * this repository exists: a standard nothing checks is a standard that quietly
 * stops being one. As an ESLint rule the violation is underlined in the editor as
 * the method is written, which is the only moment documenting it is cheap.
 *
 * The house format, enforced by the rules below:
 *
 *   /**
 *    * Describes what the method does in one sentence.
 *    * @param paramName - Description of the parameter.
 *    * @returns A promise that resolves when the form is submitted.
 *    *\/
 *
 * Types are deliberately absent. TypeScript already declares them, and a JSDoc
 * `@param {string}` is a second copy that the compiler does not check and nobody
 * updates — so `no-types` rejects it outright.
 */
export default [
  {
    files: FILE_GROUPS.source,

    plugins: { jsdoc },

    settings: {
      jsdoc: { mode: "typescript" },
    },

    rules: {
      // ----------------------------------------------------------------------
      // Where a block is required. Private methods are included on purpose: a
      // private method is the one most likely to hold the subtle logic, and the
      // one least likely to be understood from its call site.
      // ----------------------------------------------------------------------
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            ClassDeclaration: false,
            ClassExpression: false,
            MethodDefinition: true,
            FunctionDeclaration: true,
          },
          // A page object's methods are its public API. Arrow functions assigned
          // inside a method body are implementation detail, and requiring a block
          // on each would make the rule hated and then disabled.
          checkGetters: false,
          checkSetters: false,
        },
      ],

      // ----------------------------------------------------------------------
      // What the block must contain. A block that exists but says nothing is
      // worse than none: it looks documented in a diff and answers nothing.
      // ----------------------------------------------------------------------
      "jsdoc/require-description": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-param-name": "error",

      // `forceReturnsWithAsync` is the load-bearing option. Without it an async
      // method returning Promise<void> has no return statement, so the rule sees
      // nothing to document and stays silent — leaving exactly the methods whose
      // completion semantics a caller most needs to know about undocumented.
      "jsdoc/require-returns": ["error", { forceReturnsWithAsync: true }],
      "jsdoc/require-returns-description": "error",

      // ----------------------------------------------------------------------
      // Shape. These keep every block identical, which is what makes a missing
      // one visible at a glance.
      // ----------------------------------------------------------------------
      "jsdoc/require-hyphen-before-param-description": ["error", "always"],
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-alignment": "error",
      "jsdoc/no-types": "error",
      "jsdoc/empty-tags": "error",
    },
  },
];
