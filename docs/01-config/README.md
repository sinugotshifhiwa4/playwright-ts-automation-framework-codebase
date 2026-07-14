# Config

**[← Back to Documentation](../README.md)**

How the tooling is put together, and why. Reference material — read it when the task
calls for it, not on every request.

| Page                                               | Covers                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [QUALITY_ARCHITECTURE.md](QUALITY_ARCHITECTURE.md) | Policy as data in `src/config/`, dumb executors in `scripts/`, and the gates that enforce them.        |
| [AGENT_SETUP.md](AGENT_SETUP.md)                   | Configuring your own `~/.claude/` so the planning gate holds on every turn, not just at session start. |

**Read `QUALITY_ARCHITECTURE.md` before changing any configuration.** Almost every
file in `src/config/` and `scripts/` depends on at least one other, and the
dependencies are not visible from the directory listing — which is what the diagrams
on that page exist to show.
