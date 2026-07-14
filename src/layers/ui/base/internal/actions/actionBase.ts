import { test, type Page } from "@playwright/test";
import logger from "../../../../../config/logger/loggerManager.js";
import ErrorHandler from "../../../../../utils/error-handling/errorHandler.js";
import { resolveCallerSource } from "../callerSource.js";

export class ActionBase {
  protected readonly page: Page;

  /**
   * Creates a shared action wrapper bound to a Playwright page.
   * @param page - Active page instance used by action helpers.
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Execute an action, report it as a step, and handle any errors that may occur.
   *
   * `source` is resolved from the call stack when the caller does not supply one, so
   * an action never has to be told who called it. The override exists for the case the
   * stack cannot answer — an action invoked from inside a callback, where the frame
   * above is machinery rather than a page-object method.
   * @param action - The action to execute.
   * @param [successMessage] - Message to log if the action succeeds. Doubles as the step title in the report.
   * @param [errorMessage] - Message to log if the action fails.
   * @param [source] - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the result of the action if it succeeds, or rejects with the error if it fails.
   */
  public async performAction<T>(
    action: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string,
    source?: string,
  ): Promise<T> {
    // Resolved before the first await: the stack still holds the caller's frame.
    const caller = source ?? resolveCallerSource();

    return await this.asStep(successMessage ?? caller, async () => {
      try {
        const result = await action();
        if (successMessage) logger.info(successMessage);
        return result;
      } catch (error) {
        ErrorHandler.captureError(
          error,
          caller,
          errorMessage ?? `Failed to execute ${caller}`,
        );
        throw error;
      }
    });
  }

  /**
   * Runs a body inside a Playwright reporting step, when there is a test to report to.
   *
   * `test.step` throws outside a test — it has no test to attach the step to — so an
   * action driven from a global setup, a fixture, or a script would fail for reporting
   * reasons alone. The guard makes the step an enhancement rather than a precondition:
   * inside a test the report gains structure, outside one the action simply runs.
   * @param title - The step title shown in the Playwright report.
   * @param body - The work to perform inside the step.
   * @returns A promise that resolves with the body's result.
   */
  private async asStep<T>(title: string, body: () => Promise<T>): Promise<T> {
    if (!ActionBase.isInsideTest()) return await body();
    return await test.step(title, body);
  }

  /**
   * Reports whether the code is executing inside a Playwright test.
   *
   * `test.info()` is the only reliable probe: it throws when there is no active test,
   * which is exactly the condition that would make `test.step` throw.
   * @returns True when a Playwright test is active, false otherwise.
   */
  private static isInsideTest(): boolean {
    try {
      test.info();
      return true;
    } catch {
      return false;
    }
  }
}
