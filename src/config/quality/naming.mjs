/**
 * Filename and folder conventions, expressed as data.
 *
 * Policy lives here; the mechanism that enforces it lives in
 * scripts/quality/validate-filenames.mjs. Keeping them apart means changing a
 * convention is a one-line edit to a table, not a rewrite of a validator — and
 * the table doubles as the documentation an engineer actually reads.
 *
 * Convention: a filename should tell you what a file *is* before you open it.
 *
 *   src/    camelCase   the file is a module    loginPage.ts  -> class LoginPage
 *   tests/  PascalCase  the file is a suite     Login.spec.ts
 *
 * The split is deliberate. In src/ the filename names the *module* and the export
 * inside it is PascalCase, which is ordinary TypeScript practice and keeps the two
 * distinguishable in an import line. A spec exports nothing — it *is* the suite —
 * so it takes the suite's name directly. A dotted suffix names the kind of thing.
 *
 * To extend: add an entry. `appliesTo` decides whether the rule is relevant to a
 * path, `isValid` decides whether that path passes. Both take POSIX-style paths
 * relative to the repo root, so they behave identically on Windows and CI.
 */

const CAMEL_CASE = /^[a-z][A-Za-z0-9]*$/;
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;
const LOWERCASE_FOLDER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A spec name, with the one kind-suffix a spec is allowed to carry.
 *
 * `ClothingApprovals.data-cleanup.spec.ts` is a spec, not a variant filename: the
 * cleanup for a feature has to be runnable on its own, after a crashed run or a
 * cancelled pipeline that never reached its teardown. Plain PASCAL_CASE would
 * reject it on the dot and the hyphen, so the suffix is spelled out here rather
 * than loosening the rule for every spec.
 */
const SPEC_NAME = /^[A-Z][A-Za-z0-9]*(?:\.data-cleanup)?$/;
const KEBAB_FILE = /^[a-z0-9]+(?:[-.][a-z0-9]+)*\.mjs$/;
const SCREAMING_SNAKE_DOC = /^[A-Z0-9]+(?:_[A-Z0-9]+)*\.md$/;

/**
 * A skill's entry document. The name before `_SKILL` is required, which is the
 * whole point: a bare SKILL.md tells you nothing in a tab bar, a grep result, or
 * a diff — and every skill folder would produce an identically-named file.
 */
const SKILL_DOC = /^[A-Z0-9]+(?:_[A-Z0-9]+)*_SKILL\.md$/;

/** Strip a known dotted suffix, e.g. "Login.spec.ts" -> "Login". */
const stripSuffix = (name, suffix) => name.slice(0, -suffix.length);

const basename = (filePath) => filePath.slice(filePath.lastIndexOf("/") + 1);

/**
 * Is `folder` one of the directories containing this file?
 *
 * Compares path *segments* rather than doing a substring match on `/folder/`,
 * because a substring needs a leading slash and so silently misses a top-level
 * directory: "pages/LoginPage.ts" does not contain "/pages/", and a page object
 * dropped at the repository root would escape its rule entirely.
 */
const inFolder = (filePath, folder) => filePath.split("/").slice(0, -1).includes(folder);

/**
 * Folders whose subdirectories must be lowercase. Anything outside these trees
 * (node_modules, .husky, generated output) is none of our business.
 */
export const MANAGED_ROOTS = ["src", "tests", "scripts"];

export const FILE_RULES = [
  {
    id: "spec",
    convention: "PascalCase + .spec.ts, optionally + .data-cleanup",
    good: "Login.spec.ts, APIAuthentication.spec.ts, ClothingApprovals.data-cleanup.spec.ts",
    bad: "login.spec.ts, shoppingCart.spec.ts, ClothingApprovals.cleanup.spec.ts",
    appliesTo: (p) => p.startsWith("tests/") && p.endsWith(".spec.ts"),
    isValid: (p) => SPEC_NAME.test(stripSuffix(basename(p), ".spec.ts")),
  },
  {
    id: "setup-spec",
    convention: "PascalCase + .setup.ts",
    good: "Authentication.setup.ts",
    bad: "authentication.setup.ts, auth-setup.ts, Authentication.spec.ts",
    // A distinct suffix is what keeps a setup project out of a normal test run.
    // Named .spec.ts it would be collected by `npm test` as an ordinary spec and
    // run in whatever order the runner chose — but every test depending on the
    // storage state it produces must run *after* it, never alongside it.
    appliesTo: (p) => p.startsWith("tests/") && p.endsWith(".setup.ts"),
    isValid: (p) => PASCAL_CASE.test(stripSuffix(basename(p), ".setup.ts")),
  },
  {
    id: "page-object",
    convention: "camelCase, suffixed with 'Page'",
    good: "loginPage.ts, checkoutPage.ts, dashboardPage.ts",
    bad: "LoginPage.ts, login.ts, loginPageObject.ts",
    // The file is camelCase; the class it exports is PascalCase:
    //   loginPage.ts  ->  export class LoginPage
    appliesTo: (p) => inFolder(p, "pages") && p.endsWith(".ts"),
    isValid: (p) => {
      const name = stripSuffix(basename(p), ".ts");
      return CAMEL_CASE.test(name) && name.endsWith("Page");
    },
  },
  {
    id: "interface",
    convention: "'i' prefix + PascalCase remainder",
    good: "iLogin.ts, iTestData.ts",
    bad: "ILogin.ts, login.ts, loginInterface.ts",
    // camelCase like every other module in src/, so the exported `ILogin` and the
    // file `iLogin.ts` stay distinguishable in an import line.
    appliesTo: (p) => inFolder(p, "interfaces") && p.endsWith(".ts"),
    isValid: (p) => {
      const name = stripSuffix(basename(p), ".ts");
      return /^i[A-Z]/.test(name) && CAMEL_CASE.test(name);
    },
  },
  {
    id: "enum",
    convention: "camelCase + .enum.ts",
    good: "userRole.enum.ts, environment.enum.ts",
    bad: "UserRole.enum.ts, userRoleEnum.ts",
    appliesTo: (p) => p.endsWith(".enum.ts"),
    isValid: (p) => CAMEL_CASE.test(stripSuffix(basename(p), ".enum.ts")),
  },
  {
    id: "types",
    convention: "camelCase + .types.ts",
    good: "login.types.ts",
    bad: "Login.types.ts, loginTypes.ts",
    appliesTo: (p) => p.endsWith(".types.ts"),
    isValid: (p) => CAMEL_CASE.test(stripSuffix(basename(p), ".types.ts")),
  },
  {
    id: "consts",
    convention: "camelCase + .consts.ts",
    good: "api.consts.ts, timeout.consts.ts",
    bad: "Api.consts.ts, apiConsts.ts, api.constants.ts",
    appliesTo: (p) => p.endsWith(".consts.ts"),
    isValid: (p) => CAMEL_CASE.test(stripSuffix(basename(p), ".consts.ts")),
  },
  {
    id: "utility",
    convention: "camelCase",
    good: "dateUtils.ts, fileHelper.ts, apiClient.ts, errorHandler.ts",
    bad: "DateUtils.ts, file-helper.ts",
    appliesTo: (p) =>
      (inFolder(p, "utils") || inFolder(p, "helpers") || inFolder(p, "clients")) &&
      p.endsWith(".ts") &&
      // The dotted-suffix rules above already own these.
      !/\.(enum|types|consts|spec)\.ts$/.test(p),
    isValid: (p) => CAMEL_CASE.test(stripSuffix(basename(p), ".ts")),
  },
  {
    id: "skill-doc",
    convention: "<NAME>_SKILL.md — the skill's name, then the suffix",
    good: "REFACTOR_SKILL.md, MIGRATION_SKILL.md",
    bad: "SKILL.md, refactor-skill.md, Refactor_Skill.md",
    // Deliberately scoped to docs/, which is what keeps it off
    // .claude/skills/<name>/SKILL.md. That bare filename is not a violation — it
    // is the exact name Claude Code requires to discover an executable skill, and
    // widening this rule past docs/ would reject every working skill in the repo.
    //
    // Within docs/ the suffix is required, because a documentation tree full of
    // files called SKILL.md is unnavigable in a tab bar, a grep, or a diff.
    appliesTo: (p) =>
      p.startsWith("docs/") && /skill/i.test(basename(p)) && p.endsWith(".md"),
    isValid: (p) => SKILL_DOC.test(basename(p)),
  },
  {
    id: "doc",
    convention: "UPPERCASE, underscore-separated",
    good: "ARCHITECTURE.md, DOCUMENTATION_PROMPT_GUIDE.md",
    bad: "architecture.md, Documentation-Prompt-Guide.md, ci-setup.md",
    // Recursive on purpose: the rule holds inside docs/02-tooling/ just as it
    // does at the top of docs/. README.md and LICENSE live at the repo root,
    // outside docs/, so they are untouched by this.
    appliesTo: (p) => p.startsWith("docs/") && p.endsWith(".md"),
    isValid: (p) => SCREAMING_SNAKE_DOC.test(basename(p)),
  },
  {
    id: "tooling",
    convention: "lowercase, hyphen- or dot-separated",
    good: "guard-staged.mjs, no-duplicate-titles.mjs",
    bad: "GuardStaged.mjs, guard_staged.mjs",
    appliesTo: (p) =>
      (p.startsWith("src/config/") || p.startsWith("scripts/")) && p.endsWith(".mjs"),
    isValid: (p) => KEBAB_FILE.test(basename(p)),
  },
];

export const FOLDER_RULE = {
  id: "folder",
  convention: "lowercase, hyphen-separated",
  good: "tests/auth/, tests/api/, src/test-data/",
  bad: "tests/Auth/, src/testData/, src/test_data/",
  isValid: (segment) => LOWERCASE_FOLDER.test(segment),
};
