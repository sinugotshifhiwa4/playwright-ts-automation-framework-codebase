/**
 * The commit message contract, expressed as data.
 *
 * Policy lives here; the mechanism lives in scripts/quality/validate-commit-msg.mjs,
 * run by .husky/commit-msg.
 *
 * This gate exists because of a real escape. Every other artefact in a commit is
 * checked — filenames, staged bytes, types, the docs index — and the commit message
 * was the one thing nothing looked at. A subject line reading
 *
 *   @ feat(quality): enforce naming, JSDoc, and agent standards
 *
 * was written to history by a shell quoting mistake, passed all six pre-commit
 * checks, and was pushed. The stray character is invisible in a terminal and fatal
 * to anything that parses the type: a changelog generator or semantic-release reads
 * that subject, fails to match a Conventional Commit, and silently drops the commit
 * from the release notes. Nobody notices until the release notes are wrong.
 *
 * The format is defined in docs/01-rules/COMMIT_MESSAGES.md. This file is that
 * document made executable, and the two must say the same thing.
 *
 *   <type>(<scope>): [PRODUCT-1234] <summary>
 *
 *   - the main reason for the change
 *   - test: <spec-file> (<what it covers>)
 */

/**
 * The only types allowed. One name per concept, which is the rule that matters.
 *
 * `feat` and `feature` would both be understood by every human who read them, and
 * that is exactly the problem: history accumulates both, and anything that groups by
 * type — a changelog, release notes, `git log --grep` — produces two buckets for one
 * concept. The same goes for a type that is really a scope. `config` describes the
 * area a change touches, not the kind of change it is, and it belongs in the
 * parentheses: `refactor(config):`, not `config(eslint):`.
 *
 * A long type list is also a taxonomy nobody remembers, so people pick at random and
 * the type stops carrying information. `test` is the default for automation work.
 *
 * To extend: add a type only when it answers a question none of these already answer.
 */
export const TYPES = [
  "test", // automation coverage
  "feat", // a new capability
  "fix", // a bug
  "refactor", // no behaviour change
  "docs", // documentation
  "chore", // dependencies, tooling, housekeeping
  "ci", // the pipeline
  "perf", // performance
  "revert", // undoing a previous commit
];

/**
 * The subject line.
 *
 * Anchored at both ends, which is the entire point: `^` is what rejects the stray
 * `@ ` that got through, and `$` is what rejects a trailing full stop or a second
 * ticket tacked on the end. An unanchored match would have accepted the broken
 * subject this gate was built for.
 *
 * The ticket is optional here and validated separately, so that a missing ticket and
 * a *malformed* ticket produce different messages. "PRODUCT-1234 is not in brackets"
 * is a useful thing to be told; "does not match the subject pattern" is not.
 */
export const SUBJECT = new RegExp(
  `^(${TYPES.join("|")})\\(([a-z0-9][a-z0-9-]*)\\): (?:\\[([A-Z]+-\\d+)\\] )?(.+)$`,
);

/** A Jira ticket, wherever it appears. Used to catch one written the wrong way. */
export const TICKET_ANYWHERE = /\b([A-Z][A-Z0-9]+-\d+)\b/;

/** The shape a ticket must take in a subject line. */
export const TICKET_BRACKETED = /\[[A-Z]+-\d+\]/;

export const SETTINGS = {
  /** Subjects longer than this stop being scannable in `git log --oneline`. */
  maxSubjectLength: 72,

  /**
   * COMMIT_MESSAGES.md: "the body must be 1-3 lines maximum". Enforced, because a
   * body that lists every file touched is the diff written out badly — the diff is
   * already in the commit, and it is better at being the diff.
   */
  maxBodyLines: 3,

  /**
   * A ticket is optional. COMMIT_WORKFLOW.md step 4 says to ask for one and to
   * proceed without it if there is none, so rejecting a ticketless commit would
   * contradict the workflow. What is *not* optional is that a ticket, when present,
   * is written correctly.
   */
  requireTicket: false,
};

/**
 * Messages Git generates rather than a human writing them. Validating these would
 * reject `git merge` and `git revert` for not being Conventional Commits, which is
 * a gate failing on the one message its author never chose.
 */
export const GENERATED_PREFIXES = ["Merge ", "Revert ", "fixup!", "squash!", "Reapply "];

export const COMMIT_MSG = {
  id: "commit-msg",

  hints: {
    subject: () =>
      `Expected: <type>(<scope>): [PRODUCT-1234] <summary>\n` +
      `      Type must be one of: ${TYPES.join(", ")}. Scope is lowercase.\n` +
      `      The ticket is optional. Nothing may precede the type — not a space, not a stray character.`,

    strayPrefix: (found) =>
      `The subject starts with "${found}". A Conventional Commit parser reads the type first, finds junk, and drops the commit from every generated changelog. Remove it.`,

    unbracketedTicket: (ticket) =>
      `Write the ticket as [${ticket}], in the subject, immediately after the colon.`,

    tooLong: (max, actual) =>
      `${actual} characters. Keep the subject under ${max} so it survives git log --oneline.`,

    bodyTooLong: (max) =>
      `Keep the body to ${max} lines. Write why the change was made, not what every file does — the diff already says that.`,

    trailer: (trailer) =>
      `Remove the "${trailer}" trailer. Commits carry no agent attribution — see docs/01-rules/AGENT_RULES.md.`,

    emptySubject: () => `Write a subject line.`,
  },
};

/**
 * Attribution trailers. Banned by AGENT_RULES.md, and banned here because a rule
 * enforced only by the agent's own good behaviour is not enforced at all: the
 * setting can be toggled, a different tool can be used, and the trailer reappears.
 */
export const FORBIDDEN_TRAILERS = [
  /^\s*Co-Authored-By:/im,
  /^\s*Signed-Off-By:\s*Claude/im,
];
