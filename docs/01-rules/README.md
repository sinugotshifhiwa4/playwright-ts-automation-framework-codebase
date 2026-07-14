# Rules

**[← Back to Documentation](../README.md)**

Standing rules. Every page here carries `alwaysApply: true` and is imported by
`CLAUDE.md`, which means it is loaded at the start of every session and governs
every request — these are not reference material you go and look up.

`scripts/quality/validate-always-apply.mjs` enforces that in both directions: a page
here that is not imported by `CLAUDE.md` is a rule nothing obeys, and an import
without the marker is a document silently governing every session. Both fail the
commit.

| Page                                           | Governs                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| [AGENT_RULES.md](AGENT_RULES.md)               | How an AI assistant behaves — answer before acting, and where it must stop. |
| [TASK_PLANNING.md](TASK_PLANNING.md)           | Plan before implementing; one task at a time; validate before moving on.    |
| [CONVENTIONS.md](CONVENTIONS.md)               | What a file is called and where it lives. Folders, source, tests, docs.     |
| [CODE_QUALITY.md](CODE_QUALITY.md)             | The JSDoc block every method must carry, and its exact format.              |
| [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) | Branch naming, environment pairing, and the promotion chain to `main`.      |
| [COMMIT_WORKFLOW.md](COMMIT_WORKFLOW.md)       | The gates a change passes before a commit exists.                           |
| [COMMIT_MESSAGES.md](COMMIT_MESSAGES.md)       | The commit message format, and the Jira ticket in every subject line.       |

## Reading Order

If you are new, read them in this order. It runs from _how work is done_ to _how it
lands_:

1. **[AGENT_RULES.md](AGENT_RULES.md)** — the conduct everything else assumes.
2. **[TASK_PLANNING.md](TASK_PLANNING.md)** — how a request becomes a plan.
3. **[CONVENTIONS.md](CONVENTIONS.md)** — what to name the file you are about to add.
4. **[CODE_QUALITY.md](CODE_QUALITY.md)** — what to write inside it.
5. **[BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md)** — where the work lives.
6. **[COMMIT_WORKFLOW.md](COMMIT_WORKFLOW.md)** and
   **[COMMIT_MESSAGES.md](COMMIT_MESSAGES.md)** — how it lands.
