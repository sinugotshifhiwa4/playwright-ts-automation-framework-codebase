import CurrencyUtils from "./parsing/currencyUtils.js";
import DateParsingUtils from "./parsing/dateParsingUtils.js";
import { normaliseStringValue } from "./parsing/internal/parsingHelpers.js";
import NumberUtils from "./parsing/numberUtils.js";

export default class ParsingFacade {
  /**
   * Normalizes a string by replacing non-breaking spaces with regular spaces, collapsing multiple whitespace characters into a single space, and trimming leading and trailing whitespace.
   * @param value - The string to normalize.
   * @returns The normalized string.
   */
  public static normaliseString(this: void, value: string): string {
    return normaliseStringValue(value);
  }

  /**
   * Parses a string by normalizing it (replacing non-breaking spaces with regular spaces, collapsing multiple whitespace characters into a single space, and trimming leading and trailing whitespace).
   * @param value - The string to parse.
   * @returns The parsed string.
   */
  public static parseString(this: void, value: string): string {
    return normaliseStringValue(value);
  }

  /**
   * Parses a string to a number by removing all non-breaking spaces and commas.
   * @param value - The string to parse.
   * @returns The parsed number.
   */
  public static parseNumber(this: void, value: string): number {
    return NumberUtils.parseNumber(value);
  }

  /**
   * Parses a string to a number by extracting the leading numeric value.
   * If no match is found, returns 0.
   * @param value - The string to parse.
   * @returns The parsed number, or 0 if no match is found.
   */
  public static parseLeadingNumber(this: void, value: string): number {
    return NumberUtils.parseLeadingNumber(value);
  }

  /**
   * Parses a string percentage value to a number.
   * The function removes all commas, whitespace and the percentage sign from the given string before parsing it to a number.
   * @param value - The string percentage value to parse.
   * @returns The parsed number value.
   */
  public static parsePercentage(this: void, value: string): number {
    return NumberUtils.parsePercentage(value);
  }

  /**
   * Parses a string currency value to a number.
   * The function removes all non-numeric characters (except for decimal points and minus signs) from the given string before parsing it to a number.
   * @param value - The string currency value to parse.
   * @returns The parsed number value.
   */
  public static parseCurrency(this: void, value: string): number {
    return CurrencyUtils.parseCurrency(value);
  }

  /**
   * Parses a string CBM value to a number.
   * If the value is empty, returns 0.
   * The function removes all non-breaking spaces and commas, and matches the value against a regular expression to extract the leading numeric value.
   * If a match is found, the function returns the parsed number; otherwise, it returns 0.
   * @param value - The string CBM value to parse.
   * @returns The parsed number value.
   */
  public static parseCbm(this: void, value: string): number {
    return NumberUtils.parseCbm(value);
  }

  /**
   * Parses an array of string numbers to an array of numbers.
   * The function uses the parseNumber function to parse each string value in the array.
   * @param values - The array of string numbers to parse.
   * @returns The parsed number array.
   */
  public static parseToNumbers(this: void, values: string[]): number[] {
    return NumberUtils.parseToNumbers(values);
  }

  /**
   * Parses an array of string currency values to an array of numbers.
   * The function uses the parseCurrency function to parse each string value in the array.
   * @param values - The array of string currency values to parse.
   * @returns The parsed number array.
   */
  public static parseCurrencyArray(this: void, values: string[]): number[] {
    return CurrencyUtils.parseCurrencyArray(values);
  }

  /**
   * Sums an array of numbers.
   * @param values - The array of numbers to sum.
   * @returns The sum of the numbers in the array.
   */
  public static sumNumbers(this: void, values: number[]): number {
    return NumberUtils.sumNumbers(values);
  }

  /**
   * Calculates the sum of an array of cell values representing CBM values.
   * The cell values are first normalized by removing any whitespace and currency symbols,
   * and then parsed to a number. The resulting numbers are then summed and rounded to 3
   * decimal places.
   * @param cellValues - An array of cell values as strings.
   * @returns The sum of the cell values as a number.
   */
  public static calculateCbmSum(this: void, cellValues: string[]): number {
    return NumberUtils.calculateCbmSum(cellValues);
  }

  /**
   * Rounds a given number to two decimal places.
   * @param value - The number to round.
   * @returns The rounded number.
   */
  public static roundToTwoDecimals(this: void, value: number): number {
    return NumberUtils.roundToTwoDecimals(value);
  }

  /**
   * Asserts that the given value is a valid number.
   * Throws an error if the value is not a number or is NaN.
   * @param value - The value to check.
   * @param fieldName - The name of the field being checked.
   * @param context - The context in which the field is being checked.
   */
  public static assertValidNumber(
    this: void,
    value: unknown,
    fieldName: string,
    context: string,
  ): asserts value is number {
    NumberUtils.assertValidNumber(value, fieldName, context);
  }

  /**
   * Checks whether a string represents a valid date in format: dd MMM yyyy (e.g. 24 Feb 2026).
   * @param value - The string to validate.
   * @returns true if valid, otherwise false.
   */
  public static isValidDate(this: void, value: string): boolean {
    return DateParsingUtils.isValidDate(value);
  }
}
