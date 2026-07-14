# Playwright Typescript Automation Framework Codebase

## Overview

An end-to-end test automation framework for **<APPLICATION_NAME>**, built with Playwright and TypeScript.

The framework provides reusable page objects, shared test fixtures, multi-browser execution, and environment-based configuration (`dev`, `qa`, `uat`, `preprod`), so the same suite runs consistently on a developer machine and in CI.

---

## Tech Stack

| Tool                | Purpose                                       |
| ------------------- | --------------------------------------------- |
| Playwright          | Browser automation and test execution         |
| TypeScript          | Type-safe framework and test authoring        |
| ESLint              | Static analysis and code quality enforcement  |
| Prettier            | Consistent code formatting                    |
| Husky + lint-staged | Pre-commit quality gates                      |
| Ortoni Report       | HTML test reporting                           |
| Winston             | Structured runtime logging                    |
| Luxon               | Date and time utilities                       |
| Faker               | Test data generation                          |
| dotenv              | Environment variable loading                  |
| cross-env           | Cross-platform environment variable injection |
| tsx                 | TypeScript execution for framework scripts    |

---

## Prerequisites

- Node.js >= 20 (enforced by `engines` in `package.json`)
- npm >= 9
- Playwright browser dependencies

---

## Getting Started

### 1. Install dependencies

```powershell
npm install
```

### 2. Install Playwright browsers

```powershell
npx playwright install
```

---

## Environment Configuration

> **Required before any execution. Without this step, no test will run.**

Environment files are never committed. Each developer creates their own from the example.

### Step 1 — Copy the example file

```powershell
Copy-Item envs/.env.example envs/.env.qa
```

Supported values for `<env>`: `dev`, `qa`, `uat`, `preprod`. Case does not matter — `ENV=QA`
and `ENV=qa` are the same stage.

A value that is **not** one of those four stops the run by name — `ENV=devv` is a typo, not a
new environment. See
[EXECUTION.md](docs/05-commands/EXECUTION.md#env-forgives-case-not-typos).

### Step 2 — Fill in the values

Open the copied file and replace **every** placeholder with a real value:

```dotenv
PORTAL_BASE_URL=portal.base.url
PORTAL_USERNAME=portal.username
PORTAL_PASSWORD=portal.password
```

Do not leave a placeholder in place. All three variables are required, and an unset one is
rejected by name at the moment it is read — see
[VARIABLES.md](docs/03-core/environment/VARIABLES.md).

> All `.env.<env>` files are excluded from source control via `.gitignore`. Only
> `envs/.env.example` is committed — it is the only record of what a `.env` file must contain.

---

## Quick Local Commands

### Quality

Run every check the repository has — types, lint, formatting, markdown, and the doc gates:

```powershell
npm run validate
```

Fix what can be fixed automatically:

```powershell
npm run fix
```

### Execution

Run the UI suite. Only `ENV` is worth setting; everything else has a sensible default:

```powershell
npx cross-env ENV=qa npm run test:ui
```

Watch it happen, filtered to one tag:

```powershell
npx cross-env ENV=qa HEADED=true TEST_TAGS=@smoke npm run test:ui
```

Every flag — `ENV`, `BROWSER`, `HEADED`, `TEST_TAGS`, `WORKER_PERCENTAGE`,
`SKIP_BROWSER_INIT` — with its values, defaults, and the two that fail in surprising ways, is
in **[EXECUTION.md](docs/05-commands/EXECUTION.md)**. It is not repeated here.

> `npm run test:ui` runs `npm run validate` first, via npm's `pretest` hook. A lint or type
> error stops the run before a browser is launched.

---

## Documentation

All docs live under [`docs/`](docs/README.md). Each section carries its own index.

**Start with [ARCHITECTURE.md](docs/ARCHITECTURE.md)** — the whole framework on one page: what
happens end to end when a test runs, and which page documents which folder.

| Section                                                   | Description                                                              | Applies                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| **[01 — Rules](docs/01-rules/README.md)**                 | Conduct, task planning, naming, code quality, branching, commits.        | **Always.** Loaded every session via `CLAUDE.md`.    |
| **[02 — Tooling](docs/02-tooling/README.md)**             | The quality gates — ESLint, Husky, the validators — and the agent setup. | On demand — read before changing the tooling.        |
| **[03 — Core](docs/03-core/README.md)**                   | `src/config/` + `src/utils/` — the machinery the layers are built on.    | On demand — read when working in the area.           |
| **[04 — Layers](docs/04-layers/README.md)**               | `src/layers/` — page actions, browser context, and the login flow.       | On demand — read when writing a test or page object. |
| **[05 — Commands](docs/05-commands/README.md)**           | What to type: the test and quality commands, and every runtime flag.     | On demand — read before running the suite.           |
| [Documentation Guide](docs/DOCUMENTATION_PROMPT_GUIDE.md) | How to write a page: structure, diagrams, definition of done.            | On demand — read before editing `docs/`.             |

The rules in **01 — Rules** are not optional reading. They declare `alwaysApply: true`
and are imported by `CLAUDE.md`, so they are in force on every request whether or not
anyone opens them.

---

## Contributing

Read these before your first commit — they are enforced by the pre-commit hook, not by review:

- [Branching Strategy](docs/01-rules/BRANCHING_STRATEGY.md) — you create the branch; the
  promotion chain is `develop → QA → UAT → Preprod → main`.
- [Commit Messages](docs/01-rules/COMMIT_MESSAGES.md) — Conventional Commits, with the Jira
  ticket bracketed in the subject.
- [Conventions](docs/01-rules/CONVENTIONS.md) — what a file is called and where it lives.

## Execution Summary

What happens between `npm run test:ui` and a browser opening:

1. Start from an npm script in `package.json`.
2. npm's `pretest` hook runs `npm run validate` — types, lint, formatting, docs.
3. `scripts/execution/test-executor.ts` resolves the layer, the project, the shard, the tag
   filter, and whether a browser is needed, then spawns `npx playwright test`.
4. `playwright.config.ts` resolves the projects, their dependencies, the workers, and the
   timeouts.
5. `globalSetup` loads the `.env` file and resets the auth state; the `setup-auth-state`
   project logs in once; the browser projects then run the suite.

[EXECUTION.md](docs/05-commands/EXECUTION.md#what-happens-when-you-run-testui) draws this as a
diagram and explains where it can stop early.

## External Resources

### Playwright

- [Getting Started](https://playwright.dev/docs/intro)
- [Configuration](https://playwright.dev/docs/test-configuration)
- [Locators](https://playwright.dev/docs/locators)
- [Auto-waiting](https://playwright.dev/docs/actionability)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Tags](https://playwright.dev/docs/test-annotations#tag-tests)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Sharding](https://playwright.dev/docs/test-sharding)
- [Continuous Integration](https://playwright.dev/docs/ci)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [tsconfig Reference](https://www.typescriptlang.org/tsconfig)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

### Logging

- [Winston](https://github.com/winstonjs/winston)

### Date and Time

- [Luxon](https://moment.github.io/luxon/#/)

### Test Data

- [Faker.js](https://fakerjs.dev/guide/)

### Code Quality

- [ESLint](https://eslint.org/docs/latest/)
- [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright)
- [Prettier](https://prettier.io/docs/en/)

### Git Hooks

- [Husky](https://typicode.github.io/husky/get-started.html)
- [lint-staged](https://github.com/lint-staged/lint-staged)

---
