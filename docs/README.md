# Documentation

**[← Back to Main README](../README.md)**

All framework documentation lives here. Sections are numbered so they read in a
sensible order, and each one carries its own index.

| Section                                                        | What it covers                                                             | Applies                                           |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| **[01 — Config](01-config/README.md)**                         | How the quality tooling fits together, and the gates that enforce it.      | On demand — read before changing configuration.   |
| **[03 — Rules](03-rules/README.md)**                           | Conduct, task planning, naming, code quality, branching, commits.          | **Always.** Loaded every session via `CLAUDE.md`. |
| [DOCUMENTATION_PROMPT_GUIDE.md](DOCUMENTATION_PROMPT_GUIDE.md) | How to write a page here: structure, diagrams, and the definition of done. | On demand — read before adding or editing a page. |

## The Two Kinds Of Page

The distinction is the one thing worth understanding before reading anything else,
because it decides whether a page is a rule you must already be following or a
reference you go and look up.

- **Standing rules** live in [03-rules/](03-rules/README.md). They declare
  `alwaysApply: true`, they are `@import`ed by `CLAUDE.md` at the repository root,
  and they are therefore in force on every request without anyone opening them.
- **Everything else** is reference. It is `alwaysApply: false`, and it is read when
  the task calls for it.

The marker and the import must agree — a rule declared but not imported is a rule
nothing obeys, and an import without the marker is a document silently governing
every session. `scripts/quality/validate-always-apply.mjs` rejects both at commit
time.

## This Index Is Enforced

Every page in a folder must be linked from that folder's `README.md`, and every link
must resolve. `scripts/quality/validate-doc-index.mjs` checks it on every commit, so
adding a page and forgetting to list it fails the commit rather than quietly
producing a page nobody can find.

```bash
npm run verify:docs
```

That matters more than it sounds. A stale index does not look stale — it looks like a
complete list, and a page missing from it reads as a page that does not exist.

## Writing A Page

Read [DOCUMENTATION_PROMPT_GUIDE.md](DOCUMENTATION_PROMPT_GUIDE.md) first. It defines
the workflow, the required page structure, the frontmatter contract, when a Mermaid
diagram is mandatory, and the definition of done a page must pass before it is
finished.

`README.md` files are the exception: they are **indexes, not pages**. No frontmatter,
no table of contents. They exist to be the thing GitHub renders when someone browses
into the folder.
