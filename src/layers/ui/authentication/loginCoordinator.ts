import ErrorHandler from "../../../utils/error-handling/errorHandler.js";
import { resolveCurrentMethod } from "../base/internal/callerSource.js";
import type { AuthenticationStateManager } from "./authenticationStateManager.js";
import type { LoginExecutor, LoginOutcome } from "./types/loginExecutor.types.js";
import type { Credentials } from "../../../config/authentication/types/credentials.types.js";
import type { EnvironmentResolver } from "../../../config/resolution/resolver/environmentResolver.js";
import type { NavigationActions } from "../base/internal/actions/navigationActions.js";
import type { Page } from "@playwright/test";

/**
 * Sequences the login flow: navigate, log in, validate, and persist the auth state.
 *
 * It coordinates; it does not interact. The element work belongs to the LoginExecutor —
 * the page object that actually drives the form — which is why this class holds no
 * locators and takes only the helpers it uses. It deliberately does not extend BasePage:
 * inheriting the full action toolkit would put `elementActions` on a coordinator's
 * public surface, and the next "just one quick field fill" would land here instead of in
 * the page object.
 */
export class LoginCoordinator {
  /**
   * Creates a login orchestrator for navigation, login execution, and auth-state persistence.
   * @param page - Active Playwright page instance.
   * @param navigation - Navigation helper used to reach the portal.
   * @param environmentResolver - Resolver used to fetch environment-specific portal settings.
   * @param authenticationStateManager - Manager used to save authenticated browser state.
   */
  constructor(
    private readonly page: Page,
    private readonly navigation: NavigationActions,
    private readonly environmentResolver: EnvironmentResolver,
    private readonly authenticationStateManager: AuthenticationStateManager,
  ) {}

  /**
   * Navigates to the portal base URL.
   * @returns A promise that resolves when navigation is complete.
   */
  public async navigateToPortal(): Promise<void> {
    const portalUrl = this.environmentResolver.getPortalBaseUrl();
    await this.navigation.navigateToUrl(portalUrl);
  }

  /**
   * Navigates to the portal, logs in, validates success, and saves the authentication state.
   *
   * Credentials default to the environment's portal credentials, which is what a valid
   * login means in practice. They remain overridable so a test can log in as a different
   * valid user without a second orchestrator.
   * @param executor - The page object that drives the login form.
   * @param credentials - Optional: credentials to submit. Defaults to the environment's portal credentials.
   * @returns A promise that resolves when the login has been validated and the state saved.
   * @throws Error if the login attempt fails.
   */
  public async loginWithValidCredentials(
    executor: LoginExecutor,
    credentials?: Credentials,
  ): Promise<void> {
    await this.executeLoginFlow(
      executor,
      credentials ?? this.environmentResolver.getPortalCredentials(),
      "success",
      true,
      resolveCurrentMethod(),
      "Failed to log into portal",
    );
  }

  /**
   * Navigates to the portal, submits the given credentials, and validates the rejection.
   *
   * Credentials are required here: the credentials under test *are* the test.
   * @param executor - The page object that drives the login form.
   * @param credentials - The invalid credentials to submit.
   * @returns A promise that resolves when the rejection has been validated.
   * @throws Error if the validation fails.
   */
  public async loginWithInvalidCredentials(
    executor: LoginExecutor,
    credentials: Credentials,
  ): Promise<void> {
    await this.executeLoginFlow(
      executor,
      credentials,
      "failure",
      false,
      resolveCurrentMethod(),
      "Failed to verify invalid login",
    );
  }

  /**
   * Navigates to the portal, performs the login, validates the expected outcome, and
   * optionally persists the authentication state.
   *
   * `source` is passed in by the public method rather than resolved here: this is a
   * private helper, so resolving from inside it would yield `executeLoginFlow` — the one
   * name a reader of the error log does not need. Each public method calls
   * `resolveCurrentMethod()` to name itself, so the value cannot drift on a rename.
   * @param executor - The page object that drives the login form.
   * @param credentials - The credentials to submit.
   * @param outcome - The outcome to validate: a successful or a rejected login.
   * @param persistAuthState - Whether to save the authenticated browser state afterwards.
   * @param source - The calling method name, used for error context.
   * @param context - A high-level description of the failure, used for error context.
   * @returns A promise that resolves when the full login flow has completed.
   */
  private async executeLoginFlow(
    executor: LoginExecutor,
    credentials: Credentials,
    outcome: LoginOutcome,
    persistAuthState: boolean,
    source: string,
    context: string,
  ): Promise<void> {
    try {
      await this.navigateToPortal();
      await executor.login(credentials);

      if (outcome === "success") {
        await executor.validateSuccess();
      } else {
        await executor.validateFailure();
      }

      if (persistAuthState) {
        await this.authenticationStateManager.saveAuthenticationState(this.page);
      }
    } catch (error) {
      ErrorHandler.captureError(error, source, context);
      throw error;
    }
  }
}
