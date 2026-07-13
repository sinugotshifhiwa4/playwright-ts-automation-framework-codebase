/**
 * This file contains the keys for environment variables used in the application.
 * These keys are defined as constants to ensure consistency and avoid typos when accessing environment variables throughout the codebase.
 */
export const ENV_KEYS = {
  PORTAL: {
    PORTAL_BASE_URL: "PORTAL_BASE_URL",
    USERNAME: "PORTAL_USERNAME",
    PASSWORD: "PORTAL_PASSWORD", // quality:allow-secret — the variable's name, not its value.
  },
} as const;
