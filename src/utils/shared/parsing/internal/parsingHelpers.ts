/**
 * Replaces non-breaking spaces with regular spaces, collapses repeated whitespace, and trims the result.
 * @param value - Raw string value.
 * @returns Normalised string.
 */
export const normaliseStringValue = (value: string): string =>
  value
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Removes commas from a string value.
 * @param value - Raw string value.
 * @returns String without commas.
 */
export const stripCommas = (value: string): string => value.replace(/,/g, "");

/**
 * Normalises a numeric string so it can be parsed consistently.
 * @param value - Raw numeric string.
 * @returns Normalised numeric string.
 */
export const baseNumericValue = (value: string): string =>
  stripCommas(normaliseStringValue(value));
