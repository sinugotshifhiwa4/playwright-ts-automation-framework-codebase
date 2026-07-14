# Playwright Typescript Automation Framework Codebase

## Overview

An end-to-end test automation framework for **<APPLICATION_NAME>**, built with Playwright and TypeScript.

The framework provides reusable page objects, shared test fixtures, multi-browser execution, and environment-based configuration (dev/qa/prod), so the same suite runs consistently on a developer machine and in CI.

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

- Node.js >= 18
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

## Documentation

All docs live under [`docs/`](docs/README.md). Each section carries its own index.

| Section                                                   | Description                                                              | Applies                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| **[01 — Rules](docs/01-rules/README.md)**                 | Conduct, task planning, naming, code quality, branching, commits.        | **Always.** Loaded every session via `CLAUDE.md`.    |
| **[02 — Tooling](docs/02-tooling/README.md)**             | The quality gates — ESLint, Husky, the validators — and the agent setup. | On demand — read before changing the tooling.        |
| **[03 — Core](docs/03-core/README.md)**                   | `src/config/` + `src/utils/` — the machinery the layers are built on.    | On demand — read when working in the area.           |
| **[04 — Layers](docs/04-layers/README.md)**               | `src/layers/` — page actions, browser context, and the login flow.       | On demand — read when writing a test or page object. |
| [Documentation Guide](docs/DOCUMENTATION_PROMPT_GUIDE.md) | How to write a page: structure, diagrams, definition of done.            | On demand — read before editing `docs/`.             |

The rules in **01 — Rules** are not optional reading. They declare `alwaysApply: true`
and are imported by `CLAUDE.md`, so they are in force on every request whether or not
anyone opens them.

---
