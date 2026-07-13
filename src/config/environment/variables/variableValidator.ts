import ErrorHandler from "../../../utils/error-handling/errorHandler.js";
import DataSanitizer from "../../../utils/sanitization/dataSanitizer.js";
import EnvironmentDetector from "../../resolution/detector/environmentDetector.js";
import type { Credentials } from "../../authentication/types/credentials.types.js";

export default class VariableValidator {
  /**
   * Retrieves an environment variable based on the provided getter function and variable name.
   * Optionally sanitizes the retrieved value if the current environment is a CI/CD pipeline.
   * If the environment variable does not exist, logs an error with the provided error message.
   * @template T - The type of the environment variable being retrieved.
   * @param getValue - A function that returns the environment variable value.
   * @param variableName - The name of the environment variable being retrieved.
   * @param methodName - The name of the method where the environment variable is being retrieved.
   * @param errorMessage - The error message to log if the environment variable does not exist.
   * @returns The environment variable value of type T.
   * @throws An error if the environment variable does not exist.
   */
  public static getEnvironmentVariable<T>(
    getValue: () => T,
    variableName: string,
    methodName: string,
    errorMessage: string,
  ): T {
    try {
      const value = getValue();
      this.validateEnvironmentVariable(String(value), variableName);

      const shouldSanitize = EnvironmentDetector.isCI();

      if (typeof value === "string") {
        return shouldSanitize ? (DataSanitizer.sanitizeString(value) as T) : value;
      }

      return value;
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }

  /**
   * Verifies if the given credentials are valid.
   * Checks if the given credentials contain both a username and a password.
   * If either the username or password is missing, throws an error.
   * @param credentials - The credentials to verify
   * @returns The verified credentials
   * @throws An error if the credentials are invalid
   */
  public static verifyCredentials(credentials: Credentials): Credentials {
    if (!credentials.username || !credentials.password) {
      ErrorHandler.logAndThrow(
        "FetchLocalEnvironmentVariables",
        "Invalid credentials: Missing username or password.",
      );
    }

    return credentials;
  }

  /**
   * Validates an environment variable by checking if it has a valid value.
   * If the value is invalid (i.e. empty or whitespace), throws an error with the provided error message.
   * @param value - The value of the environment variable to validate
   * @param variableName - The name of the environment variable to validate
   */
  private static validateEnvironmentVariable(value: string, variableName: string): void {
    if (!value || value.trim() === "") {
      ErrorHandler.logAndThrow(
        "FetchLocalEnvironmentVariables",
        `Environment variable ${variableName} is not set or is empty`,
      );
    }
  }
}
