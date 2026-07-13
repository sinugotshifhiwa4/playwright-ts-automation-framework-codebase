#!/usr/bin/env node
/**
 * Enforces the naming conventions declared in config/quality/naming.mjs.
 *
 * Runs on staged files in pre-commit, and across the whole tree with `--all` in
 * pre-push and CI — the `--all` pass exists because a file can be renamed into
 * violation by a merge, which no staged-only check would ever see.
 *
 *   node scripts/quality/validate-filenames.mjs         # staged files
 *   node scripts/quality/validate-filenames.mjs --all   # every tracked file
 */

import { stagedFiles, trackedFiles } from "./lib/git.mjs";
import { Report, dim } from "./lib/report.mjs";
import { FILE_RULES, FOLDER_RULE, MANAGED_ROOTS } from "../../config/quality/naming.mjs";

const scanAll = process.argv.includes("--all");
const files = scanAll ? trackedFiles() : stagedFiles();

const report = new Report(
  `Filename conventions ${dim(`(${files.length} ${scanAll ? "tracked" : "staged"} file(s))`)}`,
);

/** Report each offending folder once, not once per file inside it. */
const reportedFolders = new Set();

for (const file of files) {
  const segments = file.split("/");
  const directories = segments.slice(0, -1);

  if (MANAGED_ROOTS.includes(directories[0])) {
    // Skip the root itself — "src" is a given, its children are the policy.
    for (const [index, segment] of directories.slice(1).entries()) {
      const folderPath = directories.slice(0, index + 2).join("/");
      if (FOLDER_RULE.isValid(segment) || reportedFolders.has(folderPath)) continue;

      reportedFolders.add(folderPath);
      report.error({
        file: `${folderPath}/`,
        rule: FOLDER_RULE.id,
        message: `Folder "${segment}" must be ${FOLDER_RULE.convention}.`,
        hint: `Good: ${FOLDER_RULE.good}`,
      });
    }
  }

  for (const rule of FILE_RULES) {
    if (!rule.appliesTo(file) || rule.isValid(file)) continue;

    report.error({
      file,
      rule: rule.id,
      message: `Must be ${rule.convention}.`,
      hint: `Good: ${rule.good}  ${dim(`| Bad: ${rule.bad}`)}`,
    });
  }
}

process.exit(report.flush());
