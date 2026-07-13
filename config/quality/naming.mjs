/**
 * Filename and folder conventions, expressed as data.
 *
 * Policy lives here; the mechanism that enforces it lives in
 * scripts/quality/validate-filenames.mjs. Keeping them apart means changing a
 * convention is a one-line edit to a table, not a rewrite of a validator — and
 * the table doubles as the documentation an engineer actually reads.
 *
 * Convention: a filename should tell you what a file *is* before you open it.
 * PascalCase means "this module exports a thing" (a class, a spec suite); a
 * dotted suffix names the kind of thing.
 *
 * To extend: add an entry. `appliesTo` decides whether the rule is relevant to a
 * path, `isValid` decides whether that path passes. Both take POSIX-style paths
 * relative to the repo root, so they behave identically on Windows and CI.
 */

const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;
const LOWERCASE_FOLDER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEBAB_FILE = /^[a-z0-9]+(?:[-.][a-z0-9]+)*\.mjs$/;

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
export const MANAGED_ROOTS = ["src", "tests", "config", "scripts"];

export const FILE_RULES = [
  {
    id: "spec",
    convention: "PascalCase + .spec.ts",
    good: "Login.spec.ts, Checkout.spec.ts, APIAuthentication.spec.ts",
    bad: "login.spec.ts, shoppingCart.spec.ts",
    appliesTo: (p) => p.startsWith("tests/") && p.endsWith(".spec.ts"),
    isValid: (p) => PASCAL_CASE.test(stripSuffix(basename(p), ".spec.ts")),
  },
  {
    id: "page-object",
    convention: "PascalCase, suffixed with 'Page'",
    good: "LoginPage.ts, CheckoutPage.ts, DashboardPage.ts",
    bad: "login.ts, LoginPageObject.ts, loginPage.ts",
    appliesTo: (p) => inFolder(p, "pages") && p.endsWith(".ts"),
    isValid: (p) => {
      const name = stripSuffix(basename(p), ".ts");
      return PASCAL_CASE.test(name) && name.endsWith("Page");
    },
  },
  {
    id: "interface",
    convention: "'I' prefix + PascalCase",
    good: "ILogin.ts, ITestData.ts",
    bad: "Login.ts, iLogin.ts, LoginInterface.ts",
    appliesTo: (p) => inFolder(p, "interfaces") && p.endsWith(".ts"),
    isValid: (p) => {
      const name = stripSuffix(basename(p), ".ts");
      return /^I[A-Z]/.test(name) && PASCAL_CASE.test(name);
    },
  },
  {
    id: "enum",
    convention: "PascalCase + .enum.ts",
    good: "UserRole.enum.ts, Environment.enum.ts",
    bad: "userRole.enum.ts, UserRoleEnum.ts",
    appliesTo: (p) => p.endsWith(".enum.ts"),
    isValid: (p) => PASCAL_CASE.test(stripSuffix(basename(p), ".enum.ts")),
  },
  {
    id: "types",
    convention: "PascalCase + .types.ts",
    good: "Login.types.ts",
    bad: "login.types.ts, LoginTypes.ts",
    appliesTo: (p) => p.endsWith(".types.ts"),
    isValid: (p) => PASCAL_CASE.test(stripSuffix(basename(p), ".types.ts")),
  },
  {
    id: "constants",
    convention: "PascalCase + .constants.ts",
    good: "Api.constants.ts",
    bad: "api.constants.ts, ApiConstants.ts",
    appliesTo: (p) => p.endsWith(".constants.ts"),
    isValid: (p) => PASCAL_CASE.test(stripSuffix(basename(p), ".constants.ts")),
  },
  {
    id: "utility",
    convention: "PascalCase",
    good: "DateUtils.ts, FileHelper.ts, ApiClient.ts",
    bad: "dateUtils.ts, file-helper.ts",
    appliesTo: (p) =>
      (inFolder(p, "utils") || inFolder(p, "helpers") || inFolder(p, "clients")) &&
      p.endsWith(".ts") &&
      // The dotted-suffix rules above already own these.
      !/\.(enum|types|constants|spec)\.ts$/.test(p),
    isValid: (p) => PASCAL_CASE.test(stripSuffix(basename(p), ".ts")),
  },
  {
    id: "tooling",
    convention: "lowercase, hyphen- or dot-separated",
    good: "guard-staged.mjs, no-duplicate-titles.mjs",
    bad: "GuardStaged.mjs, guard_staged.mjs",
    appliesTo: (p) =>
      (p.startsWith("config/") || p.startsWith("scripts/")) && p.endsWith(".mjs"),
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
