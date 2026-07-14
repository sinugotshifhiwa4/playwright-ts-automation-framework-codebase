import { PageActionsContainer } from "./internal/pageActionsContainer.js";
import type { BrowserActions } from "./internal/actions/browserActions.js";
import type { ElementActions } from "./internal/actions/elementActions.js";
import type { ElementAssertions } from "./internal/actions/elementAssertions.js";
import type { ElementWaits } from "./internal/actions/elementWaits.js";
import type { FileActions } from "./internal/actions/fileActions.js";
import type { FrameActions } from "./internal/actions/frameActions.js";
import type { NavigationActions } from "./internal/actions/navigationActions.js";
import type { IPageActions } from "./internal/types/pageActions.js";
import type { Page } from "@playwright/test";

export class BasePage {
  public readonly page: Page;

  protected readonly actions: IPageActions;

  /**
   * Creates a base page wrapper with shared action helpers.
   * @param page - Active Playwright page instance.
   * @param actions - Optional prebuilt action container for dependency injection.
   */
  constructor(page: Page, actions?: IPageActions) {
    this.page = page;
    this.actions = actions ?? new PageActionsContainer(page);
  }

  /**
   * Returns the navigation actions.
   * @returns The navigation actions bound to this page.
   */
  public get navigation(): NavigationActions {
    return this.actions.navigation;
  }

  /**
   * Returns the element actions object.
   * @returns The element actions bound to this page.
   */
  public get elementActions(): ElementActions {
    return this.actions.elementActions;
  }

  /**
   * Returns the element assertions object.
   * @returns The element assertions bound to this page.
   */
  public get elementAssertions(): ElementAssertions {
    return this.actions.elementAssertions;
  }

  /**
   * Returns the element waits object.
   * @returns The element waits bound to this page.
   */
  public get elementWaits(): ElementWaits {
    return this.actions.elementWaits;
  }

  /**
   * Returns the browser actions object.
   * @returns The browser actions bound to this page.
   */
  public get browser(): BrowserActions {
    return this.actions.browser;
  }

  /**
   * Returns the frame actions object.
   * @returns The frame actions bound to this page.
   */
  public get frame(): FrameActions {
    return this.actions.frame;
  }

  /**
   * Returns the file actions object.
   * @returns The file actions bound to this page.
   */
  public get file(): FileActions {
    return this.actions.file;
  }
}
