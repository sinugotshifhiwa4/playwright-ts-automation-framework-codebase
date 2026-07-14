#!/usr/bin/env node
/**
 * Enforces the one invariant that makes a standing rule real. Policy is declared
 * in src/config/quality/guards.mjs.
 *
 *   alwaysApply: true   ⟺   imported by CLAUDE.md
 *
 * `alwaysApply: true` is a statement of intent that no tool reads. CLAUDE.md is
 * the only thing Claude Code loads automatically, so a rule is in force when it is
 * imported there and nowhere else. When the two disagree the failure is silent,
 * and silent is the worst kind here: the rule is written, reviewed, approved and
 * merged, reads as binding to every human who opens it — and is never loaded.
 *
 * Both directions are errors, because both are lies:
 *
 *   declared, not imported  a rule nothing obeys
 *   imported, not declared  a document silently governing every session
 *
 *   node scripts/quality/validate-always-apply.mjs         # staged or not, same check
 *   node scripts/quality/validate-always-apply.mjs --all   # accepted, for symmetry
 *
 * This script reads the working tree, where its siblings read the Git index — a
 * deliberate difference, and the reason is the shape of the invariant rather than
 * laziness. The other guards judge *a change*: is this staged file too big, does
 * it hold a secret. This one judges *a relationship between two files*, and the
 * edit most likely to break it (deleting an @import line) leaves the rule's own
 * file untouched. A staged-scope check would therefore miss exactly the case it
 * exists to catch, and a Git-scoped file list would miss a brand-new rule document
 * that has not been added yet. So it looks at what is actually on disk.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Report, dim } from "./lib/report.mjs";
import { ALWAYS_APPLY } from "../../src/config/quality/guards.mjs";

const { manifest, scope, hints, id } = ALWAYS_APPLY;

/** Directories that never hold policy, and are expensive or pointless to walk. */
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "playwright-report",
  "test-results",
]);

/**
 * The leading `---` block, and only that.
 *
 * Scoping to the frontmatter is the whole correctness of this script. A plain text
 * search for "alwaysApply: true" also matches the documentation *about* this rule
 * — DOCUMENTATION_PROMPT_GUIDE.md explains when to set it, in a worked example —
 * and would report the guide as an unwired rule forever.
 */
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

const DECLARES_TRUE = /^alwaysApply:\s*true\s*$/m;

/** An `@path` import line in CLAUDE.md. Anything indented or inline is prose. */
const IMPORT_LINE = /^@(\S+\.md)\s*$/gm;

/** Every file under `dir`, as POSIX-style paths relative to the repo root. */
function walk(dir) {
  const found = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else found.push(full);
  }

  return found;
}

const read = (filePath) => {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
};

function declaresAlwaysApply(text) {
  const block = FRONTMATTER.exec(text);
  return block ? DECLARES_TRUE.test(block[1]) : false;
}

const report = new Report(`Always-apply rules ${dim(`(manifest: ${manifest})`)}`);
const manifestText = read(manifest);

if (!manifestText) {
  report.error({
    file: manifest,
    rule: id,
    message: `${manifest} is missing, so no standing rule is loaded.`,
    hint: "Create it and @import every alwaysApply: true document.",
  });
  process.exit(report.flush());
}

const imported = new Set(
  [...manifestText.matchAll(IMPORT_LINE)].map((match) => match[1]),
);

const declared = new Set(
  walk("docs")
    .filter(scope)
    .filter((filePath) => declaresAlwaysApply(read(filePath))),
);

// A rule nobody loads.
for (const filePath of declared) {
  if (imported.has(filePath)) continue;

  report.error({
    file: filePath,
    rule: id,
    message: `Declares alwaysApply: true but ${manifest} does not import it.`,
    hint: hints.notImported(manifest),
  });
}

// A document governing every session without saying so.
for (const filePath of imported) {
  if (!existsSync(filePath)) {
    report.error({
      file: manifest,
      rule: id,
      message: `Imports "${filePath}", which does not exist.`,
      hint: hints.missingTarget(manifest),
    });
    continue;
  }

  if (declared.has(filePath)) continue;

  report.error({
    file: filePath,
    rule: id,
    message: `${manifest} imports this file, but it does not declare alwaysApply: true.`,
    hint: hints.notDeclared(manifest),
  });
}

process.exit(report.flush());
