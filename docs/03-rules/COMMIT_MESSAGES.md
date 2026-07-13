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

Follow Conventional Commit formatting with a Jira ticket in every subject line.

```text
<type>(<scope>): [PRODUCT-xxxx] <short summary>

- brief reason for the change
- test: <spec-file-name> (<test description>)
```

## Format

### Subject Line

Format:

```text
<type>(<scope>): [PRODUCT-xxxx] <short summary>
```

- use a valid Conventional Commit type: `test`, `fix`, `feat`, `refactor`, or `docs`
- for automation changes, `test` is the default type unless the change is primarily a bug fix, new framework capability, refactor, or documentation update
- keep the scope relevant to the area changed
- include the Jira ticket exactly once in the subject
- make the summary action-oriented and short

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
@docs/03-rules/COMMIT_MESSAGES.md write a commit message for the changes in @src/config/quality/naming.mjs
```

```text
@docs/03-rules/COMMIT_MESSAGES.md does this commit message follow the framework format? <paste message here>
```

When the change touches a spec file, name it explicitly so the `test:` line can be
written correctly:

```text
@docs/03-rules/COMMIT_MESSAGES.md write a commit message. The Jira ticket is PRODUCT-1234. The spec file affected is Login.spec.ts. The test is "rejects an expired password".
```

This file is `alwaysApply: true` and imported by `CLAUDE.md`, so Claude Code already
has it loaded in every session — the `@` above matters for any other assistant, and
for making the prompt self-contained when it is pasted somewhere else.

## Practical Outcome

Following this format keeps git history consistent and scannable.

Every commit connects to a Jira ticket, describes intent clearly, and stays easy to review in pull requests, CI reports, and audit trails.
