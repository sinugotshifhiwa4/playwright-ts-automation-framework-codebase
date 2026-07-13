import { ENV_KEYS } from "../keys/environment.keys.js";

/**
 * Environment Credentials.
 *
 * Each value is a getter so it is read at the moment of access rather than captured
 * when this module is first imported, which may be before the .env file has loaded.
 * A variable that is not set resolves to an empty string, which
 * VariableValidator.getEnvironmentVariable rejects by name.
 */
export const EnvironmentCredentials = {
  /**
   * Reads the portal username from the environment.
   * @returns The configured username, or an empty string when it is not set.
   */
  get PORTAL_USERNAME(): string {
    return process.env[ENV_KEYS.PORTAL.USERNAME] ?? "";
  },

  /**
   * Reads the portal password from the environment.
   * @returns The configured password, or an empty string when it is not set.
   */
  get PORTAL_PASSWORD(): string {
    return process.env[ENV_KEYS.PORTAL.PASSWORD] ?? "";
  },
} as const;
