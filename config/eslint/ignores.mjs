/**
 * Global ignores — files ESLint must never even parse.
 *
 * A flat-config block containing *only* an `ignores` key is global: it applies
 * to the whole run, not just to the block. This is the one place in the ESLint
 * setup where paths are listed literally, because it is deliberately about
 * generated output rather than about source roles.
 *
 * To extend: add generated or vendored directories. Do not add source files you
 * merely want to silence — fix them, or disable the specific rule inline.
 */
export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",

      // Playwright + reporter output
      "playwright-report/**",
      "ortoni-report/**",
      "test-results/**",
      "blob-report/**",
      "blob-report-*/**",
      "all-blob-reports/**",
      "playwright/.cache/**",

      // Runtime artefacts
      "logs/**",
      "downloads/**",

      // Fixture *payloads* are data, not code — so only the data formats are
      // ignored, never the directory. Ignoring src/test-data/** wholesale would
      // also exclude the TypeScript that builds fixtures (factories, faker
      // seeds, type-safe builders), which is ordinary source and must be linted
      // like any other. It is code that happens to live next to data.
      "src/test-data/**/*.json",
      "src/test-data/**/*.csv",
      "src/test-data/**/*.xml",
      "src/test-data/**/*.pdf",

      // Generated declarations
      "**/*.d.ts",
    ],
  },
];
