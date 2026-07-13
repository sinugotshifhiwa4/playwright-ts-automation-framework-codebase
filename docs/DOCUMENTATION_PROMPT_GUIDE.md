# Documentation Prompt Guide

**[← Back to Main Documentation](../README.md)**

This page explains how to write framework documentation in the same style used across `docs/`.

It is meant for:

- contributors writing docs manually
- contributors using AI to draft docs
- reviewers who want a consistent documentation standard

## Table of Contents

- [Why This Guide Exists](#why-this-guide-exists)
- [What Good Framework Docs Should Do](#what-good-framework-docs-should-do)
- [Default Writing Style](#default-writing-style)
- [Page Structure Pattern](#page-structure-pattern)
- [Heading Rules](#heading-rules)
- [Content Rules](#content-rules)
- [Framework-Specific Documentation Rules](#framework-specific-documentation-rules)
- [What To Avoid](#what-to-avoid)
- [Suggested Page Template](#suggested-page-template)
- [How to Attach Files in Prompts](#how-to-attach-files-in-prompts)
  - [Local File References](#local-file-references)
  - [MCP Resource References](#mcp-resource-references)
  - [Why This Matters](#why-this-matters)
- [Prompt Template For AI-Assisted Writing](#prompt-template-for-ai-assisted-writing)
- [Review Checklist](#review-checklist)
- [Practical Outcome](#practical-outcome)

## Why This Guide Exists

The framework documentation is intentionally structured and repetitive in a good way.

That consistency makes the docs:

- easier to scan
- easier to maintain
- easier for new contributors to trust
- easier to expand without changing tone or structure every time

This guide captures the pattern already used across setup, rules, UI layer, test data, utilities, CI, and workflow pages.

## What Good Framework Docs Should Do

A good framework page should:

- explain what a framework area is
- explain why it exists
- explain how it is structured
- explain how it connects to other framework parts
- give practical examples where useful
- stay focused on one topic instead of covering everything at once

Framework docs are not marketing copy.

They should be practical, explicit, and easy to follow.

## Default Writing Style

Use this tone by default:

- clear
- direct
- calm
- instructional
- framework-specific

Write short paragraphs.

Prefer simple sentences over dense explanations.

When listing responsibilities, files, rules, or examples, use bullet lists.

Use wording such as:

- "This page explains..."
- "This group contains..."
- "This is useful because..."
- "The flow works like this..."
- "Examples include..."

Avoid vague wording such as:

- "best-in-class"
- "powerful solution"
- "robust ecosystem"
- "seamless integration"

## Page Structure Pattern

Most framework pages should follow this shape:

1. Title
2. Back link
3. Short introduction
4. `## Table of Contents`
5. Main sections in a logical reading order
6. Final outcome or summary section

The introduction should usually answer:

- what this page covers
- where the code lives
- why the topic matters

## Heading Rules

Use headings in a predictable hierarchy:

- `#` for the page title
- `##` for main sections
- `###` for subsections inside a main section
- `####` only when the page genuinely needs one more level

The table of contents must match the real heading structure.

If the page uses `##`, `###`, and `####`, the table of contents should reflect those levels instead of flattening them.

Keep headings descriptive and practical.

Prefer:

- `## Why This Layer Exists`
- `## Main Files`
- `## How This Group Connects To Execution`
- `## Practical Outcome`

Avoid vague headings such as:

- `## Notes`
- `## Misc`
- `## Other`

## Content Rules

When documenting a framework topic:

- start with the framework role before implementation detail
- explain responsibility before examples
- explain connections, not only isolated files
- use real framework paths and filenames
- keep examples grounded in the current repo structure

Good documentation usually answers these questions:

- what is this
- why is it here
- what files are involved
- how does it work
- what does it connect to
- why should a contributor care

## Framework-Specific Documentation Rules

When writing docs for this framework:

- use real paths such as `src/layers/ui/pages/`, `fixtures/test.fixture.ts`, and `scripts/test-executor.ts`
- keep the current practical scope honest
- if only UI is actively used, say so plainly
- do not describe inactive areas as fully operational unless they really are
- keep setup, rules, layers, CI, and workflows separated by responsibility
- describe the chain between files when the behavior is connected

Examples of good framework-specific phrasing:

- "This file is the bridge between `package.json` commands and `playwright.config.ts`."
- "This layer supports shared runtime state and browser-context control for UI execution."
- "This keeps tests focused on business scenarios while shared setup logic stays centralized."

## What To Avoid

Do not:

- write generic documentation that could describe any project
- dump large code blocks when a short explanation is enough
- explain code without explaining why it matters
- mix multiple unrelated topics into one page
- overuse deep heading levels
- use inconsistent terminology for the same concept
- promise behavior that the current framework does not actually support

Also avoid doing a huge documentation rewrite all at once when only one page or one folder needs work.

Prefer smaller, manageable documentation updates that can be reviewed and checked incrementally.

## Suggested Page Template

Use this template for most new framework pages:

```md
# Page Title

**[â† Back to Main Documentation](../../../README.md)**

This page explains...

Optional second paragraph if the page needs a little more context.

## Table of Contents

- [Section One](#section-one)
- [Section Two](#section-two)
  - [Subsection](#subsection)
- [Practical Outcome](#practical-outcome)

## Section One

Explain the responsibility first.

## Section Two

Explain the structure, flow, or rules.

### Subsection

Add examples, grouped files, or a focused breakdown.

## Practical Outcome

Summarize what this part of the framework gives contributors.
```

Adjust the relative `README.md` path based on the file location.

## How to Attach Files in Prompts

When prompting Claude or any AI assistant in the terminal, always attach the relevant framework files before asking a question.

This ensures the AI reads the actual framework rules and code before responding, instead of guessing or relying on general knowledge.

### Local File References

Use `<filepath>path/to/file</filepath>` to include a file's content directly in the prompt:

```text
<filepath>docs/framework/02-rules/code-quality.md</filepath> review the naming in <filepath>src/utils/errorHandling/errorHandler.ts</filepath>
```

```text
<filepath>docs/framework/02-rules/commit-messages.md</filepath> write a commit message for the changes in <filepath>src/layers/ui/pages/loginPage.ts</filepath>
```

```text
<filepath>docs/framework/02-rules/logging-and-error-handling.md</filepath> does this method follow the error handler pattern? <filepath>src/utils/errorHandling/errorHandler.ts</filepath>
```

Multiple files can be attached in a single prompt:

```text
<filepath>docs/framework/02-rules/code-quality.md</filepath> <filepath>docs/framework/02-rules/logging-and-error-handling.md</filepath> review this file for both quality and error handling: <filepath>src/layers/ui/pages/loginPage.ts</filepath>
```

The `<filepath>` tag guarantees the file is loaded before the AI starts its response.

### MCP Resource References

If MCP servers are connected, use `@server:resource` to pull in external data:

```text
@github:repos/owner/repo/issues list the open issues related to error handling
```

The format depends on the MCP server configuration in use.

### Why This Matters

Without attaching the relevant files:

- the AI responds based on general assumptions rather than the actual framework rules
- code quality, error handling, and commit message guidance may be misapplied
- the AI cannot verify whether existing code already follows the framework pattern

Always attach the relevant rule doc and the file being worked on before asking the AI for any framework-specific guidance.

## Prompt Template For AI-Assisted Writing

Use this prompt when asking AI to draft a framework documentation page:

```text
Write a Markdown documentation page for the PRODUCT automation framework.

Follow these rules:
- Match the existing style used in docs/framework.
- Start with a # title.
- Add a back link to the main README.
- Write a short introduction that explains what the page covers and why it matters.
- Add a Table of Contents that matches the real heading levels used in the page.
- Use clear ## and ### headings.
- Keep the tone practical, direct, and framework-specific.
- Use real framework paths and filenames where relevant.
- Explain what the area is, why it exists, how it is structured, and how it connects to other framework parts.
- Prefer short paragraphs and bullet lists.
- Avoid generic wording, marketing language, and filler.
- Be honest about current practical scope.
- If the topic involves a flow, explain it step by step.
- End with a practical outcome section when appropriate.

Topic:
[insert topic here]

Relevant framework paths/files:
[insert real paths here]

Important constraints:
[insert constraints here]
```

If the page already exists and needs editing, also add:

```text
Do not rewrite everything unnecessarily.
Keep the current structure where it already works.
Make the smallest useful documentation improvement that brings the page in line with the framework docs style.
```

## Review Checklist

Before finalizing a page, check:

- the title matches the real topic
- the back link path is correct
- the introduction explains the page clearly
- the table of contents matches the actual headings
- headings are practical and consistent
- file paths and examples are real
- the writing is framework-specific, not generic
- the current practical scope is described honestly
- the page explains both structure and purpose
- the page is readable in small sections

## Practical Outcome

Using this guide should help contributors produce docs that feel like part of one coherent framework manual instead of a mix of unrelated writing styles.

That makes the documentation easier to grow, easier to review, and easier for other people to use confidently.
