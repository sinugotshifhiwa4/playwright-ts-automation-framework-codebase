import {
  baseNumericValue,
  normaliseStringValue,
  stripCommas,
} from "./internal/parsingHelpers.js";
import ErrorHandler from "../../error-handling/errorHandler.js";

export default class NumberUtils {
  /**
   * Parses a string to a number by removing non-breaking spaces and commas.
   * @param value - The string to parse.
   * @returns Parsed numeric value.
   */
  public static parseNumber(this: void, value: string): number {
    return Number(baseNumericValue(value));
  }

  /**
   * Parses a string to a number by extracting the leading numeric value.
   * If no match is found, returns 0.
   * @param value - The string to parse.
   * @returns Parsed number, or 0 if no match is found.
   */
  public static parseLeadingNumber(this: void, value: string): number {
    const match = /[\d,]+/.exec(normaliseStringValue(value));
    return match ? Number(stripCommas(match[0])) : 0;
  }

  /**
   * Parses a string percentage value to a number.
   * @param value - The string percentage value to parse.
   * @returns Parsed numeric value.
   */
  public static parsePercentage(this: void, value: string): number {
    return Number(baseNumericValue(value).replace("%", "").trim());
  }

  /**
   * Parses a string CBM value to a number.
   * If the value is empty, returns 0.
   * @param value - The string CBM value to parse.
   * @returns Parsed CBM value.
   */
  public static parseCbm(this: void, value: string): number {
    if (!value) return 0;
    const match = /^(\d+(?:\.\d+)?)/.exec(baseNumericValue(value));
    return match ? Number(match[1]) : 0;
  }

  /**
   * Parses an array of string numbers to an array of numbers.
   * @param values - The array of string numbers to parse.
   * @returns Parsed numeric values.
   */
  public static parseToNumbers(this: void, values: string[]): number[] {
    return values.map(NumberUtils.parseNumber);
  }

  /**
   * Sums an array of numbers.
   * @param values - The array of numbers to sum.
   * @returns The sum of the numbers.
   */
  public static sumNumbers(this: void, values: number[]): number {
    return values.reduce((sum, n) => sum + n, 0);
  }

  /**
   * Calculates the sum of an array of cell values representing CBM values.
   * @param cellValues - The cell values as strings.
   * @returns Rounded CBM total.
   */
  public static calculateCbmSum(this: void, cellValues: string[]): number {
    return Number(
      NumberUtils.sumNumbers(cellValues.map(NumberUtils.parseCbm)).toFixed(3),
    );
  }

  /**
   * Rounds a given number to two decimal places.
   * @param value - The number to round.
   * @returns Rounded number.
   */
  public static roundToTwoDecimals(this: void, value: number): number {
    return Number(value.toFixed(2));
  }

  /**
   * Asserts that the given value is a valid number.
   * @param value - The value to validate.
   * @param fieldName - The field being validated.
   * @param context - The validation context.
   */
  public static assertValidNumber(
    this: void,
    value: unknown,
    fieldName: string,
    context: string,
  ): asserts value is number {
    if (typeof value !== "number" || Number.isNaN(value)) {
      ErrorHandler.logAndThrow(
        "assertValidNumber",
        `${fieldName} must be a valid number for "${context}".`,
      );
    }
  }
}
