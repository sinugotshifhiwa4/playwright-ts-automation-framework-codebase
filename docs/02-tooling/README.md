# Tooling

**[← Back to Documentation](../README.md)**

How the development tooling is put together, and why — the quality gates that run on every
commit, and the agent setup that makes the planning rule hold. Reference material: read it
when the task calls for it, not on every request.

**This section is not about `src/config/`.** That is runtime configuration — the logger, the
environment, the Playwright projects — and it lives in
[03-core/](../03-core/README.md). This section is about the tooling that checks the
code, not the code that runs the tests.

| Page                                               | Covers                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [QUALITY_ARCHITECTURE.md](QUALITY_ARCHITECTURE.md) | Policy as data in `src/config/`, dumb executors in `scripts/`, and the gates that enforce them.        |
| [AGENT_SETUP.md](AGENT_SETUP.md)                   | Configuring your own `~/.claude/` so the planning gate holds on every turn, not just at session start. |

**Read `QUALITY_ARCHITECTURE.md` before changing any configuration.** Almost every
file in `src/config/` and `scripts/` depends on at least one other, and the
dependencies are not visible from the directory listing — which is what the diagrams
on that page exist to show.
