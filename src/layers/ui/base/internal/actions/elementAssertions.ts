import { type Page, type Locator, expect } from "@playwright/test";
import { ActionBase } from "./actionBase.js";
import type { AssertionElementState, ElementPropertyMap } from "../types/actions.type.js";

export class ElementAssertions extends ActionBase {
  /**
   * Creates element assertion helpers for the active page.
   * @param page - Active Playwright page instance.
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Retrieves an element property.
   * @param element - The element locator.
   * @param propertyType - The type of property to retrieve.
   * @param elementName - The name of the element.
   * @param options - Optional: options for retrieving the property.
   * @param options.attributeName - The attribute to read, when the property type is an attribute.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns The retrieved property value.
   */
  public async getElementProperty<K extends keyof ElementPropertyMap>(
    element: Locator,
    propertyType: K,
    elementName: string,
    options?: { attributeName?: string },
    source?: string,
  ): Promise<ElementPropertyMap[K]> {
    return await this.performAction(
      async (): Promise<ElementPropertyMap[K]> => {
        switch (propertyType) {
          case "attribute": {
            if (!options?.attributeName) {
              throw new Error("attributeName is required for 'attribute'");
            }
            return (await element.getAttribute(
              options.attributeName,
            )) as ElementPropertyMap[K];
          }

          case "dimensions": {
            const boundingBox = await element.boundingBox();
            if (!boundingBox) {
              throw new Error("Failed to get element bounding box");
            }
            return {
              width: boundingBox.width,
              height: boundingBox.height,
            } as ElementPropertyMap[K];
          }

          case "visibleText":
            return (await element.innerText()) as ElementPropertyMap[K];

          case "textContent":
            return (await element.textContent()) as ElementPropertyMap[K];

          case "inputValue":
            return (await element.inputValue()) as ElementPropertyMap[K];

          default: {
            const _exhaustiveCheck: never = propertyType;
            throw new Error(`Unsupported property type: ${String(_exhaustiveCheck)}`);
          }
        }
      },
      `Retrieved ${String(propertyType)} from ${elementName}`,
      `Failed to get ${String(propertyType)} from ${elementName}`,
      source,
    );
  }

  /**
   * Retrieves all text content from multiple elements.
   * @param elements - The Locator of elements to retrieve text content from.
   * @param elementName - The name of the elements.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns An array of text content from all matching elements.
   */
  public async getAllTextContents(
    elements: Locator,
    elementName: string,
    source?: string,
  ): Promise<string[]> {
    return await this.performAction(
      async () => {
        return await elements.allTextContents();
      },
      `Retrieved all text contents from ${elementName}`,
      `Failed to get all text contents from ${elementName}`,
      source,
    );
  }

  /**
   * Checks if an element is visible.
   * @param element - The Locator of the element to check.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with true if the element is visible, or false otherwise.
   */
  public async isElementVisible(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<boolean> {
    return await this.performAction(
      async () => await element.isVisible(),
      `Verified: ${elementName} is visible`,
      `Failed to check visibility of ${elementName}`,
      source,
    );
  }

  /**
   * Retrieves the count of matching elements.
   * @param element - The Locator of elements to retrieve the count from.
   * @param elementName - The name of the elements.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the count of matching elements.
   */
  public async getElementCount(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<number> {
    return await this.performAction(
      async () => await element.count(),
      `Retrieved count for ${elementName}`,
      `Failed to get count for ${elementName}`,
      source,
    );
  }

  /**
   * Retrieves the bounding box of an element.
   * @param element - The Locator of the element to retrieve the bounding box from.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the bounding box, or null if unavailable.
   */
  public async getBoundingBox(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return await this.performAction(
      async () => await element.boundingBox(),
      `Retrieved bounding box for ${elementName}`,
      `Failed to get bounding box for ${elementName}`,
      source,
    );
  }

  /**
   * Verifies that an element is in a specified state.
   * @param element - The Locator of the element to verify.
   * @param state - The desired state: "enabled", "disabled", "visible", or "hidden".
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the element has been verified to be in the given state.
   */
  public async verifyElementState(
    element: Locator,
    state: AssertionElementState,
    elementName: string,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        switch (state) {
          case "enabled":
            await expect(element).toBeEnabled();
            break;
          case "disabled":
            await expect(element).toBeDisabled();
            break;
          case "visible":
            await expect(element).toBeVisible();
            break;
          case "hidden":
            await expect(element).not.toBeVisible();
            break;
        }
      },
      `${elementName} state is ${state}`,
      `Failed to verify element ${elementName} is ${state}`,
      source,
    );
  }

  /**
   * Checks if an element is editable.
   * @param element - The Locator of the element to check.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with true if the element is editable, or false otherwise.
   */
  public async isElementEditable(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<boolean> {
    return await this.performAction(
      async () => await element.isEditable(),
      `${elementName} is editable`,
      `Failed to check if ${elementName} is editable`,
      source,
    );
  }

  /**
   * Checks if an element is checked.
   * @param element - The Locator of the element to check.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with true if the element is checked, or false otherwise.
   */
  public async isElementChecked(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<boolean> {
    return await this.performAction(
      async () => await element.isChecked(),
      `${elementName} is checked`,
      `Failed to check if ${elementName} is checked`,
      source,
    );
  }

  /**
   * Checks if an element is disabled.
   * @param element - The Locator of the element to check.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with true if the element is disabled, or false otherwise.
   */
  public async isElementDisabled(
    element: Locator,
    elementName: string,
    source?: string,
  ): Promise<boolean> {
    return await this.performAction(
      async () => await element.isDisabled(),
      `${elementName} disabled state checked`,
      `Failed to check disabled state for ${elementName}`,
      source,
    );
  }

  /**
   * Verifies the state of a checkbox.
   * @param element - The Locator of the element to verify.
   * @param isChecked - Whether the checkbox should be checked or not.
   * @param elementName - The name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves if the verification succeeds, or rejects with an error if it fails.
   */
  public async verifyCheckboxState(
    element: Locator,
    isChecked: boolean,
    elementName: string,
    source?: string,
  ): Promise<void> {
    await this.performAction(
      async () => {
        if (isChecked) {
          await expect(element).toBeChecked();
        } else {
          await expect(element).not.toBeChecked();
        }
      },
      `${elementName} is ${isChecked ? "checked" : "unchecked"}`,
      `Failed to verify ${elementName} is ${isChecked ? "checked" : "unchecked"}`,
      source,
    );
  }

  /**
   * Check whether a locator has a given attribute (regardless of its value).
   * @param element - The element locator.
   * @param attr - The attribute name to check.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves to true when the attribute is present, false otherwise.
   */
  public async hasAttribute(
    element: Locator,
    attr: string,
    source?: string,
  ): Promise<boolean> {
    return await this.performAction(
      async () => (await element.getAttribute(attr)) !== null,
      `Attribute "${attr}" found on element`,
      `Failed to check attribute "${attr}" on element`,
      source,
    );
  }

  /**
   * Returns the value of an attribute, or null if it is absent.
   * @param element - The element locator.
   * @param attr - The attribute name to retrieve.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves to the attribute's value, or null if it is absent.
   */
  public async getAttributeValue(
    element: Locator,
    attr: string,
    source?: string,
  ): Promise<string | null> {
    return await this.performAction(
      async () => await element.getAttribute(attr),
      `Retrieved value for attribute "${attr}"`,
      `Failed to get value for attribute "${attr}"`,
      source,
    );
  }

  /**
   * Check whether a locator contains a specific CSS class.
   * Uses a word-boundary regex to avoid partial matches (e.g. "btn" inside "btn-primary").
   * @param element - The element locator.
   * @param className - The CSS class name to look for.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves to true when the element carries the class, false otherwise.
   */
  public async hasClass(
    element: Locator,
    className: string,
    source?: string,
  ): Promise<boolean> {
    return await this.performAction(
      async () => {
        const classes = await element.getAttribute("class");
        if (!classes) return false;
        return new RegExp(`(?:^|\\s)${className}(?:\\s|$)`).test(classes);
      },
      `Class "${className}" found on element`,
      `Failed to check class "${className}" on element`,
      source,
    );
  }
}
