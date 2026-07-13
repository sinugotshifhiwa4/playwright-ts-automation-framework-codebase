import { ENV_KEYS } from "../keys/environment.keys.js";

/**
 * Environment URLs.
 *
 * Each value is a getter so it is read at the moment of access rather than captured
 * when this module is first imported, which may be before the .env file has loaded.
 * A variable that is not set resolves to an empty string, which
 * VariableValidator.getEnvironmentVariable rejects by name.
 */
export const EnvironmentUrls = {
  /**
   * Reads the portal base URL from the environment.
   * @returns The configured URL, or an empty string when it is not set.
   */
  get PORTAL_BASE_URL(): string {
    return process.env[ENV_KEYS.PORTAL.PORTAL_BASE_URL] ?? "";
  },
} as const;
