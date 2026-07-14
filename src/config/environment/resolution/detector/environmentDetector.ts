import StagesFilePathResolver from "../../../../utils/path-resolver/envPathResolver.js";
import type { EnvironmentStage } from "../../constants/environment.const.js";

export default class EnvironmentDetector {
  /**
   * Determines whether the current execution environment is a CI/CD pipeline.
   * @returns True when the environment is a CI/CD pipeline.
   */
  public static isCI(): boolean {
    return Boolean(
      process.env.CI ??
      process.env.GITHUB_ACTIONS ??
      process.env.GITLAB_CI ??
      process.env.TRAVIS ??
      process.env.CIRCLECI ??
      process.env.JENKINS_URL ??
      process.env.BITBUCKET_BUILD_NUMBER,
    );
  }

  /**
   * Gets the current environment stage.
   * @returns The current environment stage.
   */
  public static getCurrentEnvironmentStage(): EnvironmentStage {
    const env = process.env.ENV ?? process.env.NODE_ENV ?? "dev";
    return StagesFilePathResolver.isValidStage(env) ? env : "dev";
  }

  /**
   * Determines whether the current environment is QA.
   * @returns True when the environment is QA.
   */
  public static isQA(): boolean {
    return this.getCurrentEnvironmentStage() === "qa";
  }

  /**
   * Determines whether the current environment is UAT.
   * @returns True when the environment is UAT.
   */
  public static isUAT(): boolean {
    return this.getCurrentEnvironmentStage() === "uat";
  }

  /**
   * Determines whether the current environment is pre-production.
   * @returns True when the environment is pre-production.
   */
  public static isPreprod(): boolean {
    return this.getCurrentEnvironmentStage() === "preprod";
  }
}
