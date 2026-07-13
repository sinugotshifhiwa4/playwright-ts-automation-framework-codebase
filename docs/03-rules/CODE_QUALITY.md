---
name: code-quality
description: The code standards every method must meet — the JSDoc block, its exact format, and the ESLint rules that reject a method without one.
alwaysApply: true
---

# Code Quality

**[← Back to Main Documentation](../../README.md)**

This page defines the standards a method must meet before it can be committed. It
currently covers one: **every method carries a JSDoc block.**

The rule is enforced by ESLint, not by review. `src/config/eslint/jsdoc.mjs`
declares it, and a method without a documentation block fails `npm run lint` — so
it is underlined in the editor as you write it, and rejected by `.husky/pre-commit`
if you push past that.

For _naming_ — what a file is called and where it lives — see
[CONVENTIONS.md](./CONVENTIONS.md).

## Table of Contents

- [Documentation Rules](#documentation-rules)
  - [The Format](#the-format)
  - [Tag Rules](#tag-rules)
  - [Worked Example](#worked-example)
- [Why Private Methods Too](#why-private-methods-too)
- [Why Types Are Not Written In JSDoc](#why-types-are-not-written-in-jsdoc)
- [What Is Enforced](#what-is-enforced)
- [Practical Outcome](#practical-outcome)

## Documentation Rules

**Every method created or modified must have a JSDoc comment. No exceptions,
including private methods and constructors.**

Specs are exempt. A test's title is its documentation, and a `@returns` tag above
`test("logs in", ...)` is noise. The rule is scoped to `src/`.

### The Format

```ts
/**
 * Describes what the method does in one sentence.
 * @param paramName - Description of the parameter.
 * @returns A promise that resolves when <what happens>.
 */
```

### Tag Rules

- **Description.** One sentence, always. It says what the method _does_, not how it
  is implemented.
- **`@param`.** One per parameter, in declaration order, each with a `-` before the
  description. Omit the tag entirely when the method takes no parameters.
- **`@returns`.** Always present on an `async` method. For `Promise<void>`, write
  `A promise that resolves when <outcome>.` Omit `@returns` only on a synchronous
  method returning `void`.
- **No types.** Never write `@param {string} name`. TypeScript already declares the
  type.

### Worked Example

```ts
/**
 * Drives the login screen.
 */
export class LoginPage {
  /**
   * Creates a page object bound to an open browser page.
   * @param page - The Playwright page this object drives.
   */
  constructor(private readonly page: Page) {}

  /**
   * Signs a user in with the supplied credentials.
   * @param username - The account's username.
   * @param password - The account's password.
   * @returns A promise that resolves when the credentials have been submitted.
   */
  async login(username: string, password: string): Promise<void> {
    await this.page.getByLabel("Username").fill(username);
    await this.page.getByLabel("Password").fill(password);
    await this.clickSubmit();
  }

  /**
   * Submits the login form.
   * @returns A promise that resolves when the submit button has been clicked.
   */
  private async clickSubmit(): Promise<void> {
    await this.page.getByRole("button", { name: "Sign in" }).click();
  }
}
```

## Why Private Methods Too

The usual argument is that a private method has no external callers, so nobody needs
its contract. That gets it backwards.

A public method's meaning is legible from its call sites — you can see what a
caller expects of it. A private one has no such witnesses, and it is usually where
the subtle logic ended up: the retry, the wait, the workaround for a flaky widget.
It is the method most in need of a sentence explaining itself, and the one least
likely to get it if the rule carves out an exception.

## Why Types Are Not Written In JSDoc

`jsdoc/no-types` rejects `@param {string} username` outright.

The type is already declared, in the signature, where the compiler checks it. A
JSDoc copy is a second declaration that nothing checks and nobody updates — so the
day the signature changes to `username: UserId`, the JSDoc still says `{string}`
and is now actively lying. Documentation that can drift silently from the code is
worse than no documentation, because it is trusted.

The description is the part a type cannot express. That is why the description is
mandatory and the type is banned.

## What Is Enforced

`src/config/eslint/jsdoc.mjs`, scoped to `src/**/*.ts`:

| Rule                                            | Rejects                                               |
| ----------------------------------------------- | ----------------------------------------------------- |
| `jsdoc/require-jsdoc`                           | A class, method, or function with no block            |
| `jsdoc/require-description`                     | A block with no sentence in it                        |
| `jsdoc/require-param`                           | A parameter with no `@param`                          |
| `jsdoc/require-param-description`               | A `@param` that names but does not describe           |
| `jsdoc/require-returns`                         | An `async` method with no `@returns`                  |
| `jsdoc/require-returns-description`             | A bare `@returns` with nothing after it               |
| `jsdoc/require-hyphen-before-param-description` | `@param name Description` — the `-` is required       |
| `jsdoc/check-param-names`                       | A `@param` naming a parameter that does not exist     |
| `jsdoc/no-types`                                | `@param {string}` — the type belongs in the signature |
| `jsdoc/check-alignment`, `empty-tags`           | A malformed or empty block                            |

`forceReturnsWithAsync` is the load-bearing option on `require-returns`. Without it,
an `async` method returning `Promise<void>` has no `return` statement, so the rule
sees nothing to document and stays silent — leaving exactly the methods whose
completion semantics a caller most needs to understand undocumented.

Check it yourself:

```bash
npm run lint
```

## Practical Outcome

Every method in `src/` states what it does, what it takes, and what it resolves to —
and the standard cannot rot, because a method without a block does not compile past
the linter. The cost is paid at the moment the method is written, which is the only
moment the author still has the context to write the sentence cheaply.
