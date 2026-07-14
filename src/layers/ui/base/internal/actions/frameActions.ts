import { ActionBase } from "./actionBase.js";
import { UI_FRAME_TIMEOUT } from "../../../../../config/timeouts/ui.timeouts.js";
import type { Page, Frame, Locator, FrameLocator } from "@playwright/test";

/**
 * Frame resolution.
 *
 * This class deliberately does **not** mirror the element API. It used to: there was a
 * `clickElementInFrame`, a `fillElementInFrame`, a `checkElementInFrame` and nine more,
 * each of which resolved a locator inside a frame and then delegated straight to
 * `ElementActions`. The resolution was the only real work; the rest was transcription,
 * and it meant every new element action needed a frame twin or the frame API silently
 * fell behind the page API.
 *
 * The element helpers never touch `this.page` — they act on whatever `Locator` they are
 * handed. So a frame-scoped locator is all they ever needed:
 *
 *     const payButton = frame.elementIn("payment", "#submit");
 *     await elementActions.clickElement(payButton, "Pay button");
 *
 * Every element action, assertion and wait now works inside a frame, for free, forever.
 */
export class FrameActions extends ActionBase {
  /**
   * Creates frame resolution helpers for the active page.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Resolves a locator for an element inside a named frame.
   *
   * Synchronous and lazy, because a `FrameLocator` resolves nothing until it is used:
   * the frame does not have to exist yet. That is the point. The old `page.frame({name})`
   * lookup returned null the moment it was called if the iframe had not loaded, which
   * made every frame interaction a race against the page.
   * @param frameName - The name attribute of the frame.
   * @param selector - The selector for the element, resolved inside the frame.
   * @returns A locator scoped to the frame, usable with any element action, assertion or wait.
   */
  public elementIn(frameName: string, selector: string): Locator {
    return this.frameLocator(frameName).locator(selector);
  }

  /**
   * Resolves a frame locator by the frame's name attribute.
   * @param frameName - The name attribute of the frame.
   * @returns A lazily-resolved locator for the frame.
   */
  public frameLocator(frameName: string): FrameLocator {
    return this.page.frameLocator(`[name="${frameName}"]`);
  }

  /**
   * Waits for a frame to be attached to the page.
   *
   * Element interactions do not need this — a `FrameLocator` waits on its own. It exists
   * for the case where the frame's presence is itself the thing under test.
   * @param frameName - The name attribute of the frame.
   * @param timeout - Optional timeout in milliseconds.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves once the frame is attached, or rejects on timeout.
   */
  public async waitForFrame(
    frameName: string,
    timeout: number = UI_FRAME_TIMEOUT,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await this.page.locator(`iframe[name="${frameName}"]`).waitFor({
          state: "attached",
          timeout,
        });
      },
      `Frame '${frameName}' is available`,
      `Failed to wait for frame: ${frameName}`,
      source,
    );
  }

  /**
   * Retrieves a frame by its name.
   *
   * Returns the underlying `Frame`, for the cases a locator cannot serve — reading the
   * frame's URL, or evaluating in its context. Prefer `elementIn` for interaction.
   * @param frameName - The name attribute of the frame.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the frame if found, or null if not found.
   */
  public async getFrameByName(frameName: string, source?: string): Promise<Frame | null> {
    return await this.performAction(
      async () => await Promise.resolve(this.page.frame({ name: frameName })),
      `Retrieved frame: ${frameName}`,
      `Failed to get frame: ${frameName}`,
      source,
    );
  }

  /**
   * Retrieves a frame by its URL.
   * @param frameUrl - The URL of the frame (can be a string or regex).
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the frame if found, or null if not found.
   */
  public async getFrameByUrl(
    frameUrl: string | RegExp,
    source?: string,
  ): Promise<Frame | null> {
    return await this.performAction(
      async () => await Promise.resolve(this.page.frame({ url: frameUrl })),
      `Retrieved frame by URL: ${frameUrl.toString()}`,
      `Failed to get frame by URL: ${frameUrl.toString()}`,
      source,
    );
  }

  /**
   * Retrieves all frames on the page.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with an array of all frames.
   */
  public async getAllFrames(source?: string): Promise<Frame[]> {
    return await this.performAction(
      async () => await Promise.resolve(this.page.frames()),
      "Retrieved all frames",
      "Failed to get all frames",
      source,
    );
  }
}
