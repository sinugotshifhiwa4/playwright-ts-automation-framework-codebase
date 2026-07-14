import { AUTH_STATE_CONFIG } from "../../config/authentication/constants/authentication.constants.js";
import ErrorHandler from "../error-handling/errorHandler.js";
import { SyncFileManager } from "../file-manager/syncFileManager.js";

export default class AuthenticationPathResolver {
  // Cached root directory path for authentication state files. Initialized on first access.
  private static rootDir: string | null = null;

  /**
   * Returns the absolute path to the shared authentication state file.
   * In a sharded CI run the file name includes the shard index so each shard
   * writes to its own file and avoids race conditions.
   * @returns The absolute path to the authentication state file.
   */
  public static getFilePath(): string {
    return this.execute("getFilePath", "Failed to get auth file path", () => {
      const root = this.getRootDir();
      const { SHARD_INDEX, SHARD_TOTAL } = process.env;

      if (SHARD_INDEX && SHARD_TOTAL) {
        const shardFileName = `${AUTH_STATE_CONFIG.CI_SHARD_PREFIX}${SHARD_INDEX}.json`;
        return SyncFileManager.join(root, shardFileName);
      }

      return SyncFileManager.join(root, AUTH_STATE_CONFIG.CI_AUTH_FILE);
    });
  }

  /**
   * Returns the empty authentication state string used to initialize the authentication state file.
   * This string is used as a placeholder when the authentication state file is reset or initialized.
   * @returns The empty authentication state string.
   */
  public static getEmptyAuthState(): string {
    return this.execute(
      "getEmptyAuthState",
      "Failed to get empty auth state",
      () => AUTH_STATE_CONFIG.EMPTY_STATE,
    );
  }

  /**
   * Executes a given operation and wraps any errors with additional information using ErrorHandler.
   * @template T - The type of the operation result
   * @param methodName - The name of the method calling this function
   * @param errorMessage - An error message to log if the operation fails
   * @param operation - The operation to execute
   * @returns The operation result
   * @throws Error - If the operation fails, an error with additional information is thrown
   */
  private static execute<T>(
    methodName: string,
    errorMessage: string,
    operation: () => T,
  ): T {
    try {
      return operation();
    } catch (error) {
      ErrorHandler.captureError(error, methodName, errorMessage);
      throw error;
    }
  }

  /**
   * Gets the root directory path for authentication state files.
   * Lazily initializes and ensures the directory exists on first access.
   * @returns The absolute path to the authentication state files root directory
   */
  private static getRootDir(): string {
    return this.execute("getRootDir", "Failed to get root directory", () => {
      if (this.rootDir === null) {
        this.rootDir = SyncFileManager.resolve(AUTH_STATE_CONFIG.ROOT_DIRECTORY);
        SyncFileManager.ensureDirectoryExists(this.rootDir);
      }
      return this.rootDir;
    });
  }
}
