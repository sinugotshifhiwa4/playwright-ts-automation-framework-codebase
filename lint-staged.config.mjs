/**
 * lint-staged: fix what can be fixed, on the staged files only.
 *
 * This is the *repair* stage of pre-commit, not the verification stage. It runs
 * before the guards and the typecheck verify anything, so by the time they do,
 * the easy problems (import order, formatting, a stray unused import) are
 * already gone and the engineer is only asked to fix what a machine cannot.
 *
 * This config is the only lint-staged config in the repo, and it must stay that
 * way. lint-staged discovers *every* config it can find — a `lint-staged` key in
 * package.json counts — and then assigns each staged file to exactly one of
 * them. Two configs at the same depth means one of them silently wins the whole
 * file list and the other runs against nothing, with the winner decided by
 * lint-staged's internal sort rather than by anything you wrote.
 *
 * Two details make it work, and both are easy to get wrong:
 *
 *  - Command order within an array is sequential. ESLint runs first because its
 *    --fix rewrites code (deleting imports, reordering them), which changes
 *    formatting; Prettier runs last so it always has the final word on layout.
 *    Reverse them and every commit leaves badly-formatted code behind.
 *
 *  - lint-staged re-stages whatever the commands rewrite. That is why the commit
 *    contains the *fixed* file rather than the file you wrote — and why the
 *    guards in pre-commit read the index rather than the working tree.
 *
 * --max-warnings=0 promotes every warning to a failure, so a rule shipped as
 * "warn" by a plugin still blocks the commit. The gate has no advisory tier.
 */
export default {
  // Every code extension ESLint knows about must appear here. A missing one is
  // silent: the file is simply never repaired and never checked at commit time.
  //
  // --no-warn-ignored is not optional. lint-staged hands ESLint an explicit list
  // of staged paths, and ESLint emits "File ignored because of a matching ignore
  // pattern" as a *warning* for any of them that ignores.mjs excludes. Combined
  // with --max-warnings=0 that warning is fatal, so committing a perfectly
  // ordinary fixture under src/test-data/ would fail the commit with an error
  // about the file being ignored. Suppressing the warning restores the intent:
  // ignored files are skipped, not rejected.
  "*.{ts,mjs,js,cjs}": [
    "eslint --fix --max-warnings=0 --no-warn-ignored",
    "prettier --write",
  ],
  "*.md": ["markdownlint-cli2 --fix", "prettier --write"],
  "*.{json,yml,yaml}": ["prettier --write"],
};
