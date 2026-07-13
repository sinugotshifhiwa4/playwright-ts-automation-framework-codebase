import fs from "fs";
import path from "path";
import BaseFileManager from "./internal/baseFileManager.js";
import { FileEncoding } from "./internal/fileEncoding.enum.js";
import logger from "../../config/logger/loggerManager.js";
import ErrorHandler from "../error-handling/errorHandler.js";

export class SyncFileManager extends BaseFileManager {
  /**
   * Checks whether a path exists as a directory.
   * @param dirPath - The directory path to check.
   * @returns True when the directory exists.
   */
  public static doesDirectoryExist(dirPath: string): boolean {
    const normalizedPath = this.normalize(dirPath);
    this.validate(normalizedPath, "dirPath");

    try {
      const stats = fs.statSync(normalizedPath);
      return stats.isDirectory();
    } catch {
      logger.debug(`Directory does not exist: ${this.resolve(normalizedPath)}`);
      return false;
    }
  }

  /**
   * Checks whether a path exists as a file.
   * @param filePath - The file path to check.
   * @returns True when the file exists.
   */
  public static doesFileExist(filePath: string): boolean {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      const stats = fs.statSync(normalizedPath);
      return stats.isFile();
    } catch {
      logger.debug(`File does not exist: ${path.basename(normalizedPath)}`);
      return false;
    }
  }

  /**
   * Creates a directory structure recursively.
   * @param dirPath - The directory path to create.
   */
  public static createDirectory(dirPath: string): void {
    const normalizedPath = this.normalize(dirPath);
    this.validate(normalizedPath, "dirPath");

    try {
      fs.mkdirSync(normalizedPath, { recursive: true });
      logger.debug(`Created directory: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "createDirectorySync",
        `Failed to create directory: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Ensures that a directory exists, creating it if necessary.
   * @param dirPath - The directory path to ensure.
   * @returns An object indicating whether the directory was ensured successfully.
   */
  public static ensureDirectoryExists(dirPath: string): { success: boolean } {
    try {
      if (!this.doesDirectoryExist(dirPath)) {
        this.createDirectory(dirPath);
      }
      return { success: true };
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "ensureDirectoryExists",
        `Failed to ensure directory: ${dirPath}`,
      );
      return { success: false };
    }
  }

  /**
   * Reads content from a file.
   * @param filePath - The path of the file to read.
   * @param encoding - The file encoding to use.
   * @returns The file contents as a string.
   */
  public static readFile(
    filePath: string,
    encoding: FileEncoding = FileEncoding.UTF8,
  ): string {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      const content = fs.readFileSync(normalizedPath, { encoding });
      return content.toString();
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "readFileSync",
        `Failed to read file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Writes content to a file.
   * @param filePath - The path of the file to write.
   * @param content - The content to write.
   * @param keyName - A descriptive key used for error messages.
   * @param encoding - The file encoding to use.
   */
  public static writeFile(
    filePath: string,
    content: string,
    keyName: string,
    encoding: FileEncoding = FileEncoding.UTF8,
  ): void {
    const normalizedPath = this.normalize(filePath);

    try {
      this.validate(normalizedPath, "filePath");

      if (content === undefined || content === null) {
        const error = new Error(`No content provided for file: ${keyName}`);
        logger.warn(error.message);
        throw error;
      }

      const dirPath = path.dirname(normalizedPath);
      this.ensureDirectoryExists(dirPath);

      fs.writeFileSync(normalizedPath, content, { encoding });

      logger.debug(`Successfully wrote file: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "writeFileSync",
        `Failed to write file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Creates an empty file and its parent directories.
   * @param filePath - The file path to create.
   */
  public static createFile(filePath: string): void {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      const dirPath = path.dirname(normalizedPath);
      this.ensureDirectoryExists(dirPath);

      const fd = fs.openSync(normalizedPath, "a");
      fs.closeSync(fd);

      logger.debug(`Created file: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "createFileSync",
        `Failed to create file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Deletes a file.
   * @param filePath - The file path to delete.
   */
  public static deleteFile(filePath: string): void {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      fs.unlinkSync(normalizedPath);
      logger.debug(`Deleted file: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "deleteFileSync",
        `Failed to delete file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Checks whether a file or directory is accessible.
   * @param filePath - The path to check.
   * @param mode - The access mode to check.
   * @returns True when the path is accessible.
   */
  public static checkAccess(filePath: string, mode: number = fs.constants.F_OK): boolean {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      fs.accessSync(normalizedPath, mode);
      return true;
    } catch (error) {
      const modeDescription = this.getAccessModeDescription(mode);
      ErrorHandler.captureError(
        error,
        "checkAccessSync",
        `Access check failed for ${normalizedPath} (${modeDescription})`,
      );
      return false;
    }
  }
}
