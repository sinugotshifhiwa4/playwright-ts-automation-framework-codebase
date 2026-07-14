import { BrowserActions } from "./actions/browserActions.js";
import { ElementActions } from "./actions/elementActions.js";
import { ElementAssertions } from "./actions/elementAssertions.js";
import { ElementWaits } from "./actions/elementWaits.js";
import { FileActions } from "./actions/fileActions.js";
import { FrameActions } from "./actions/frameActions.js";
import { NavigationActions } from "./actions/navigationActions.js";
import type { IPageActions } from "./types/pageActions.js";
import type { Page } from "@playwright/test";

export class PageActionsContainer implements IPageActions {
  public readonly page: Page;

  // Frequently used actions
  public readonly navigation: NavigationActions;

  public readonly elementActions: ElementActions;

  public readonly elementAssertions: ElementAssertions;

  public readonly elementWaits: ElementWaits;

  // Lazily instantiated actions
  private _browser?: BrowserActions;

  private _frame?: FrameActions;

  private _file?: FileActions;

  /**
   * Creates an action container bound to a single Playwright page.
   * Frequently used actions are initialized eagerly, while less common ones are lazy-loaded.
   * @param page - Active page instance used by all action helpers.
   */
  constructor(page: Page) {
    this.page = page;

    // instantiate commonly used actions
    this.navigation = new NavigationActions(page);
    this.elementActions = new ElementActions(page);
    this.elementAssertions = new ElementAssertions(page);
    this.elementWaits = new ElementWaits(page);
  }

  // Lazy getters for rarely used actions

  /**
   * Returns the BrowserActions object.
   *
   * @returns The BrowserActions object.
   */
  get browser(): BrowserActions {
    this._browser ??= new BrowserActions(this.page);
    return this._browser;
  }

  /**
   * Returns the FrameActions object.
   * @returns The FrameActions object.
   */
  get frame(): FrameActions {
    this._frame ??= new FrameActions(this.page);
    return this._frame;
  }

  /**
   * Returns the FileActions object.
   * @returns The FileActions object.
   */
  get file(): FileActions {
    this._file ??= new FileActions(this.page, this.elementActions);
    return this._file;
  }
}
