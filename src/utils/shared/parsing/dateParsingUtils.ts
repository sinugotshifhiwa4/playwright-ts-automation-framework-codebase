import { normaliseStringValue } from "./internal/parsingHelpers.js";

export default class DateParsingUtils {
  /**
   * Checks whether a string represents a valid date in format: dd MMM yyyy (e.g. 24 Feb 2026).
   * @param value - The string to validate.
   * @returns True if the value is a valid date, otherwise false.
   */
  public static isValidDate(this: void, value: string): boolean {
    return DateParsingUtils.parseDate(value) !== null;
  }

  /**
   * Parses a string to a Date object in the format "dd MMM yyyy".
   * If the string is not in the correct format, or if the date is invalid, returns null.
   * @param value - The string to parse.
   * @returns The parsed date, or null if the string is invalid.
   */
  private static parseDate(this: void, value: string): Date | null {
    const normalised = normaliseStringValue(value);
    if (!normalised) return null;

    const match = /^((?:\d{1,2}))\s([A-Za-z]{3})\s(\d{4})$/.exec(normalised);
    if (!match) return null;

    const [, dayStr, monthStr, yearStr] = match;

    const months: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const monthIndex = months[monthStr];
    if (monthIndex === undefined) return null;

    const day = Number(dayStr);
    const year = Number(yearStr);
    const date = new Date(year, monthIndex, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== monthIndex ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }
}
