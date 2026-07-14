# Execution

**[← Back to Core](../README.md)**

How a run is set up before a single test executes: what Playwright is handed, how much of the
machine it may use, and the signed-in session every test inherits.

| Page                                                   | Covers                                                                                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [PLAYWRIGHT_PROJECTS.md](PLAYWRIGHT_PROJECTS.md)       | `src/config/projects/` and `src/config/flags/`: the setup project the browsers depend on, the Chromium-only launch flags, and the flag that empties them all. |
| [WORKER_ALLOCATION.md](WORKER_ALLOCATION.md)           | `src/config/runtime/workers/`: a percentage of the cores locally, a fair split of them per shard in CI.                                                       |
| [AUTHENTICATION_STORAGE.md](AUTHENTICATION_STORAGE.md) | `src/config/authentication/`: the `.auth` state file — where it lives, why it is emptied before every run, and one copy per shard.                            |
| [TIMEOUTS.md](TIMEOUTS.md)                             | `src/config/timeouts/`: every wait the framework performs, named in one place and doubled automatically in CI.                                                |
| [REPORTING.md](REPORTING.md)                           | `src/config/reports/` and `scripts/reports/`: which reporters run where, and the two commands that serve and reclaim the report server.                       |

## Why Auth Storage Is Filed Here

By the dependency graph it belongs one layer lower, beside
[environment/](../environment/README.md) — `src/config/authentication/` sits at Layer 4, not
Layer 5.

It is here because of what it is _for_. The `.auth` file is written by `globalSetup`, filled by
the `setup-auth-state` project, and read by every test that follows: it is part of how a run is
prepared, in the same sense that the projects and the workers are. Filing it by its import depth
would have been more correct and less useful.

The login _flow_ — who drives the form, and when — is a different thing again, and lives in
[04-layers/ui/AUTHENTICATION.md](../../04-layers/ui/AUTHENTICATION.md). This page is the file
on disk; that page is the flow that fills it.
