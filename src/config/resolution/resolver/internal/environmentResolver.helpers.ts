import VariableValidator from "../../../environment/variables/variableValidator.js";
import EnvironmentDetector from "../../detector/environmentDetector.js";
import type { Credentials } from "../../../authentication/types/credentials.types.js";

export class EnvironmentResolverHelpers {
  /**
   * Returns true if the current process is running in a CI environment.
   * @returns True when the process is running in a CI environment.
   */
  public static isCI(): boolean {
    return EnvironmentDetector.isCI();
  }

  /**
   * Reads a required environment variable and throws if it is missing or empty.
   * @param key - The environment variable name.
   * @returns The variable value.
   * @throws Error if the variable is not set.
   */
  public static getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  /**
   * Resolves a local environment-backed value through the validator with consistent error handling.
   * @param getValue - Lazy accessor for the target value.
   * @param description - Human-readable label used in error metadata and key derivation.
   * @returns The resolved value.
   */
  public static resolveLocalVariable<T>(getValue: () => T, description: string): T {
    return VariableValidator.getEnvironmentVariable(
      getValue,
      EnvironmentResolverHelpers.toKey(description),
      EnvironmentResolverHelpers.toMethod(description),
      `Failed to get ${description.toLowerCase()}`,
    );
  }

  /**
   * Reads raw credential strings from CI-injected environment variables by key, then
   * validates them so a misconfigured pipeline fails fast with a clear error.
   * @param usernameKey - The CI environment variable key for the username.
   * @param passwordKey - The CI environment variable key for the password.
   * @returns Verified CI credentials.
   */
  public static resolveCICredentials(
    usernameKey: string,
    passwordKey: string,
  ): Credentials {
    const username = EnvironmentResolverHelpers.getCIEnv(usernameKey);
    const password = EnvironmentResolverHelpers.getCIEnv(passwordKey);

    return VariableValidator.verifyCredentials({ username, password });
  }

  /**
   * Reads raw credential strings from the local .env file via supplied getters, then
   * validates them so a missing or incomplete .env entry fails fast with a clear error.
   * @param usernameGetter - Lazy accessor for the username value.
   * @param usernameName - Human-readable label for the username (used in error messages).
   * @param passwordGetter - Lazy accessor for the password value.
   * @param passwordName - Human-readable label for the password (used in error messages).
   * @returns Verified local credentials.
   */
  public static resolveLocalCredentials(
    usernameGetter: () => string,
    usernameName: string,
    passwordGetter: () => string,
    passwordName: string,
  ): Credentials {
    const username = EnvironmentResolverHelpers.resolveLocalVariable(
      usernameGetter,
      usernameName,
    );
    const password = EnvironmentResolverHelpers.resolveLocalVariable(
      passwordGetter,
      passwordName,
    );

    return VariableValidator.verifyCredentials({ username, password });
  }

  /**
   * Converts a human-readable description into the compact key format expected by the validator.
   * @param description - Human-readable configuration label (e.g. "Portal Base URL").
   * @returns Lowercase, whitespace-stripped key (e.g. "portalbaseurl").
   */
  public static toKey(description: string): string {
    return description.toLowerCase().replace(/\s+/g, "");
  }

  /**
   * Converts a human-readable description into an accessor-style method name.
   * @param description - Human-readable configuration label (e.g. "Portal Base URL").
   * @returns PascalCase getter name prefixed with "get" (e.g. "getPortalBaseURL").
   */
  public static toMethod(description: string): string {
    return `get${description.replace(/\s+/g, "")}`;
  }

  /**
   * Prefixes a local environment key with `CI_` to produce its CI counterpart.
   * @param key - A local env key (e.g. `"PORTAL_BASE_URL"`).
   * @returns The CI-scoped key (e.g. `"CI_PORTAL_BASE_URL"`).
   */
  public static toCIKey(key: string): string {
    return `CI_${key}`;
  }

  /**
   * Reads a CI environment variable by prefixing the given local key with `CI_`.
   * Combines {@link toCIKey} and {@link getRequiredEnv} into a single call.
   * @param key - A local env key (e.g. `"PORTAL_BASE_URL"`).
   * @returns The CI variable value.
   * @throws Error if the variable is not set.
   */
  public static getCIEnv(key: string): string {
    return EnvironmentResolverHelpers.getRequiredEnv(
      EnvironmentResolverHelpers.toCIKey(key),
    );
  }
}
