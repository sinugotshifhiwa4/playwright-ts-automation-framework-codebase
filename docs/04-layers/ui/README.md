# UI Layer

**[← Back to Layers](../README.md)**

`src/layers/ui/` — everything a browser test needs that is not the test itself. Three
folders, three responsibilities, one page each.

| Page                                   | Covers                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [PAGE_ACTIONS.md](PAGE_ACTIONS.md)     | `src/layers/ui/base/` — the seven action classes, the container that assembles them, `BasePage`, and how every action logs itself. |
| [CONTEXT.md](CONTEXT.md)               | `src/layers/ui/context/` — isolated browser contexts, and the per-test key/value store.                                            |
| [AUTHENTICATION.md](AUTHENTICATION.md) | `src/layers/ui/authentication/` — the login flow, the storage state, and how a test skips logging in.                              |

## Read PAGE_ACTIONS.md First

The other two assume it. `LoginCoordinator` takes a `NavigationActions`, the fixtures
build a `PageActionsContainer` to get one, and both make more sense once you know what an
action _is_ in this framework — a wrapped call that names its own caller, reports itself
as a Playwright step, and routes its failure through `ErrorHandler`.

## Scope, Honestly

**This layer is a toolkit with no user yet.**

- `src/layers/ui/pages/` does not exist. Nothing extends `BasePage`.
- `LoginExecutor` — the interface `LoginCoordinator` drives the login through — has no
  implementation.
- `tests/` is empty. There is no spec, and no `.setup.ts` file for the `setup-auth-state`
  Playwright project to match.

So everything on these pages is **built and unused**. The contracts are real, the wiring
is real, and the first page object will be the first thing to exercise any of it. Where a
page describes how a page object _would_ use something, it says so rather than implying a
caller that is not there.
