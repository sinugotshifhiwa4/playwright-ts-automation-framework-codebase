# Layers

**[← Back to Documentation](../README.md)**

A **layer** is a kind of test, and the machinery that kind of test needs. A UI test needs
a browser, a storage state, and a page to act on; an API test needs none of those. The
layer is what decides.

The distinction is load-bearing rather than decorative. It is what the Playwright
projects key off, what `tests/layers/<layer>/…` mirrors, and why
`fixtures/config.fixtures.ts` — the environment, and nothing else — is separate from
`fixtures/test.ui.fixtures.ts`, which adds the browser on top. A future API layer extends
the first and stops there.

| Section             | Covers                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| [ui/](ui/README.md) | `src/layers/ui/` — the page actions, the browser context, and the login flow. |

**The UI layer is the only one that exists.** There is no `src/layers/api/` and no
`src/layers/db/`.

The runner is nonetheless ready for them, which is worth knowing before you assume the
`test:api` script is a stub: `scripts/execution/test-executor.ts` reads `TEST_LAYER`, maps
`api` and `db` to `tests/layers/api` and `tests/layers/db`, and skips browser
initialization for both. What is missing is the code and the tests, not the plumbing.
When a layer is built, it gets a folder here beside `ui/`.

For where these layers sit in the dependency graph — and what they are permitted to
import — see [DEPENDENCY_MAP.md](../03-core/DEPENDENCY_MAP.md). The UI layer is Layer 6,
the top of the stack.
