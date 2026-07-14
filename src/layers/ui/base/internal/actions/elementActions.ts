import { type Page, type Locator } from "@playwright/test";
import { ActionBase } from "./actionBase.js";
import DataSanitizer from "../../../../../utils/sanitization/dataSanitizer.js";
import FieldValidator from "../../../../../utils/shared/fieldValidator.js";
import { resolveCallerSource } from "../callerSource.js";

export class ElementActions extends ActionBase {
  /**
   * Creates element interaction helpers for the active page.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Fill an element with a given value.
   * @param element - The element to fill.
   * @param value - The value to fill the element with.
   * @param elementName - The name of the element.
   * @param options - Optional configuration.
   * @param options.force - If true, forces the fill action even if the element is readonly.
   * @param options.allowEmpty - If true, allows filling the element with an empty value.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the fill action completes successfully.
   * @throws If the value is empty and allowEmpty is false, or if the fill action fails.
   */
  public async fillElement(
    element: Locator,
    value: string,
    elementName: string,
    options?: { force?: boolean; allowEmpty?: boolean },
    source?: string,
  ): Promise<void> {
    const caller = source ?? resolveCallerSource();

    const sanitizedValue = FieldValidator.validate(value, caller, {
      allowEmpty: options?.allowEmpty,
    });

    // The sanitizer decides what may be shown: a password reaches the report and the
    // log as a mask, never as the value that was typed.
    const { displayValue } = DataSanitizer.sanitizeFieldValue(
      elementName || "element not specified",
      sanitizedValue,
    );

    await this.performAction(
      async () => await element.fill(sanitizedValue, { force: options?.force ?? false }),
      `${elementName || "element"} filled successfully with value: ${displayValue}`,
      `Failed to fill ${elementName || "element"}`,
      caller,
    );
  }

  /**
   * Press digits sequentially in an element.
   * @param element - The element to press the digits in.
   * @param text - The string of digits to press sequentially.
   * @param elementName - The name of the element.
   * @param options - Optional configuration.
   * @param options.allowEmpty - If true, allows pressing sequentially with an empty value.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when all digits have been entered successfully.
   * @throws If the text is empty and allowEmpty is false, or if the press action fails.
   */
  public async typeDigitsSequentially(
    element: Locator,
    text: string,
    elementName: string,
    options?: { allowEmpty?: boolean },
    source?: string,
  ): Promise<void> {
    const caller = source ?? resolveCallerSource();

    const sanitizedText = FieldValidator.validate(text, caller, {
      allowEmpty: options?.allowEmpty,
    });

    await this.performAction(
      async () => {
        await element.pressSequentially(sanitizedText);
      },
      `Digits '${sanitizedText}' entered sequentially in ${elementName || "element"}`,
      `Error entering digits sequentially in ${elementName || "element"}`,
      caller,
    );
  }

  /**
   * Clicks an element.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param options - Optional parameters for the click action.
   * @param options.force - A boolean indicating whether to force the action.
   * @param options.trial - A boolean indicating whether to attempt the click action in a retry loop.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been clicked.
   */
  public async clickElement(
    element: Locator,
    elementName: string,
    options?: {
      force?: boolean;
      trial?: boolean;
    },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () =>
        await element.click({
          force: options?.force ?? false,
          trial: options?.trial ?? false,
        }),
      `Clicked on ${elementName}`,
      `Error clicking on ${elementName}`,
      source,
    );
  }

  /**
   * Clears an element.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been cleared.
   */
  public async clearElement(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await element.clear(),
      `Cleared ${elementName}`,
      `Error clearing ${elementName}`,
      source,
    );
  }

  /**
   * Clears an element by clicking on it three times and then pressing the backspace key.
   * This method is useful for clearing text fields that do not support the 'clear' method.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been cleared.
   */
  public async clearElementWithBackSpace(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await element.click({ clickCount: 3 });
        await element.press("Backspace");
      },
      `Cleared ${elementName}`,
      `Error clearing ${elementName}`,
      source,
    );
  }

  /**
   * Selects an option in an element.
   * @param element - The element locator.
   * @param optionValue - The value of the option to select.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the values of the selected options.
   */
  public async selectOption(
    element: Locator,
    optionValue: string,
    elementName: string,
    source?: string,
  ): Promise<string[]> {
    const cleanOptionValue = optionValue.replace(/^["']|["']$/g, "");

    return await this.performAction(
      async () => await element.selectOption(cleanOptionValue),
      `${elementName} option selected successfully with value: ${cleanOptionValue}`,
      `Error selecting option in ${elementName}`,
      source,
    );
  }

  /**
   * Focuses an element, i.e., sets focus on it.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been focused.
   */
  public async focusElement(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<void> {
    return await this.performAction(
      async () => await element.focus(),
      `Focused on ${elementName}`,
      `Failed to focus on ${elementName}`,
      source,
    );
  }

  /**
   * Blurs an element, i.e., removes focus from it.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been blurred.
   */
  public async blurElement(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<void> {
    return await this.performAction(
      async () => await element.blur(),
      `Blurred ${elementName}`,
      `Failed to blur ${elementName}`,
      source,
    );
  }

  /**
   * Checks an element, i.e., adds the checked state to it.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param options - Optional parameters for the check action.
   * @param options.force - A boolean indicating whether to force the action.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been checked.
   * @example
   * await checkElement(element, "checkbox");
   */
  public async checkElement(
    element: Locator,
    elementName: string,
    options?: { force?: boolean },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await element.check({ force: options?.force ?? false }),
      `${elementName} checked successfully`,
      `Failed to check ${elementName}`,
      source,
    );
  }

  /**
   * Unchecks an element, i.e., removes the checked state from it.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param options - Optional parameters for the uncheck action.
   * @param options.force - A boolean indicating whether to force the action.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been unchecked.
   */
  public async uncheckElement(
    element: Locator,
    elementName: string,
    options?: { force?: boolean },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await element.uncheck({ force: options?.force ?? false }),
      `${elementName} unchecked successfully`,
      `Failed to uncheck ${elementName}`,
      source,
    );
  }

  /**
   * Hovers over an element.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been hovered.
   * @example
   * await hoverElement(element, "button");
   */
  public async hoverElement(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        await element.hover();
      },
      `Hovered on ${elementName}`,
      `Failed to hover on ${elementName}`,
      source,
    );
  }

  /**
   * Hovers over an element and then clicks on it.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been hovered and clicked.
   * @example
   * await hoverThenClick(element, "button");
   */
  public async hoverThenClick(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<void> {
    // Resolved once and threaded into the nested actions, so both attribute to the
    // page-object method rather than to this composite.
    const caller = source ?? resolveCallerSource();

    await this.performAction(
      async () => {
        await this.hoverElement(element, elementName, caller);
        await this.clickElement(element, elementName, undefined, caller);
      },
      `Hovered and clicked on ${elementName}`,
      `Failed to hover and click on ${elementName}`,
      caller,
    );
  }

  /**
   * Double-clicks an element.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param options - Optional parameters for the double-click action.
   * @param options.force - If true, bypasses the actionability checks.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been double-clicked.
   * @example
   * await doubleClickElement(element, "button", { force: true });
   */
  public async doubleClickElement(
    element: Locator,
    elementName: string,
    options?: { force?: boolean },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => await element.dblclick({ force: options?.force ?? false }),
      `Double-clicked on ${elementName}`,
      `Failed to double-click on ${elementName}`,
      source,
    );
  }

  /**
   * Right-clicks an element.
   * @param element - The element locator.
   * @param elementName - The name of the element.
   * @param options - Optional parameters for the right-click action.
   * @param options.force - If true, bypasses the actionability checks.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been right-clicked.
   * @example
   * await rightClickElement(element, "button", { force: true });
   */
  public async rightClickElement(
    element: Locator,
    elementName: string,
    options?: { force?: boolean },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () =>
        await element.click({ button: "right", force: options?.force ?? false }),
      `Right-clicked on ${elementName}`,
      `Failed to right-click on ${elementName}`,
      source,
    );
  }

  /**
   * Drags an element to another element.
   * @param sourceElement - The element to drag.
   * @param targetElement - The element to drag to.
   * @param sourceElementName - The name of the source element.
   * @param targetElementName - The name of the target element.
   * @param options - Optional parameters for the drag action.
   * @param options.force - If true, bypasses the actionability checks.
   * @param options.sourcePosition - The point to grab the source element at, relative to its top-left corner.
   * @param options.sourcePosition.x - The horizontal offset, in pixels.
   * @param options.sourcePosition.y - The vertical offset, in pixels.
   * @param options.targetPosition - The point to drop on the target element, relative to its top-left corner.
   * @param options.targetPosition.x - The horizontal offset, in pixels.
   * @param options.targetPosition.y - The vertical offset, in pixels.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been dragged.
   * @example
   * await dragTo(sourceElement, targetElement, "source", "target", { force: true });
   */
  public async dragTo(
    sourceElement: Locator,
    targetElement: Locator,
    sourceElementName: string,
    targetElementName: string,
    options?: {
      force?: boolean;
      sourcePosition?: { x: number; y: number };
      targetPosition?: { x: number; y: number };
    },
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        const dragOptions: {
          force?: boolean;
          sourcePosition?: { x: number; y: number };
          targetPosition?: { x: number; y: number };
        } = {};

        if (options?.force !== undefined) {
          dragOptions.force = options.force;
        }
        if (options?.sourcePosition) {
          dragOptions.sourcePosition = options.sourcePosition;
        }
        if (options?.targetPosition) {
          dragOptions.targetPosition = options.targetPosition;
        }

        await sourceElement.dragTo(targetElement, dragOptions);
      },
      `Dragged ${sourceElementName} to ${targetElementName}`,
      `Failed to drag ${sourceElementName} to ${targetElementName}`,
      source,
    );
  }
}
