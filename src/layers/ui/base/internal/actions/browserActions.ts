import { ActionBase } from "./actionBase.js";
import logger from "../../../../../config/logger/loggerManager.js";
import ErrorHandler from "../../../../../utils/error-handling/errorHandler.js";
import { resolveCallerSource } from "../callerSource.js";
import type { Page, Locator, Cookie, TestInfo, Response } from "@playwright/test";

export class BrowserActions extends ActionBase {
  /**
   * Creates browser-level action helpers for the active page context.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Refresh the current page.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves to the reload response, or null if no navigation occurred.
   */
  public async refreshPage(source?: string): Promise<Response | null> {
    return await this.performAction(
      async () => await this.page.reload(),
      "Page refreshed successfully",
      "Failed to refresh page",
      source,
    );
  }

  /**
   * Switches to the tab at the specified index.
   * @param index - The index of the tab to switch to.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the tab has been brought to the front, or throws if the tab index does not exist.
   */
  public async switchTab(index: number, source?: string): Promise<void> {
    await this.performAction(
      async () => {
        const pages = this.page.context().pages();
        if (index >= pages.length) {
          throw new Error(
            `Tab index ${index} does not exist. Total tabs: ${pages.length}`,
          );
        }
        await pages[index]?.bringToFront();
      },
      `Switched to tab index ${index}`,
      `Failed to switch to tab index ${index}`,
      source,
    );
  }

  /**
   * Close the current tab.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the tab has been closed.
   */
  public async closeTab(source?: string): Promise<void> {
    await this.performAction(
      async () => await this.page.close(),
      "Current tab closed",
      "Failed to close current tab",
      source,
    );
  }

  /**
   * Handle JavaScript alert/confirm/prompt dialogs.
   * @param action - Action to take: 'accept' or 'dismiss'.
   * @param promptText - Text to enter for prompt dialogs (optional, only used for prompt type).
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves once the dialog has been accepted or dismissed.
   */
  public async handleDialog(
    action: "accept" | "dismiss",
    promptText?: string,
    source?: string,
  ): Promise<void> {
    const caller = source ?? resolveCallerSource();

    return await new Promise<void>((resolve, reject) => {
      this.page.once("dialog", async (dialog) => {
        try {
          if (action === "accept") {
            if (dialog.type() === "prompt" && promptText !== undefined) {
              await dialog.accept(promptText);
            } else {
              await dialog.accept();
            }
          } else {
            await dialog.dismiss();
          }
          logger.info(
            `Dialog ${action}ed: ${dialog.type()}${promptText ? ` with text: "${promptText}"` : ""}`,
          );
          resolve();
        } catch (error) {
          ErrorHandler.captureError(error, caller, `Failed to handle dialog`);
          reject(error instanceof Error ? error : new Error("Failed to handle dialog"));
        }
      });
    });
  }

  /**
   * Get all cookies from the current context.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves to the cookies in the current context.
   */
  public async getCookies(source?: string): Promise<Cookie[]> {
    return await this.performAction(
      async () => await this.page.context().cookies(),
      `Retrieved all cookies`,
      `Failed to get cookies`,
      source,
    );
  }

  /**
   * Add a cookie to the current context.
   * @param cookie - Cookie object to add.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the cookie has been added.
   */
  public async addCookie(cookie: Cookie, source?: string): Promise<void> {
    await this.performAction(
      async () => await this.page.context().addCookies([cookie]),
      `Cookie added: ${cookie.name}`,
      `Failed to add cookie: ${cookie.name}`,
      source,
    );
  }

  /**
   * Clear all cookies.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when all cookies have been cleared.
   */
  public async clearCookies(source?: string): Promise<void> {
    await this.performAction(
      async () => await this.page.context().clearCookies(),
      `All cookies cleared`,
      `Failed to clear cookies`,
      source,
    );
  }

  /**
   * Scrolls an element into view if it is not already visible.
   * @param element - The element locator to scroll into view.
   * @param elementName - The name of the element being scrolled into view.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been scrolled into view.
   */
  public async scrollElementIntoView(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await element.scrollIntoViewIfNeeded(),
      `${elementName} scrolled into view`,
      `Failed to scroll ${elementName} into view`,
      source,
    );
  }

  /**
   * Scroll the page to specific coordinates.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the page has been scrolled.
   */
  public async scrollTo(x: number, y: number, source?: string): Promise<void> {
    await this.performAction(
      async () => await this.page.evaluate(({ x, y }) => window.scrollTo(x, y), { x, y }),
      `Scrolled to coordinates (${x}, ${y})`,
      `Failed to scroll to coordinates (${x}, ${y})`,
      source,
    );
  }

  /**
   * Attach a screenshot to the test report (Playwright HTML report).
   * @param fileName - The name to show in the report.
   * @param testInfo - Playwright testInfo object.
   * @param page - Optional: page to capture (defaults to `this.page`).
   * @returns A promise that resolves when the screenshot has been attached.
   */
  public async attachScreenshotToReport(
    fileName: string,
    testInfo: TestInfo,
    page: Page = this.page,
  ): Promise<void> {
    await testInfo.attach(fileName, {
      body: await page.screenshot(),
      contentType: "image/png",
    });
  }
}
