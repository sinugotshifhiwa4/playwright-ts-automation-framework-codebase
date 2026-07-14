import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

/**
 * The Git surface the quality scripts need, and nothing more.
 *
 * Everything reads the *staged* content (`git show :path`) rather than the file
 * on disk. That distinction is the whole reason this file exists: if you stage a
 * clean file and then paste a secret into your editor without staging it, the
 * working tree is dirty but the commit is fine — and the hook must judge the
 * commit, not the editor. Reading from the index also makes the guards correct
 * during `git commit --amend` and partial (`git add -p`) staging.
 */

const MAX_BUFFER = 32 * 1024 * 1024;

function git(args, { encoding = "utf8" } = {}) {
  return execFileSync("git", args, { encoding, maxBuffer: MAX_BUFFER });
}

/**
 * Split NUL-delimited Git output into paths.
 *
 * Paths are taken verbatim — no trimming — because a filename may legitimately
 * begin or end with a space, and trimming it would produce a path that no
 * subsequent `git show` could resolve.
 */
const toPaths = (output) => output.split("\0").filter(Boolean);

/**
 * Paths added, copied, modified or renamed in the index.
 *
 * The `R` in the filter is not optional, and leaving it out is a silent hole:
 * modern Git turns on rename detection by default, so `git mv Login.spec.ts
 * broken.spec.ts` is reported as a single `R` entry rather than a delete plus an
 * add. A filter of ACM therefore sees *nothing at all* — a file renamed into
 * violation would pass the naming check, and because Git also reports a
 * rename-with-edits as `R`, its new content would never be scanned for secrets.
 *
 * `-z` + NUL splitting is equally load-bearing: without it Git quotes any path
 * containing a space, a quote or a non-ASCII character ("src/\303\251.ts"), and
 * every downstream `git show :path` would fail on the quoted name.
 *
 * Deletions (D) stay excluded — there is no content left to judge.
 */
export function stagedFiles() {
  return toPaths(git(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"]));
}

/** Every file Git tracks — the `--all` mode used by pre-push and CI. */
export function trackedFiles() {
  return toPaths(git(["ls-files", "-z"]));
}

/**
 * Staged bytes for a path, or null if unreadable.
 * Returns a Buffer so the caller can decide whether the file is binary before
 * trying to treat it as text.
 */
export function stagedBuffer(filePath) {
  try {
    return git(["show", `:${filePath}`], { encoding: "buffer" });
  } catch {
    return null;
  }
}

/** Working-tree bytes, for `--all` mode where there is no index to read. */
export function readBuffer(filePath) {
  try {
    return readFileSync(filePath);
  } catch {
    return null;
  }
}

/**
 * Size in bytes, without materialising the contents.
 *
 * Reads the staged blob by default and the working-tree file in `--all` mode,
 * mirroring stagedBuffer/readBuffer. Both modes must be able to answer this:
 * pre-commit catches the big file you are adding, and pre-push catches the big
 * file that arrived in a merge without ever passing through your index.
 */
export function fileSize(filePath, { fromDisk = false } = {}) {
  try {
    return fromDisk
      ? statSync(filePath).size
      : Number.parseInt(git(["cat-file", "-s", `:${filePath}`]).trim(), 10);
  } catch {
    return 0;
  }
}

/**
 * A NUL byte in the first 8 KB is Git's own heuristic for "binary". Scanning a
 * PNG for the string "password" produces nothing but false positives.
 */
export function isBinary(buffer) {
  return buffer.subarray(0, 8192).includes(0);
}
