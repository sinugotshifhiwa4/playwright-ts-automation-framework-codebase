#!/usr/bin/env node
/**
 * Content guards: scans the *staged bytes* of every file for things that must
 * never reach a shared branch. Policy is declared in config/quality/guards.mjs.
 *
 * This is the layer ESLint cannot be. ESLint reads TypeScript it has been
 * configured to parse; this reads every byte of every staged file, including
 * JSON fixtures, YAML pipelines and .env files — which is exactly where a leaked
 * credential actually lands.
 *
 *   node scripts/quality/guard-staged.mjs          # staged files
 *   node scripts/quality/guard-staged.mjs --all    # every tracked file
 */

import {
  fileSize,
  isBinary,
  readBuffer,
  stagedBuffer,
  stagedFiles,
  trackedFiles,
} from "./lib/git.mjs";
import { Report, dim } from "./lib/report.mjs";
import {
  FORBIDDEN_PATHS,
  FORBIDDEN_PATTERNS,
  POLICY_PATHS,
  SECRET_PATTERNS,
  SETTINGS,
  TODO_RULE,
} from "../../config/quality/guards.mjs";

const scanAll = process.argv.includes("--all");
const files = scanAll ? trackedFiles() : stagedFiles();

const report = new Report(
  `Content guards ${dim(`(${files.length} ${scanAll ? "tracked" : "staged"} file(s))`)}`,
);

/** First line index matching `pattern`, 1-based to line up with editors. */
function findLine(lines, pattern) {
  const index = lines.findIndex((line) => pattern.test(line));
  return index === -1 ? undefined : index + 1;
}

for (const file of files) {
  // ---------------------------------------------------------------------------
  // 1. Path-level rules. Cheapest check, and the contents are irrelevant: a
  //    staged .env is a leak whether or not it currently holds a real secret.
  // ---------------------------------------------------------------------------
  const badPath = FORBIDDEN_PATHS.find((rule) => rule.test(file));
  if (badPath) {
    report.error({
      file,
      rule: badPath.id,
      message: `${badPath.label} must not be committed.`,
      hint: badPath.hint,
    });
    continue;
  }

  // ---------------------------------------------------------------------------
  // 2. Size. Large binaries in Git are permanent — they stay in history even
  //    after deletion, and every future clone pays for them. Checked in both
  //    modes: pre-commit catches the file you are adding, pre-push catches the
  //    one that arrived in a merge without ever passing through your index.
  // ---------------------------------------------------------------------------
  const sizeKb = Math.round(fileSize(file, { fromDisk: scanAll }) / 1024);
  if (sizeKb > SETTINGS.maxFileSizeKb) {
    report.error({
      file,
      rule: "max-file-size",
      message: `${sizeKb} KB exceeds the ${SETTINGS.maxFileSizeKb} KB limit.`,
      hint: "Large fixtures and media belong in object storage, not in Git history.",
    });
    continue;
  }

  // ---------------------------------------------------------------------------
  // 3. Content rules. Two categories of file are skipped:
  //
  //    - Binary. Scanning a PNG for "password" yields nothing but noise.
  //    - The policy layer itself. config/quality/guards.mjs spells out every
  //      banned pattern in plain text, so scanning it against those patterns
  //      makes the framework report itself. See POLICY_PATHS.
  // ---------------------------------------------------------------------------
  if (POLICY_PATHS.some((policy) => policy.test(file))) continue;

  const buffer = scanAll ? readBuffer(file) : stagedBuffer(file);
  if (!buffer || isBinary(buffer)) continue;

  const text = buffer.toString("utf8");
  const lines = text.split(/\r?\n/);

  for (const rule of FORBIDDEN_PATTERNS) {
    if (!rule.appliesTo(file) || !rule.pattern.test(text)) continue;

    report.error({
      file,
      line: findLine(lines, rule.pattern),
      rule: rule.id,
      message: `${rule.label} detected.`,
      hint: rule.hint,
    });
  }

  for (const rule of SECRET_PATTERNS) {
    const line = lines.findIndex(
      (candidate) =>
        rule.pattern.test(candidate) && !candidate.includes(SETTINGS.allowMarker),
    );
    if (line === -1) continue;

    report.error({
      file,
      line: line + 1,
      rule: rule.id,
      message: `Possible ${rule.label} committed.`,
      hint: `Move it to .env (git-ignored). If this is a false positive, append "${SETTINGS.allowMarker}" to the line.`,
    });
  }

  const todoLine = TODO_RULE.appliesTo(file)
    ? findLine(lines, TODO_RULE.pattern)
    : undefined;
  if (todoLine !== undefined) {
    const finding = {
      file,
      line: todoLine,
      rule: TODO_RULE.id,
      message: "TODO/FIXME left in the code.",
      hint: TODO_RULE.hint,
    };
    if (SETTINGS.blockTodo) report.error(finding);
    else report.warn(finding);
  }
}

process.exit(report.flush());
