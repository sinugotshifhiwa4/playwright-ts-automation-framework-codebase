import noDuplicateTitles from "./no-duplicate-titles.mjs";

/**
 * The framework's own ESLint plugin.
 *
 * Flat config lets a plugin be a plain object, so project-specific rules need no
 * separate npm package, no build step, and no publishing. Anything that is a
 * house rule rather than an industry rule belongs here.
 *
 * To extend: drop a rule module next to no-duplicate-titles.mjs, import it, and
 * add it to `rules` below. It is then referenced as `framework/<rule-name>` from
 * playwright.mjs (or wherever it applies).
 */
export default {
  meta: {
    name: "eslint-plugin-framework",
    version: "1.0.0",
  },
  rules: {
    "no-duplicate-titles": noDuplicateTitles,
  },
};
