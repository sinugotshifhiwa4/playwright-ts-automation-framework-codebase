# Core

**[← Back to Documentation](../README.md)**

`src/config/` and `src/utils/` — the machinery the test layers are built on. **Nothing in this
section knows that a test exists.**

That is the line between this section and [04-layers/](../04-layers/README.md). A page object
calls the layers; the layers call this. The dependency points one way and never back, which is
what [ARCHITECTURE.md](ARCHITECTURE.md) exists to show.

**Start with [ARCHITECTURE.md](ARCHITECTURE.md).** It maps the whole of `src/` — which module
imports which, and the layers that fall out of that. The four groups below are those layers,
bottom to top: each can be read without a forward reference to the next.

| Group                                 | Covers                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [foundation/](foundation/README.md)   | The logger, the sanitizer, the error handler. The bottom of the graph — they import nothing from `src/`. |
| [utilities/](utilities/README.md)     | The file managers, the path resolvers, and the shared helpers.                                           |
| [environment/](environment/README.md) | How a `.env` file or a CI variable becomes a value a test can read.                                      |
| [execution/](execution/README.md)     | How a run is set up before a single test executes: the projects, the workers, and the auth state file.   |

## Scope, Honestly

**Not covered:** the timeouts (`src/config/timeouts/`), the Ortoni report config
(`src/config/reports/`), and the `scripts/` tooling.

`ARCHITECTURE.md` is the exception — it maps **every** module, including those, because the
import statements it is drawn from are already there to be read. But for a module with no page,
the map names it and draws its edges and claims nothing more than that.
