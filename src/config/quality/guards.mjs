/**
 * What must never enter a commit, expressed as data.
 *
 * Policy lives here; the mechanism lives in scripts/quality/guard-staged.mjs.
 *
 * These guards deliberately overlap with ESLint. That is not redundancy — it is
 * defence in depth with different reach:
 *
 *   ESLint  sees TypeScript only, and only files it is configured to parse.
 *           Fast, precise, and shows up live in the editor.
 *   Guards  see the *staged bytes* of every file, including JSON, YAML, .env,
 *           and anything ESLint ignores. This is the layer that catches a secret
 *           pasted into a fixture, which no linter would ever look at.
 *
 * To extend: add a pattern to the right table. Every entry needs a `hint` — a
 * rejected commit must tell the engineer what to do next, not just what is wrong.
 */

/** Tunables. Flip these rather than editing the scripts. */
export const SETTINGS = {
  /** Reject any staged file larger than this. Test media belongs in storage, not Git. */
  maxFileSizeKb: 500,

  /** TODO/FIXME: set to true to reject them outright. Reported as a warning otherwise. */
  blockTodo: false,

  /** An inline escape hatch for a genuine false positive on a secret pattern. */
  allowMarker: "quality:allow-secret",
};

/**
 * Content that is always a mistake in a shared branch.
 * `appliesTo` narrows a pattern to the file types where it is meaningful.
 */
export const FORBIDDEN_PATTERNS = [
  {
    id: "merge-conflict",
    label: "unresolved merge conflict marker",
    pattern: /^(?:<{7}|={7}|>{7})(?:\s|$)/m,
    appliesTo: () => true,
    hint: "Finish the merge before committing.",
  },
  {
    id: "console-log",
    label: "console.log",
    pattern: /\bconsole\s*\.\s*log\s*\(/,
    appliesTo: (p) => /\.(ts|mts|cts)$/.test(p),
    // NOTE: once src/ has a Winston logger, point this hint at it by name.
    hint: "Use a structured logger, not stdout. console.error and console.warn are allowed.",
  },
  {
    id: "debugger",
    label: "debugger statement",
    pattern: /(?:^|[\s;{])debugger\s*(?:;|$)/m,
    appliesTo: (p) => /\.(ts|mts|cts|mjs|cjs|js)$/.test(p),
    hint: "Remove the breakpoint before committing.",
  },
  {
    id: "page-pause",
    label: "page.pause()",
    pattern: /\bpage\s*\.\s*pause\s*\(/,
    appliesTo: (p) => /\.(ts|mts|cts)$/.test(p),
    hint: "Debugging leftover. Use `npm run test:debug` instead of committing a pause.",
  },
  {
    id: "focused-test",
    label: "focused test (.only)",
    pattern: /\b(?:test|describe|it)\s*(?:\.\s*\w+\s*)*\.\s*only\s*\(/,
    appliesTo: (p) => /\.(ts|mts|cts)$/.test(p),
    hint: "A focused test silently disables the rest of the suite in CI.",
  },
  {
    id: "eslint-disable-playwright",
    label: "eslint-disable on a Playwright rule",
    pattern: /eslint-disable(?:-next-line|-line)?[^\n]*\bplaywright\//,
    appliesTo: (p) => /\.(ts|mts|cts)$/.test(p),
    hint: "The Playwright rules are the test-quality contract. Fix the test instead.",
  },
];

/**
 * Credential shapes. Deliberately biased towards precision over recall: a guard
 * that cries wolf gets bypassed with --no-verify, which is worse than no guard.
 * A genuine false positive can be marked with SETTINGS.allowMarker on the line.
 */
export const SECRET_PATTERNS = [
  {
    id: "aws-access-key",
    label: "AWS access key ID",
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  },
  {
    id: "private-key",
    label: "private key block",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  {
    id: "github-token",
    label: "GitHub token",
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
  },
  {
    id: "slack-token",
    label: "Slack token",
    pattern: /\bxox[abopsr]-[A-Za-z0-9-]{10,}\b/,
  },
  {
    id: "jwt",
    label: "JSON Web Token",
    pattern: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  },
  {
    id: "hardcoded-credential",
    label: "hardcoded credential",
    // Requires a quoted value of real length, so `password: userPassword` and
    // `password: ""` are ignored while `password = "hunter2-long-enough"` is not.
    //
    // The optional ["']? after the key name is load-bearing: in a JSON fixture
    // the key is itself quoted — "password": "..." — and without it the closing
    // quote breaks the match, silently missing the single case these guards
    // exist for (a credential in a fixture, which no linter ever parses).
    pattern:
      /(?:api[_-]?key|secret|password|passwd|access[_-]?token|auth[_-]?token)["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i,
  },
];

/** Paths that must never be staged at all, whatever their contents. */
export const FORBIDDEN_PATHS = [
  {
    id: "node-modules",
    label: "node_modules",
    test: (p) => p.split("/").includes("node_modules"),
    hint: "Dependencies are installed, not committed.",
  },
  {
    id: "env-file",
    label: "environment file",
    // .env, .env.local, .env.qa — but .env.example is the documented template.
    test: (p) => /(?:^|\/)\.env(?:\.|$)/.test(p) && !/\.env\.example$/.test(p),
    hint: "Commit .env.example with placeholder values instead.",
  },
  {
    id: "playwright-output",
    label: "generated test output",
    test: (p) =>
      /^(?:playwright-report|test-results|blob-report|ortoni-report)\//.test(p),
    hint: "Generated artefacts belong in CI, not in Git.",
  },
];

/**
 * Files that *declare* the policy, and so must not be scanned against it.
 *
 * This file names every forbidden pattern in plain text; scanning it for those
 * patterns just makes the framework flag itself. Excluding the policy layer is
 * not a loophole — these files contain no test logic and no credentials, and
 * they are the most-reviewed files in the repository by construction.
 */
export const POLICY_PATHS = [/^src\/config\/quality\//, /^scripts\/quality\//];

/**
 * The contract that makes a standing rule real.
 *
 * A document declares itself a standing rule with `alwaysApply: true`, but that
 * key is inert on its own — no tool reads it. What actually puts a rule in front
 * of Claude is an `@import` line in CLAUDE.md. So the marker and the manifest must
 * agree, in both directions:
 *
 *   alwaysApply: true   ⟺   imported by CLAUDE.md
 *
 * Enforced by scripts/quality/validate-always-apply.mjs. Without this check the
 * failure is silent and the worst kind: a rule that reads as binding, is written
 * down, is reviewed and approved — and is never loaded, so nothing obeys it.
 */
export const ALWAYS_APPLY = {
  id: "always-apply",

  /** The file whose @imports decide what is actually loaded every session. */
  manifest: "CLAUDE.md",

  /** Documents allowed to declare themselves standing rules. */
  scope: (p) => p.startsWith("docs/") && p.endsWith(".md"),

  hints: {
    notImported: (manifest) =>
      `Add "@<path>" to ${manifest}, or set alwaysApply: false. As written, this rule is never loaded.`,
    notDeclared: (manifest) =>
      `${manifest} imports this file, so it applies to every session. Set alwaysApply: true, or remove the import.`,
    missingTarget: (manifest) =>
      `${manifest} imports a file that does not exist. Fix the path or drop the line.`,
  },
};

/**
 * Flagged, not blocked, unless SETTINGS.blockTodo is true.
 *
 * Code only. A TODO in prose is a sentence, not a loose end — documentation that
 * explains this very rule would otherwise trip it.
 */
export const TODO_RULE = {
  id: "todo",
  pattern: /\b(?:TODO|FIXME)\b/,
  appliesTo: (p) => /\.(ts|mts|cts|mjs|cjs|js)$/.test(p),
  hint: "Raise a ticket and link it, or resolve it. Set SETTINGS.blockTodo to enforce.",
};
