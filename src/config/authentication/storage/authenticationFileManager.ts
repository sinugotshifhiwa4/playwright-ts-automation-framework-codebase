import ErrorHandler from "../../../utils/error-handling/errorHandler.js";
import { AsyncFileManager } from "../../../utils/file-manager/asyncFileManager.js";
import { FileEncoding } from "../../../utils/file-manager/internal/fileEncoding.enum.js";
import { SyncFileManager } from "../../../utils/file-manager/syncFileManager.js";
import AuthenticationPathResolver from "../../../utils/path-resolver/authPathResolver.js";
import logger from "../../logger/loggerManager.js";

export default class AuthenticationFileManager {
  private static initialized = false;

  /**
   * Returns the absolute path to the authentication state file.
   * In a sharded CI run the path includes the shard index; otherwise it points to the shared CI auth file.
   * @returns The resolved absolute file path.
   * @throws Error if the path cannot be resolved.
   */
  public static getFilePath(): string {
    try {
      return SyncFileManager.resolve(AuthenticationPathResolver.getFilePath());
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "getFilePath",
        "Failed to resolve auth state file path",
      );
      throw error;
    }
  }

  /**
   * Overwrites the authentication state file with an empty state synchronously.
   * Use this during global setup where async is not available.
   * @returns The absolute path to the file that was reset.
   * @throws Error if the file cannot be written.
   */
  public static resetSync(): string {
    try {
      const filePath = this.getFilePath();
      this.writeFileSync(filePath);
      logger.debug(`Reset auth state file (sync): ${filePath}`);
      return filePath;
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "resetSync",
        "Failed to synchronously reset auth state file",
      );
      throw error;
    }
  }

  /**
   * Writes an empty authentication state file if it has not already been initialized in this session.
   * Subsequent calls are no-ops until {@link reset} is called.
   * @returns A promise that resolves when the file has been written.
   * @throws Error if the file cannot be written.
   */
  public static async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug("Auth state file already initialized");
      return;
    }

    try {
      const filePath = this.getFilePath();
      await this.writeFileAsync(filePath);
      this.initialized = true;
      logger.debug(`Initialized auth state file: ${filePath}`);
    } catch (error) {
      ErrorHandler.captureError(
        error,
        "initialize",
        "Failed to initialize auth state file",
      );
      throw error;
    }
  }

  /**
   * Clears the in-memory initialized flag, allowing the next {@link initialize} call to re-create the file.
   */
  public static reset(): void {
    this.initialized = false;
    logger.debug("Reset auth state manager session flag");
  }

  /**
   * Writes an empty authentication state to the given path, blocking until it is on disk.
   * @param filePath - The absolute path of the auth state file to write.
   */
  private static writeFileSync(filePath: string): void {
    SyncFileManager.writeFile(
      filePath,
      AuthenticationPathResolver.getEmptyAuthState(),
      "authStateFile",
      FileEncoding.UTF8,
    );
  }

  /**
   * Writes an empty authentication state to the given path.
   * @param filePath - The absolute path of the auth state file to write.
   * @returns A promise that resolves when the file has been written.
   */
  private static async writeFileAsync(filePath: string): Promise<void> {
    await AsyncFileManager.writeFile(
      filePath,
      AuthenticationPathResolver.getEmptyAuthState(),
      "authStateFile",
      FileEncoding.UTF8,
    );
  }
}
