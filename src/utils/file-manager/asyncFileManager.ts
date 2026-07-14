import fs from "fs";
import path from "path";
import BaseFileManager from "./internal/baseFileManager.js";
import { FileEncoding } from "./internal/fileEncoding.enum.js";
import logger from "../../config/logger/loggerManager.js";
import ErrorHandler from "../error-handling/errorHandler.js";

export class AsyncFileManager extends BaseFileManager {
  /**
   * Checks whether a path exists as a file or directory.
   * @param targetPath - The path to check.
   * @returns A promise that resolves to true when the path exists.
   */
  public static async pathExists(targetPath: string): Promise<boolean> {
    const normalizedPath = this.normalize(targetPath);
    this.validate(normalizedPath, "targetPath");

    try {
      await fs.promises.access(normalizedPath, fs.constants.F_OK);
      return true;
    } catch {
      logger.debug(`Path does not exist: ${this.resolve(normalizedPath)}`);
      return false;
    }
  }

  /**
   * Creates a directory structure recursively.
   * @param dirPath - The directory path to create.
   * @returns A promise that resolves when the directory exists.
   */
  public static async createDirectory(dirPath: string): Promise<void> {
    const normalizedPath = this.normalize(dirPath);
    this.validate(normalizedPath, "dirPath");

    try {
      await fs.promises.mkdir(normalizedPath, { recursive: true });
      logger.debug(`Created directory: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "createDirectory",
        `Failed to create directory: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Creates an empty file and its parent directories.
   * @param filePath - The file path to create.
   * @returns A promise that resolves when the file exists.
   */
  public static async createFile(filePath: string): Promise<void> {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      const dirPath = path.dirname(normalizedPath);
      await this.createDirectory(dirPath);

      const fileHandle = await fs.promises.open(normalizedPath, "a");
      await fileHandle.close();

      logger.debug(`Created file: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "createFile",
        `Failed to create file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Checks whether a path exists as a directory.
   * @param dirPath - The directory path to check.
   * @returns A promise that resolves to true when the directory exists.
   */
  public static async doesDirectoryExist(dirPath: string): Promise<boolean> {
    const normalizedPath = this.normalize(dirPath);
    this.validate(normalizedPath, "dirPath");

    try {
      const stats = await fs.promises.stat(normalizedPath);
      return stats.isDirectory();
    } catch {
      logger.debug(`Directory does not exist: ${this.resolve(normalizedPath)}`);
      return false;
    }
  }

  /**
   * Checks whether a path exists as a file.
   * @param filePath - The file path to check.
   * @returns A promise that resolves to true when the file exists.
   */
  public static async doesFileExist(filePath: string): Promise<boolean> {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      const stats = await fs.promises.stat(normalizedPath);
      return stats.isFile();
    } catch {
      logger.debug(`File does not exist: ${path.basename(normalizedPath)}`);
      return false;
    }
  }

  /**
   * Writes content to a file with improved error handling.
   * @param filePath - The path of the file to write.
   * @param content - The content to write.
   * @param keyName - A descriptive key used for error messages.
   * @param encoding - The file encoding to use.
   * @returns A promise that resolves when the content has been written.
   */
  public static async writeFile(
    filePath: string,
    content: string,
    keyName: string,
    encoding: FileEncoding = FileEncoding.UTF8,
  ): Promise<void> {
    const normalizedPath = this.normalize(filePath);

    try {
      this.validate(normalizedPath, "filePath");

      if (content === undefined || content === null) {
        const error = new Error(`No content provided for file: ${keyName}`);
        logger.warn(error.message);
        throw error;
      }

      const dirPath = path.dirname(normalizedPath);
      await this.createDirectory(dirPath);

      await fs.promises.writeFile(normalizedPath, content, { encoding });

      logger.debug(`Successfully wrote file: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "writeFile",
        `Failed to write file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Reads content from a file.
   * @param filePath - The path of the file to read.
   * @param encoding - The file encoding to use.
   * @returns A promise that resolves to the file contents.
   */
  public static async readFile(
    filePath: string,
    encoding: FileEncoding = FileEncoding.UTF8,
  ): Promise<string> {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      const content = await fs.promises.readFile(normalizedPath, { encoding });
      return content.toString();
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "readFile",
        `Failed to read file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Reads a file as a buffer.
   * @param filePath - The path of the file to read.
   * @returns A promise that resolves to a Buffer containing the file contents.
   */
  public static async readFileBuffer(filePath: string): Promise<Buffer> {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      return await fs.promises.readFile(normalizedPath);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "readFileBuffer",
        `Failed to read file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Deletes a file.
   * @param filePath - The file path to delete.
   * @returns A promise that resolves when the file has been deleted.
   */
  public static async deleteFile(filePath: string): Promise<void> {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      await fs.promises.unlink(normalizedPath);
      logger.debug(`Deleted file: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "deleteFile",
        `Failed to delete file: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Deletes a directory recursively.
   * @param dirPath - The directory path to delete.
   * @returns A promise that resolves when the directory has been deleted.
   */
  public static async deleteDirectory(dirPath: string): Promise<void> {
    const normalizedPath = this.normalize(dirPath);
    this.validate(normalizedPath, "dirPath");

    try {
      await fs.promises.rm(normalizedPath, { recursive: true, force: true });
      logger.debug(`Deleted directory: ${this.resolve(normalizedPath)}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "deleteDirectory",
        `Failed to delete directory: ${normalizedPath}`,
      );
      throw error;
    }
  }

  /**
   * Ensures that a directory exists, creating it if necessary.
   * @param dirPath - The directory path to ensure.
   * @returns A promise that resolves when the directory exists.
   */
  public static async ensureDirectory(dirPath: string): Promise<void> {
    if (!(await this.doesDirectoryExist(dirPath))) {
      await this.createDirectory(dirPath);
    }
  }

  /**
   * Ensures that a file exists, creating it if necessary.
   * @param filePath - The file path to ensure.
   * @returns A promise that resolves when the file exists.
   */
  public static async ensureFile(filePath: string): Promise<void> {
    if (!(await this.doesFileExist(filePath))) {
      await this.createFile(filePath);
    }
  }

  /**
   * Checks whether a file or directory is accessible.
   * @param filePath - The path to check.
   * @param mode - The access mode to check.
   * @returns A promise that resolves to true when the path is accessible.
   */
  public static async checkAccess(
    filePath: string,
    mode: number = fs.constants.F_OK,
  ): Promise<boolean> {
    const normalizedPath = this.normalize(filePath);
    this.validate(normalizedPath, "filePath");

    try {
      await fs.promises.access(normalizedPath, mode);
      return true;
    } catch (error) {
      const modeDescription = this.getAccessModeDescription(mode);
      ErrorHandler.captureError(
        error,
        "checkAccess",
        `Access check failed for ${normalizedPath} (${modeDescription})`,
      );
      return false;
    }
  }
}
