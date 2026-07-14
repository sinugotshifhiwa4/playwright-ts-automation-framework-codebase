#!/usr/bin/env node
/**
 * Enforces the one invariant that keeps a documentation index honest. Policy is
 * declared in src/config/quality/docs.mjs.
 *
 *   every page under docs/   ⟺   linked from its folder's README.md
 *
 * An index is the only part of a documentation tree that cannot be checked by
 * reading it. Read a stale index and it does not look stale — it looks like a
 * complete list. That is exactly what makes it worse than no index at all: a page
 * missing from the list reads as a page that does not exist, so the reader never
 * goes looking for it. The page is written, reviewed, merged, and invisible.
 *
 * Four things are wrong, and all four are silent:
 *
 *   page not indexed        a page nobody can find
 *   folder with no index    a section nobody can enter
 *   dead link in an index   a promise the tree does not keep
 *   root README detached    every page back-links to it; it must lead somewhere
 *
 *   node scripts/quality/validate-doc-index.mjs         # the whole tree
 *   node scripts/quality/validate-doc-index.mjs --all   # accepted, for symmetry
 *
 * Like validate-always-apply.mjs and unlike its other siblings, this reads the
 * working tree rather than the Git index. The reason is the same: it judges a
 * *relationship between two files*, and the edit most likely to break it — adding
 * a page and forgetting the index — leaves the index file untouched, so a
 * staged-scope check would miss the single case it exists to catch.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Report, dim } from "./lib/report.mjs";
import {
  DOCS_INDEX,
  DOCS_ROOT,
  DOC_INDEX,
  INDEX_FILE,
  ROOT_README,
  SKIP_DIRS,
} from "../../src/config/quality/docs.mjs";

const { hints, id } = DOC_INDEX;

/**
 * A Markdown link's target: the `(...)` half of `[text](target)`.
 *
 * Reference-style links and bare URLs are deliberately not matched. An index is a
 * hand-written list of local pages; anything clever in it is a smell, and pretending
 * to parse the whole of Markdown with a regex would trade a real check for a
 * plausible one.
 */
const LINK = /\[[^\]]*\]\(([^)]+)\)/g;

const read = (filePath) => {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
};

/** Local Markdown targets linked from `filePath`, resolved to repo-relative paths. */
function linksFrom(filePath) {
  const dir = path.posix.dirname(filePath);
  const targets = new Set();

  for (const [, raw] of read(filePath).matchAll(LINK)) {
    // Strip a title ("path 'Title'") and any #anchor, then skip anything remote.
    const target = raw.trim().split(/\s+/)[0].split("#")[0];
    if (!target || /^(?:https?:|mailto:)/.test(target)) continue;

    targets.add(path.posix.normalize(path.posix.join(dir, target)));
  }

  return targets;
}

/**
 * Does this subtree hold any page at all?
 *
 * An empty folder is skipped entirely — no index demanded, no link required. That
 * is not leniency, it is the only correct answer: Git does not track empty
 * directories, so `docs/07-tests/` with nothing in it cannot be committed and does
 * not exist for anyone who clones the repository. Demanding an index for it would
 * reject a commit over a folder the commit does not contain.
 *
 * The moment a page lands in it, every rule below applies.
 */
function hasPages(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;

    if (entry.isDirectory()) {
      if (hasPages(path.posix.join(dir, entry.name))) return true;
    } else if (entry.name.endsWith(".md") && entry.name !== INDEX_FILE) {
      return true;
    }
  }

  return false;
}

/** Immediate children of `dir`: subdirectories that hold pages, and pages. */
function scan(dir) {
  const dirs = [];
  const pages = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const full = path.posix.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (hasPages(full)) dirs.push(full);
    } else if (entry.name.endsWith(".md") && entry.name !== INDEX_FILE) {
      pages.push(full);
    }
  }

  return { dirs, pages };
}

const report = new Report(`Documentation index ${dim(`(${DOCS_ROOT}/)`)}`);

/** Every folder that holds pages must have an index that lists all of them. */
function checkFolder(dir) {
  const { dirs, pages } = scan(dir);
  const index = path.posix.join(dir, INDEX_FILE);
  const hasContent = pages.length > 0 || dirs.length > 0;

  if (!hasContent) return;

  if (!existsSync(index)) {
    report.error({
      file: index,
      rule: id,
      message: `${dir}/ holds documentation but has no ${INDEX_FILE}.`,
      hint: hints.missingIndex(dir),
    });

    for (const child of dirs) checkFolder(child);
    return;
  }

  const linked = linksFrom(index);

  // A page nobody can find.
  for (const page of pages) {
    if (linked.has(page)) continue;

    report.error({
      file: page,
      rule: id,
      message: `Not linked from ${index}.`,
      hint: hints.notIndexed(index),
    });
  }

  // A section nobody can enter.
  for (const child of dirs) {
    if (!linked.has(path.posix.join(child, INDEX_FILE))) {
      report.error({
        file: child,
        rule: id,
        message: `${index} does not link to this section's ${INDEX_FILE}.`,
        hint: hints.orphanSection(index),
      });
    }

    checkFolder(child);
  }

  // A promise the tree does not keep.
  for (const target of linked) {
    if (existsSync(target)) continue;

    report.error({
      file: index,
      rule: id,
      message: `Links to "${target}", which does not exist.`,
      hint: hints.deadLink(index),
    });
  }
}

if (!existsSync(DOCS_ROOT)) {
  console.log(`  ✔ Documentation index ${dim("(no docs/ directory)")}`);
  process.exit(0);
}

checkFolder(DOCS_ROOT);

// Every page carries a "← Back to Main Documentation" link. The root README is
// where they all land, so it is the one file that must point forward.
if (!linksFrom(ROOT_README).has(DOCS_INDEX)) {
  report.error({
    file: ROOT_README,
    rule: id,
    message: `Does not link to ${DOCS_INDEX}.`,
    hint: hints.rootDetached(DOCS_INDEX),
  });
}

process.exit(report.flush());
