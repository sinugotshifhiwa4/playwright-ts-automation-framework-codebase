import ErrorHandler from "../error-handling/errorHandler.js";
import type { FieldValidationOptions } from "./types/fieldValidator.types.js";

export default class FieldValidator {
  /**
   * Validates a field value based on the provided options.
   * @param value - The value to validate.
   * @param method - The method name calling the validation.
   * @param param2 - The validation options.
   * @param param2.allowEmpty - Whether an empty or whitespace-only value is permitted.
   * @returns The validated value.
   */
  public static validate(
    value: string,
    method: string,
    { allowEmpty = false }: FieldValidationOptions = {},
  ): string {
    const trimmed = value?.trim() ?? "";

    if (!allowEmpty && !trimmed) {
      ErrorHandler.logAndThrow(method, "Input value cannot be empty");
    }

    return trimmed;
  }
}
