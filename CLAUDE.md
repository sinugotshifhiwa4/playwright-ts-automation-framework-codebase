# Project Instructions

## Always-Apply Files

The files imported below carry `alwaysApply: true` in their frontmatter. They are
standing rules, not reference material: they are loaded at the start of every
session and govern every request, without exception.

This file is the mechanism that makes that true. `alwaysApply: true` is a marker
of intent — Claude Code does not read it — so a rule is only actually in force
once it is imported here. **A new `alwaysApply: true` document must be added to
this list, or it does nothing.**

@docs/03-rules/AGENT_RULES.md
@docs/03-rules/COMMIT_WORKFLOW.md
@docs/03-rules/COMMIT_MESSAGES.md
@docs/03-rules/BRANCHING_STRATEGY.md
@docs/03-rules/CONVENTIONS.md
@docs/03-rules/CODE_QUALITY.md
@docs/03-rules/TASK_PLANNING.md

## The Rules In Brief

The imported documents are authoritative. This summary exists so the load-bearing
constraints are impossible to miss:

- **Answer before acting.** A question gets an answer, not an edit. Explain the
  context and the options, then ask "Do you want me to make these changes?" and wait.
- **Never guess a broken path.** When an import or reference points at a file that
  does not exist, stop. Report the file, the line, and what is missing — then ask what
  it should be. Do not infer the intended target, however obvious it looks: the broken
  path may mean the file is unwritten or misplaced, and "fixing" the import hides that.
- **Never commit without approval.** Run `npm run validate`, present a summary of
  what changed and why, and wait for an explicit yes. Then draft the commit message,
  show it, and ask for the Jira ticket (`PRODUCT-xxxx`). Never stage and commit in
  one action. This applies even when the user says "commit" — the summary and
  confirmation still come first. Never add a `Co-Authored-By` trailer.
- **Never create branches.** The user creates the branch before work begins. If no
  feature branch exists, stop and ask; do not create one on their behalf.
- **Ask before writing documentation.** After a major change, ask whether docs are
  wanted and where. Do not write them unprompted.
- **Plan before implementing.** Every request starts with a work plan (Goal,
  Success Criteria, Assumptions, Constraints, Risks) and an explicit TODO list,
  executed one task at a time and self-validated before each is marked complete.
- **Name files by the conventions.** Folders are lowercase and hyphenated
  (`test-data`, never `testData`); `src/` is camelCase (`loginPage.ts`); `tests/` is
  PascalCase (`Login.spec.ts`); docs are UPPERCASE (`COMMIT_MESSAGES.md`). The
  pre-commit hook rejects the rest — check with `npm run verify:names`.
- **Every method gets a JSDoc block**, including private ones. ESLint rejects a
  method without one.

## Reference

Not always-applied. Read when the task calls for it:

- `docs/01-config/QUALITY_ARCHITECTURE.md` — how the quality tooling fits together.
  Read before changing any configuration.
- `docs/DOCUMENTATION_PROMPT_GUIDE.md` — how to write documentation in this repo.
  Read before adding or editing a page under `docs/`.
