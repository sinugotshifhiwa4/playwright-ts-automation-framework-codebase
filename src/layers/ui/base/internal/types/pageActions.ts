import type { BrowserActions } from "../actions/browserActions.js";
import type { ElementActions } from "../actions/elementActions.js";
import type { ElementAssertions } from "../actions/elementAssertions.js";
import type { ElementWaits } from "../actions/elementWaits.js";
import type { FileActions } from "../actions/fileActions.js";
import type { FrameActions } from "../actions/frameActions.js";
import type { NavigationActions } from "../actions/navigationActions.js";

/**
 * Interface for page actions
 */
export interface IPageActions {
  navigation: NavigationActions;
  elementActions: ElementActions;
  elementAssertions: ElementAssertions;
  elementWaits: ElementWaits;
  browser: BrowserActions;
  frame: FrameActions;
  file: FileActions;
}
