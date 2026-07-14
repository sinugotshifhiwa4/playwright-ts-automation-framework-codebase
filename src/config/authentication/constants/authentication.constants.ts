/**
 * Constants used for authentication state management
 */
export const AUTH_STATE_CONFIG = {
  ROOT_DIRECTORY: ".auth",
  CI_AUTH_FILE: "ci-login.json",
  EMPTY_STATE: "{}",
  CI_SHARD_PREFIX: "ci-login-shard-",
} as const;
