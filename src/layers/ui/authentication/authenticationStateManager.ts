import AuthenticationFileManager from "../../../config/authentication/storage/authenticationFileManager.js";
import logger from "../../../config/logger/loggerManager.js";
import ErrorHandler from "../../../utils/error-handling/errorHandler.js";
import type { Page } from "@playwright/test";

export class AuthenticationStateManager {
  /**
   * Saves the current authentication state to the shared auth file.
   * @param page - Active page whose context's storage state is captured.
   * @returns A promise that resolves to true on success, or throws on failure.
   */
  public async saveAuthenticationState(page: Page): Promise<boolean> {
    try {
      const storagePath = AuthenticationFileManager.getFilePath();
      await page.context().storageState({ path: storagePath });
      logger.debug(`Authentication state saved successfully`);
      return true;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "saveAuthenticationState",
        "Failed to save authentication state",
      );
      throw error;
    }
  }
}
