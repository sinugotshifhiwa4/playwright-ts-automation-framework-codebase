# Core

**[← Back to Documentation](../README.md)**

`src/config/` and `src/utils/` — the machinery the test layers are built on. **Nothing in this
section knows that a test exists.**

That is the line between this section and [04-layers/](../04-layers/README.md). A page object
calls the layers; the layers call this. The dependency points one way and never back, which is
what [DEPENDENCY_MAP.md](DEPENDENCY_MAP.md) exists to show.

**Start with [DEPENDENCY_MAP.md](DEPENDENCY_MAP.md).** It maps the whole of `src/` — which module
imports which, and the layers that fall out of that. The four groups below are those layers,
bottom to top: each can be read without a forward reference to the next.

| Group                                 | Covers                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [foundation/](foundation/README.md)   | The logger, the sanitizer, the error handler. The bottom of the graph — they import nothing from `src/`. |
| [utilities/](utilities/README.md)     | The file managers, the path resolvers, and the shared helpers.                                           |
| [environment/](environment/README.md) | How a `.env` file or a CI variable becomes a value a test can read.                                      |
| [execution/](execution/README.md)     | How a run is set up before a single test executes: the projects, the workers, and the auth state file.   |

## Scope, Honestly

**Every module in `src/config/` and `src/utils/` now has a page.** The four groups above cover
the lot.

What is documented is the code, not its use: `tests/` is still empty, so nothing here has been
exercised by a real spec. Where a module is built but nobody calls it yet — six of the ten UI
timeouts, the parsing suite, the placeholder guard — the page covering it says so rather than
implying a caller that does not exist.

The `scripts/` tooling is the one thing outside this section that `DEPENDENCY_MAP.md` maps but no
page describes in full, beyond the report commands covered in
[execution/REPORTING.md](execution/REPORTING.md).
