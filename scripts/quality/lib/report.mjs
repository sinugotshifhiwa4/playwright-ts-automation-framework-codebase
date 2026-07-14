/**
 * Shared reporting for the quality scripts.
 *
 * A rejected commit is a teaching moment with a hostile audience: the engineer
 * wanted to be done, and instead they are reading your output. So every finding
 * carries a file, a line, what was wrong, and what to do about it — and the exit
 * code, not the text, is what actually stops the commit.
 *
 * Findings are grouped by file rather than streamed, so fixing ten violations is
 * one pass through one file instead of ten passes through the terminal.
 */

const useColour = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColour ? `[${code}m${text}[0m` : text);

export const red = (text) => paint("31", text);
export const yellow = (text) => paint("33", text);
export const green = (text) => paint("32", text);
export const dim = (text) => paint("2", text);
export const bold = (text) => paint("1", text);

export class Report {
  #title;
  #errors = [];
  #warnings = [];

  constructor(title) {
    this.#title = title;
  }

  /** @param {{file: string, line?: number, rule: string, message: string, hint?: string}} finding */
  error(finding) {
    this.#errors.push(finding);
  }

  warn(finding) {
    this.#warnings.push(finding);
  }

  get failed() {
    return this.#errors.length > 0;
  }

  #group(findings) {
    const byFile = new Map();
    for (const finding of findings) {
      const bucket = byFile.get(finding.file) ?? [];
      bucket.push(finding);
      byFile.set(finding.file, bucket);
    }
    return byFile;
  }

  #print(findings, colour, label) {
    for (const [file, items] of this.#group(findings)) {
      console.log(`\n  ${bold(file)}`);
      for (const item of items) {
        const where = item.line ? dim(`:${item.line}`) : "";
        console.log(
          `    ${colour(label)} ${item.message} ${dim(`(${item.rule})`)}${where}`,
        );
        if (item.hint) console.log(`      ${dim(`→ ${item.hint}`)}`);
      }
    }
  }

  /** Print everything and return the process exit code. */
  flush() {
    if (this.#warnings.length > 0) {
      console.log(yellow(`\n${this.#title}: ${this.#warnings.length} warning(s)`));
      this.#print(this.#warnings, yellow, "warn");
    }

    if (this.#errors.length === 0) {
      console.log(green(`  ✔ ${this.#title}`));
      return 0;
    }

    console.log(red(`\n${this.#title}: ${this.#errors.length} error(s)`));
    this.#print(this.#errors, red, "error");
    console.log(
      red(
        `\n  ✖ Commit rejected. Fix the above, or run ${bold("npm run quality:fix")}.\n`,
      ),
    );
    return 1;
  }
}
