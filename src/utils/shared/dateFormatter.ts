/**
 * Provides consistent date and identifier formatting helpers for logs and test data.
 */
export default class DateFormatter {
  /**
   * Returns the current local time as a compact, filename-safe timestamp: `yyyyMMddHHmmss`.
   *
   * The parts are joined with no separator on purpose. The value is used inside filenames —
   * a downloaded artifact, a generated id — where a colon is illegal on Windows and a space
   * is a nuisance in a shell.
   * @example
   * const currentTime = DateFormatter.formatLocalTime();
   * logger.info(currentTime); // '20220722143000'
   * @returns The current local time as an unseparated timestamp.
   */
  public static formatLocalTime(): string {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");
  }

  /**
   * Formats a given date as a compact, filename-safe timestamp: `yyyyMMddHHmmss`.
   * The same format as {@link formatLocalTime}, for a supplied date rather than now.
   * @param date - The date to be formatted.
   * @returns The date as an unseparated timestamp, e.g. `20220722143000`.
   */
  public static formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
      String(date.getSeconds()).padStart(2, "0"),
    ].join("");
  }

  /**
   * Generates a unique identifier based on the current timestamp.
   * @param prefix - Optional prefix to be appended to the generated ID.
   * @returns The generated ID in the format of `<prefix>-<timestamp>`.
   */
  public static generateId(prefix = "IT"): string {
    return `${prefix}-${this.formatLocalTime()}`;
  }

  /**
   * Returns the current month and year, e.g. 'Jun, 2026'.
   * @param date - Optional date to format; defaults to now.
   * @returns The month abbreviation and full year, comma-separated.
   */
  public static formatMonthYear(date: Date = new Date()): string {
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${month}, ${date.getFullYear()}`;
  }
}
