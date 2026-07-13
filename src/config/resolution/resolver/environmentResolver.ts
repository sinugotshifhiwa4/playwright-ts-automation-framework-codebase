import { EnvironmentResolverHelpers } from "./internal/environmentResolver.helpers.js";
import ErrorHandler from "../../../utils/error-handling/errorHandler.js";
import EnvironmentVariables from "../../environment/variables/environmentVariables.js";
import { ENV_KEYS } from "../../environment/variables/keys/environment.keys.js";
import type { Credentials } from "../../authentication/types/credentials.types.js";

export class EnvironmentResolver {
  /**
   * Resolves the portal base URL from the correct source for the current environment.
   * CI pipelines inject config as process environment variables; local runs load them
   * from .env files, so the source must be selected at runtime to avoid missing values.
   * @returns The portal base URL.
   */
  public getPortalBaseUrl(): string {
    try {
      return EnvironmentResolverHelpers.isCI()
        ? EnvironmentResolverHelpers.getCIEnv(ENV_KEYS.PORTAL.PORTAL_BASE_URL)
        : EnvironmentResolverHelpers.resolveLocalVariable(
            () => EnvironmentVariables.urls.PORTAL_BASE_URL,
            "Portal Base URL",
          );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getPortalBaseUrl",
        "Failed to get portal base URL",
      );
      throw error;
    }
  }

  /**
   * Resolves and validates portal credentials from the correct source for the current
   * environment. Validation happens in both CI and local paths to surface misconfigured
   * pipelines and missing .env entries at resolution time rather than mid-test.
   * @returns The validated portal credentials.
   */
  public getPortalCredentials(): Credentials {
    try {
      return EnvironmentResolverHelpers.isCI()
        ? EnvironmentResolverHelpers.resolveCICredentials(
            ENV_KEYS.PORTAL.USERNAME,
            ENV_KEYS.PORTAL.PASSWORD,
          )
        : EnvironmentResolverHelpers.resolveLocalCredentials(
            () => EnvironmentVariables.credentials.PORTAL_USERNAME,
            "Portal Username",
            () => EnvironmentVariables.credentials.PORTAL_PASSWORD,
            "Portal Password",
          );
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getPortalCredentials",
        "Failed to get portal credentials",
      );
      throw error;
    }
  }
}
