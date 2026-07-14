import { type Page, type Response, expect } from "@playwright/test";
import { ActionBase } from "./actionBase.js";

export class NavigationActions extends ActionBase {
  /**
   * Creates navigation helpers for the active page.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigates to a specified URL.
   * @param url - The URL to navigate to.
   * @param options - Optional navigation options.
   * @param options.waitUntil - The lifecycle event to wait for before considering navigation complete.
   * @param options.timeout - Maximum navigation time in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the response or null.
   */
  public async navigateToUrl(
    url: string,
    options?: {
      waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
      timeout?: number;
    },
    source?: string,
  ): Promise<Response | null> {
    return await this.performAction(
      async () => await this.page.goto(url, options),
      `Navigated to ${url}`,
      `Failed to navigate to ${url}`,
      source,
    );
  }

  /**
   * Reloads the current page.
   * @param options - Optional reload options.
   * @param options.waitUntil - The lifecycle event to wait for before considering navigation complete.
   * @param options.timeout - Maximum navigation time in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the response or null.
   */
  public async reloadPage(
    options?: {
      waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
      timeout?: number;
    },
    source?: string,
  ): Promise<Response | null> {
    return await this.performAction(
      async () => await this.page.reload(options),
      "Page reloaded successfully",
      "Failed to reload page",
      source,
    );
  }

  /**
   * Navigates back in browser history.
   * @param options - Optional navigation options.
   * @param options.waitUntil - The lifecycle event to wait for before considering navigation complete.
   * @param options.timeout - Maximum navigation time in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the response or null.
   */
  public async goBack(
    options?: {
      waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
      timeout?: number;
    },
    source?: string,
  ): Promise<Response | null> {
    return await this.performAction(
      async () => await this.page.goBack(options),
      "Navigated back successfully",
      "Failed to navigate back",
      source,
    );
  }

  /**
   * Navigates forward in browser history.
   * @param options - Optional navigation options.
   * @param options.waitUntil - The lifecycle event to wait for before considering navigation complete.
   * @param options.timeout - Maximum navigation time in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the response or null.
   */
  public async goForward(
    options?: {
      waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
      timeout?: number;
    },
    source?: string,
  ): Promise<Response | null> {
    return await this.performAction(
      async () => await this.page.goForward(options),
      "Navigated forward successfully",
      "Failed to navigate forward",
      source,
    );
  }

  /**
   * Gets the current page URL.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns The current URL as a string.
   */
  public async getCurrentUrl(source?: string): Promise<string> {
    return await this.performAction(
      async () => await Promise.resolve(this.page.url()),
      "Retrieved current URL",
      "Failed to get current URL",
      source,
    );
  }

  /**
   * Gets the current page title.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the page title.
   */
  public async getPageTitle(source?: string): Promise<string> {
    return await this.performAction(
      async () => await this.page.title(),
      "Retrieved page title",
      "Failed to get page title",
      source,
    );
  }

  /**
   * Verifies that the current page URL matches the expected URL.
   * @param expectedUrl - The expected URL or pattern to verify against.
   * @param options - Optional timeout configuration.
   * @param options.timeout - Maximum time to wait for the URL to match, in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the URL has been verified.
   */
  public async verifyPageUrl(
    expectedUrl: string | RegExp,
    options?: { timeout?: number },
    source?: string,
  ): Promise<void> {
    return await this.performAction(
      async () => {
        await expect(this.page).toHaveURL(expectedUrl, {
          timeout: options?.timeout,
        });
      },
      `URL verification passed: ${expectedUrl.toString()}`,
      `URL verification failed for: ${expectedUrl.toString()}`,
      source,
    );
  }

  /**
   * Verifies that the page title matches the expected title.
   * @param expectedTitle - The expected title or pattern to verify against.
   * @param options - Optional timeout configuration.
   * @param options.timeout - Maximum time to wait for the title to match, in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the title has been verified.
   */
  public async verifyPageTitle(
    expectedTitle: string | RegExp,
    options?: { timeout?: number },
    source?: string,
  ): Promise<void> {
    return await this.performAction(
      async () => {
        await expect(this.page).toHaveTitle(expectedTitle, {
          timeout: options?.timeout,
        });
      },
      `Title verification passed: ${expectedTitle.toString()}`,
      `Title verification failed for: ${expectedTitle.toString()}`,
      source,
    );
  }

  /**
   * Waits for the URL to match a specified pattern.
   * @param pattern - URL pattern (string or regex) to match.
   * @param options - Optional timeout and waitUntil options.
   * @param options.timeout - Maximum time to wait for the URL to match, in milliseconds.
   * @param options.waitUntil - The lifecycle event to wait for before considering navigation complete.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the URL matches the pattern.
   */
  public async waitForURL(
    pattern: string | RegExp,
    options?: {
      timeout?: number;
      waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
    },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await this.page.waitForURL(pattern, options),
      `URL matches pattern: ${pattern}`,
      `Failed waiting for URL to match: ${pattern}`,
      source,
    );
  }

  /**
   * Waits for the page to be fully loaded.
   * @param state - The load state to wait for.
   * @param options - Optional timeout.
   * @param options.timeout - Maximum time to wait for the load state, in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the page reaches the given load state.
   */
  public async waitForPageLoad(
    state: "load" | "domcontentloaded" | "networkidle" = "load",
    options?: { timeout?: number },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await this.page.waitForLoadState(state, options),
      `Page reached ${state} state`,
      `Failed waiting for page to reach ${state} state`,
      source,
    );
  }

  /**
   * Waits for navigation to complete after an action.
   * @param action - The action that triggers navigation.
   * @param options - Optional timeout and waitUntil options.
   * @param options.timeout - Maximum time to wait for navigation, in milliseconds.
   * @param options.waitUntil - The lifecycle event to wait for before considering navigation complete.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the response or null.
   */
  public async waitForNavigation(
    action: () => Promise<void>,
    options?: {
      timeout?: number;
      waitUntil?: "load" | "domcontentloaded" | "networkidle";
    },
    source?: string,
  ): Promise<Response | null> {
    return await this.performAction(
      async () => {
        const waitPromise = this.page.waitForLoadState(options?.waitUntil ?? "load", {
          timeout: options?.timeout,
        });
        await Promise.all([waitPromise, action()]);
        return null;
      },
      "Navigation completed successfully",
      "Failed waiting for navigation",
      source,
    );
  }

  /**
   * Checks if the current URL contains a specific substring.
   * @param substring - The substring to check for in the URL.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns True if the URL contains the substring, false otherwise.
   */
  public async urlContains(substring: string, source?: string): Promise<boolean> {
    return await this.performAction(
      async () => await Promise.resolve(this.page.url().includes(substring)),
      `Checked if URL contains: ${substring}`,
      `Failed to check if URL contains: ${substring}`,
      source,
    );
  }

  /**
   * Checks if the current URL matches a regex pattern.
   * @param pattern - The regex pattern to match against the URL.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns True if the URL matches the pattern, false otherwise.
   */
  public async urlMatches(pattern: RegExp, source?: string): Promise<boolean> {
    return await this.performAction(
      async () => await Promise.resolve(pattern.test(this.page.url())),
      `Checked if URL matches pattern: ${pattern}`,
      `Failed to check if URL matches pattern: ${pattern}`,
      source,
    );
  }

  /**
   * Brings the page to the front (activates the tab).
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the page has been brought to the front.
   */
  public async bringToFront(source?: string): Promise<void> {
    await this.performAction(
      async () => await this.page.bringToFront(),
      "Brought page to front",
      "Failed to bring page to front",
      source,
    );
  }

  /**
   * Sets the viewport size.
   * @param width - The viewport width.
   * @param height - The viewport height.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the viewport has been resized.
   */
  public async setViewportSize(
    width: number,
    height: number,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await this.page.setViewportSize({ width, height }),
      `Viewport size set to ${width}x${height}`,
      `Failed to set viewport size to ${width}x${height}`,
      source,
    );
  }
}
