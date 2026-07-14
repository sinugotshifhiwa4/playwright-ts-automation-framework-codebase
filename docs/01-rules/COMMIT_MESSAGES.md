---
name: commit-messages
description: The commit message format for this framework. Short, traceable, easy to scan in git history, pull requests and CI reports. Body is 1-3 lines and states the reason for the change, not a list of files.
alwaysApply: true
---

# Commit Messages

**[← Back to Main Documentation](../../README.md)**

This page defines the commit message format for the PRODUCT automation framework.

Commit messages should be short, traceable, and easy to scan in git history, pull requests, and CI reports.

## Table of Contents

- [Core Convention](#core-convention)
- [This Is Enforced](#this-is-enforced)
- [Format](#format)
  - [Subject Line](#subject-line)
  - [Body](#body)
- [Examples](#examples)
  - [Automation Test Change](#automation-test-change)
  - [UI Regression Fix](#ui-regression-fix)
  - [Documentation Update](#documentation-update)
- [Branch Naming](#branch-naming)
- [Commit Governance](#commit-governance)
- [AI Prompt Pattern](#ai-prompt-pattern)
- [Practical Outcome](#practical-outcome)

## Core Convention

Conventional Commit formatting, with the Jira ticket in the subject line.

```text
<type>(<scope>): [PRODUCT-xxxx] <short summary>

- brief reason for the change
- test: <spec-file-name> (<test description>)
```

**The ticket is optional.** [COMMIT_WORKFLOW.md](COMMIT_WORKFLOW.md) step 4 says to
ask for one and to proceed without it if there is none, so a commit with no ticket is
accepted. What is _not_ optional is that a ticket, when there is one, is written
correctly: in square brackets, in the subject, immediately after the colon. A ticket
loose in the summary — `feat(ui): PRODUCT-1234 add login` — is rejected, because every
tool that scrapes tickets out of history will miss it and the traceability the ticket
exists to provide is silently absent.

## This Is Enforced

`.husky/commit-msg` runs `scripts/quality/validate-commit-msg.mjs` against the message
you just wrote, before the commit object exists. A malformed message is rejected; the
staged files stay staged and the message stays in `.git/COMMIT_EDITMSG`, so the fix is
one `git commit` away.

**Why a separate hook, when there is already a pre-commit hook doing six checks?**
Because `pre-commit` runs _before the message exists_. It has nothing to look at.

That is not a theoretical gap. This subject reached history and was pushed:

```text
@ feat(quality): enforce naming, JSDoc, and agent standards
```

A shell quoting mistake put a stray `@` and a space in front of the type. It passed all six
pre-commit checks — every one of them was inspecting files, and none of them was
looking at the message. The stray character is invisible in a terminal and fatal to
anything that parses the type: a changelog generator or `semantic-release` reads that
subject, fails to match a Conventional Commit, and **silently drops the commit from
the release notes**. Nobody notices until the release notes are wrong.

Fixing it after the push cost a force-push and a rewrite of published history. Caught
at `commit-msg`, it costs nothing.

What is rejected:

| Rejected                           | Why                                                          |
| ---------------------------------- | ------------------------------------------------------------ |
| `@ feat(quality): enforce naming`  | Anything before the type. The pattern is anchored at `^`.    |
| `feature(ui): add login page`      | `feature` is not a type. It is `feat`.                       |
| `config(eslint): add jsdoc module` | `config` is a scope, not a type. Use `refactor(config):`.    |
| `feat: add login page`             | The scope is required.                                       |
| `feat(UI): add login page`         | The scope must be lowercase.                                 |
| `feat(ui): PRODUCT-1234 add login` | The ticket must be bracketed: `[PRODUCT-1234]`.              |
| A subject over 72 characters       | It stops being scannable in `git log --oneline`.             |
| A body over 3 lines                | The diff already lists the files, and does it better.        |
| A `Co-Authored-By:` trailer        | No agent attribution — see [AGENT_RULES.md](AGENT_RULES.md). |

`Merge`, `Revert`, `fixup!` and `squash!` messages are skipped: Git writes those, not
you, and rejecting them would fail the one message its author never chose.

The permitted types, the length limits, and whether the ticket is required all live in
`src/config/quality/commit.mjs`. Change the policy there; the validator never changes.

## Format

### Subject Line

Format:

```text
<type>(<scope>): [PRODUCT-xxxx] <short summary>
```

The type must be one of these, and nothing else:

| Type       | Use it when                                   |
| ---------- | --------------------------------------------- |
| `test`     | Automation coverage changed. **The default.** |
| `feat`     | A new framework capability.                   |
| `fix`      | A bug was fixed.                              |
| `refactor` | The code changed; the behaviour did not.      |
| `docs`     | Documentation only.                           |
| `chore`    | Dependencies, tooling, housekeeping.          |
| `ci`       | The pipeline.                                 |
| `perf`     | Performance.                                  |
| `revert`   | Undoing a previous commit.                    |

**One name per concept.** There is no `feature` — it is `feat`. There is no `config`
type: `config` describes the _area_ a change touches, not the kind of change it is, so
it belongs in the parentheses (`refactor(config):`, never `config(eslint):`). Two names
for one concept means anything that groups commits by type produces two buckets for the
same thing, which is the whole reason the type exists.

Other rules for the subject:

- for automation changes, `test` is the default unless the change is primarily a bug fix, a new framework capability, a refactor, or a documentation update
- keep the scope relevant to the area changed, and lowercase
- if there is a Jira ticket, put it in brackets, once, immediately after the colon
- make the summary action-oriented and short — 72 characters at most
- nothing may precede the type. Not a space, not a stray character.

The list above is declared in `src/config/quality/commit.mjs` and enforced by
`.husky/commit-msg`. Add a type there, not here — and only when it answers a question
none of these already answer.

### Body

The body must be 1–3 lines maximum. Always follow this exact structure:

```text
- brief reason for the change
- test: <spec-file-name> (<test description>)
```

Rules:

- write 1–3 lines only — do not list every file or change touched
- the first line captures the main reason the change was needed
- only include the `test:` line when a spec or test file was directly affected
- if no spec file was affected, the body is just 1–3 lines on why the change was made

## Examples

### Automation Test Change

```text
test(auth): [PRODUCT-1234] update admin login validation

- align coverage with the latest login rules
- test: Communication.spec.ts (add bulk permanent comments)
```

### UI Regression Fix

```text
fix(ui): [PRODUCT-2345] stabilize supply chain status assertion

- prevent flaky failures during QA verification
- test: ClothingApprovals.spec.ts (approve stock)
```

### Documentation Update

```text
docs(contributing): [PRODUCT-3456] add branching and commit guidance

- document the agreed delivery workflow for automation contributors
```

## Branch Naming

Branch names must be all lowercase, except for Jira ticket numbers which must remain uppercase (`PRODUCT-xxxx`).

Format:

```text
<type>/<PRODUCT-xxxx>/<short-description>
```

For branches that span multiple tickets:

```text
<type>/<PRODUCT-xxxx>/<PRODUCT-yyyy>/<short-description>
```

Rules:

- use lowercase for the branch type (`feature`, `fix`, `hotfix`, `docs`, `refactor`)
- use lowercase, hyphen-separated words for the description segment
- preserve the uppercase Jira ticket number exactly as issued (`PRODUCT-xxxx`)
- do not use camelCase, PascalCase, or mixed case anywhere except the ticket number

Examples:

```text
feature/PRODUCT-3945/framework
feature/PRODUCT-3945/PRODUCT-4170/consumables-migration
fix/PRODUCT-1234/login-page-timeout
docs/PRODUCT-5678/update-branching-guide
```

## Commit Governance

- follow Conventional Commit formatting
- include the Jira ticket in the format `[PRODUCT-xxxx]`
- keep the subject short, clear, and action-oriented
- keep the body to 1–3 lines maximum
- write only the main reason the change was made — do not list every file or change touched
- include the relevant spec file in the body only when a test or spec file was affected
- do not write vague subjects like `updates` or `fix stuff`
- do not omit the Jira ticket
- do not include long technical breakdowns or bullet lists in the body
- do not add a `test:` line when no test or spec file was affected

## AI Prompt Pattern

Attach the files with `@`, so the assistant reads the actual format rules rather than
guessing at a generic commit style:

```text
@docs/01-rules/COMMIT_MESSAGES.md write a commit message for the changes in @src/config/quality/naming.mjs
```

```text
@docs/01-rules/COMMIT_MESSAGES.md does this commit message follow the framework format? <paste message here>
```

When the change touches a spec file, name it explicitly so the `test:` line can be
written correctly:

```text
@docs/01-rules/COMMIT_MESSAGES.md write a commit message. The Jira ticket is PRODUCT-1234. The spec file affected is Login.spec.ts. The test is "rejects an expired password".
```

This file is `alwaysApply: true` and imported by `CLAUDE.md`, so Claude Code already
has it loaded in every session — the `@` above matters for any other assistant, and
for making the prompt self-contained when it is pasted somewhere else.

## Practical Outcome

Following this format keeps git history consistent and scannable.

Every commit connects to a Jira ticket, describes intent clearly, and stays easy to review in pull requests, CI reports, and audit trails.
