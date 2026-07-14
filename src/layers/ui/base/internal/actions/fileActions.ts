import fs from "fs";
import { ActionBase } from "./actionBase.js";
import ErrorHandler from "../../../../../utils/error-handling/errorHandler.js";
import { AsyncFileManager } from "../../../../../utils/file-manager/asyncFileManager.js";
import { resolveCallerSource } from "../callerSource.js";
import DownloadPathBuilder from "../downloadPathBuilder.js";
import type { ElementActions } from "./elementActions.js";
import type { DownloadResult, FileUploadMethod } from "../types/actions.type.js";
import type { DownloadPathOptions } from "../types/downloadPathBuilder.type.js";
import type { Page, Locator, Download } from "@playwright/test";

export class FileActions extends ActionBase {
  private elementActions: ElementActions;

  /**
   * Creates file interaction helpers for uploads and downloads on the active page.
   * @param page - Active Playwright page instance.
   * @param elementActions - Element helper used for file-picker interactions.
   */
  constructor(page: Page, elementActions: ElementActions) {
    super(page);
    this.elementActions = elementActions;
  }

  /**
   * Executes a download action and verifies that the file has been downloaded to the specified path.
   * Ensures the downloads directory exists, then triggers the download action and verifies the file has been downloaded.
   * If the download fails, an error is thrown.
   * @param errorMessage - Error message to log if the download fails.
   * @param triggerAction - Action to trigger the download.
   * @param options - Options for creating a download path.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves with the downloaded file.
   * @throws If the download fails.
   */
  public async executeDownload(
    errorMessage: string,
    triggerAction: () => Promise<void>,
    options: DownloadPathOptions,
    source?: string,
  ): Promise<DownloadResult> {
    const caller = source ?? resolveCallerSource();

    try {
      await this.ensureDownloadDirectoryExists();

      const downloadPath = DownloadPathBuilder.createFilePath(
        options.fileName,
        options.fileExtension,
      );

      const download = await this.handleDownload(triggerAction, downloadPath, caller);

      await this.verifyFileDownloaded(downloadPath, caller);

      return this.createDownloadResult(downloadPath, download);
    } catch (error) {
      ErrorHandler.captureError(error, caller, errorMessage);
      throw error;
    }
  }

  /**
   * Upload a file to the page.
   * @param element - Element to interact with for uploading the file.
   * @param filePath - Path to save the file to.
   * @param uploadMethod - Method to use for uploading the file: 'fileChooser' or 'input'.
   * @param elementName - Name of the element.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves when the file has been uploaded.
   */
  public async uploadFile(
    element: Locator,
    filePath: string,
    uploadMethod: FileUploadMethod,
    elementName: string,
    source?: string,
  ): Promise<void> {
    const caller = source ?? resolveCallerSource();

    return await this.performAction(
      async () => {
        if (uploadMethod === "fileChooser") {
          // Wait for fileChooser to be triggered
          const [fileChooser] = await Promise.all([
            this.page.waitForEvent("filechooser"),
            this.elementActions.clickElement(element, elementName, undefined, caller),
          ]);
          await fileChooser.setFiles(filePath);
        } else {
          await element.setInputFiles(filePath);
        }
      },
      `File '${elementName}' uploaded successfully via '${uploadMethod}' on path: ${filePath}`,
      `Failed to upload file via ${uploadMethod}`,
      caller,
    );
  }

  /**
   * Handles a file download.
   * Waits for the download to be triggered and returns the downloaded file.
   * If a downloadPath is provided, the file is saved to that path.
   * @param triggerAction - Action to trigger the download.
   * @param downloadPath - Path to save the downloaded file to.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns Promise that resolves with the downloaded file.
   */
  public async handleDownload(
    triggerAction: () => Promise<void>,
    downloadPath?: string,
    source?: string,
  ): Promise<Download> {
    const caller = source ?? resolveCallerSource();

    return await this.performAction(
      async () => {
        const [download] = await Promise.all([
          this.page.waitForEvent("download"),
          triggerAction(),
        ]);

        const failure = await download.failure();

        if (failure) {
          ErrorHandler.logAndThrow(caller, `Download failed: ${failure}`);
        }

        if (downloadPath) {
          await download.saveAs(downloadPath);
        }

        // Remove the browser-owned temp artifact so context teardown does not
        // have to wait on an already-processed download.
        await download.delete();

        return download;
      },
      `File download handled${downloadPath ? ` and saved to: ${downloadPath}` : ""}`,
      "Failed to handle file download",
      caller,
    );
  }

  /**
   * Verifies that a file has been downloaded to the specified path.
   * @param filePath - Path to the file to verify.
   * @param source - Overrides the stack-derived caller name in logs and errors.
   * @returns A promise that resolves if the verification succeeds, or rejects with the error if it fails.
   * @example
   * await verifyFileDownloaded("path/to/file");
   */
  public async verifyFileDownloaded(filePath: string, source?: string): Promise<void> {
    const caller = source ?? resolveCallerSource();

    return await this.performAction(
      async () => {
        const result = await AsyncFileManager.checkAccess(filePath, fs.constants.F_OK);

        if (!result) {
          ErrorHandler.logAndThrow(caller, `File not found at path: ${filePath}`);
        }
      },
      `File successfully downloaded to: ${filePath}`,
      `File verification failed for: ${filePath}`,
      caller,
    );
  }

  /**
   * Ensures the downloads directory exists, if it doesn't, creates it.
   * This directory is used to store downloaded files.
   * @returns A promise that resolves once the downloads directory is present.
   */
  private async ensureDownloadDirectoryExists(): Promise<void> {
    const exist = await AsyncFileManager.doesDirectoryExist("downloads");

    if (!exist) {
      await AsyncFileManager.ensureDirectory("downloads");
    }
  }

  /**
   * Creates a download result object for a successful download.
   * The download result object contains the following properties:
   * - success: A boolean indicating whether the download was successful.
   * - filePath: The path to the downloaded file.
   * - fileName: The name of the downloaded file as suggested by the browser.
   * @param filePath - The path to the downloaded file.
   * @param download - The download object returned by playwright.
   * @returns The download result object.
   */
  private createDownloadResult(filePath: string, download: Download): DownloadResult {
    return {
      success: true,
      filePath,
      fileName: download.suggestedFilename(),
    };
  }
}
