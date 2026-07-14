/**
 * The state of an element: "enabled", "disabled", "visible", or "hidden".
 */
export type AssertionElementState = "enabled" | "disabled" | "visible" | "hidden";

/**
 * The state of an element: "visible", "hidden", "attached", or "detached".
 */
export type WaitForElementState = "visible" | "hidden" | "attached" | "detached";

/**
 * The method used to upload a file: "fileChooser" or "input".
 */
export type FileUploadMethod = "fileChooser" | "input";

/**
 * The outcome of a completed download.
 */
export interface DownloadResult {
  success: boolean;
  filePath: string;
  fileName: string;
}

export interface ElementPropertyMap {
  attribute: string | null;
  dimensions: { width: number; height: number };
  visibleText: string;
  textContent: string | null;
  inputValue: string;
}
