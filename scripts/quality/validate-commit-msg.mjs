#!/usr/bin/env node
/**
 * The commit message gate. Policy is declared in src/config/quality/commit.mjs.
 *
 * Run by .husky/commit-msg, which Git hands the path to the file holding the
 * message the author just wrote:
 *
 *   node scripts/quality/validate-commit-msg.mjs .git/COMMIT_EDITMSG
 *
 * commit-msg rather than pre-commit, because pre-commit runs *before* the message
 * exists. That is why the malformed subject this gate was built for sailed through
 * all six pre-commit checks: none of them had anything to look at.
 *
 * A rejection here is cheap. The staged files stay staged and the message stays in
 * .git/COMMIT_EDITMSG, so fixing it is one `git commit` away — nothing is lost, and
 * nothing has entered history yet. That is the whole reason the check belongs here
 * rather than in a pre-push hook or in review, where the only remedy left is a
 * force-push that rewrites published history.
 */

import { readFileSync } from "node:fs";

import { Report } from "./lib/report.mjs";
import {
  COMMIT_MSG,
  FORBIDDEN_TRAILERS,
  GENERATED_PREFIXES,
  SETTINGS,
  SUBJECT,
  TICKET_ANYWHERE,
  TICKET_BRACKETED,
} from "../../src/config/quality/commit.mjs";

const { hints, id } = COMMIT_MSG;

const messagePath = process.argv[2];

if (!messagePath) {
  console.error("Usage: validate-commit-msg.mjs <path-to-commit-message-file>");
  process.exit(2);
}

const raw = readFileSync(messagePath, "utf8");

/** Comments are Git's own scaffolding, not the author's message. */
const lines = raw
  .split(/\r?\n/)
  .filter((line) => !line.startsWith("#"))
  .join("\n")
  .trim()
  .split("\n");

const subject = (lines[0] ?? "").trim();

// Git wrote this, not a person. Judging it would reject `git merge` for not being
// a Conventional Commit — a gate failing on the one message nobody chose.
if (GENERATED_PREFIXES.some((prefix) => subject.startsWith(prefix))) {
  process.exit(0);
}

const report = new Report("Commit message");
const file = "commit message";

if (!subject) {
  report.error({
    file,
    rule: id,
    message: "The commit message is empty.",
    hint: hints.emptySubject(),
  });
  process.exit(report.flush());
}

const match = SUBJECT.exec(subject);

if (!match) {
  report.error({
    file,
    rule: id,
    line: 1,
    message: `Subject does not match the required format:\n      ${subject}`,
    hint: hints.subject(),
  });

  // Say what is *actually* wrong when we can see it. "Does not match the pattern"
  // is true and useless; "you have a stray '@ ' in front of the type" is what the
  // author needs, and it is the exact failure that put a broken subject in history.
  const stray = /^([^a-z]+?)(?=[a-z]+\()/.exec(subject);
  if (stray) {
    report.error({
      file,
      rule: id,
      line: 1,
      message: `Stray characters before the type.`,
      hint: hints.strayPrefix(stray[1]),
    });
  }

  const loose = TICKET_ANYWHERE.exec(subject);
  if (loose && !TICKET_BRACKETED.test(subject)) {
    report.error({
      file,
      rule: id,
      line: 1,
      message: `The ticket "${loose[1]}" is not in brackets.`,
      hint: hints.unbracketedTicket(loose[1]),
    });
  }

  process.exit(report.flush());
}

if (subject.length > SETTINGS.maxSubjectLength) {
  report.error({
    file,
    rule: id,
    line: 1,
    message: `Subject is too long.`,
    hint: hints.tooLong(SETTINGS.maxSubjectLength, subject.length),
  });
}

const [, , , ticket, summary] = match;

if (SETTINGS.requireTicket && !ticket) {
  report.error({
    file,
    rule: id,
    line: 1,
    message: "No Jira ticket in the subject.",
    hint: hints.unbracketedTicket("PRODUCT-1234"),
  });
}

// A ticket left loose in the summary — `feat(ui): PRODUCT-1234 add login page`.
//
// This has to be checked here, on the *matching* path, and that is not obvious: the
// subject is a perfectly legal Conventional Commit, because "PRODUCT-1234 add login
// page" is a valid summary. The pattern cannot reject it, so the pattern is not the
// thing that should try. Left alone, every ticket-scraping tool in the chain — Jira's
// commit panel, the release notes — misses it, and the traceability the ticket exists
// to provide is silently absent.
const loose = TICKET_ANYWHERE.exec(summary);

if (loose && !ticket) {
  report.error({
    file,
    rule: id,
    line: 1,
    message: `The ticket "${loose[1]}" is in the summary, not in brackets.`,
    hint: hints.unbracketedTicket(loose[1]),
  });
}

// The body: everything after the blank line that must follow the subject.
const body = lines
  .slice(1)
  .join("\n")
  .trim()
  .split("\n")
  .filter((line) => line.trim() !== "");

if (body.length > SETTINGS.maxBodyLines) {
  report.error({
    file,
    rule: id,
    line: 3,
    message: `Body is ${body.length} lines; the limit is ${SETTINGS.maxBodyLines}.`,
    hint: hints.bodyTooLong(SETTINGS.maxBodyLines),
  });
}

for (const trailer of FORBIDDEN_TRAILERS) {
  const found = trailer.exec(raw);
  if (!found) continue;

  report.error({
    file,
    rule: id,
    message: "Attribution trailer in the commit message.",
    hint: hints.trailer(found[0].trim()),
  });
}

process.exit(report.flush());
