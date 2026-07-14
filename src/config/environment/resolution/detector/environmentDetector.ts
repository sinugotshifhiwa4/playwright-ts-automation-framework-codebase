import ErrorHandler from "../../../../utils/error-handling/errorHandler.js";
import EnvPathResolver from "../../../../utils/path-resolver/envPathResolver.js";
import {
  ENVIRONMENT_STAGES,
  type EnvironmentStage,
} from "../../constants/environment.const.js";

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
   *
   * `ENV` is lower-cased before it is validated, so `ENV=QA` and `ENV=qa` name the same stage.
   * Case is a mistake a shell makes easy and the intent is never in doubt.
   *
   * An `ENV` that is set but names no known stage is a **typo**, and is rejected. Falling back
   * to a default would produce a run that quietly targets the wrong environment — which passes,
   * looks green, and proves nothing. `NODE_ENV` is treated leniently instead: it is set by
   * unrelated tooling (`development`, `test`), so it is used only when it happens to name a
   * stage and never causes a failure.
   * @returns The stage named by `ENV`, or `dev` when neither `ENV` nor `NODE_ENV` names one.
   * @throws Error if `ENV` is set to a value that is not one of the known stages.
   */
  public static getCurrentEnvironmentStage(): EnvironmentStage {
    const env = process.env.ENV?.trim().toLowerCase();

    if (env) {
      if (EnvPathResolver.isValidStage(env)) return env;

      return ErrorHandler.logAndThrow(
        "getCurrentEnvironmentStage",
        `Invalid ENV: "${process.env.ENV}". Valid stages are: ${ENVIRONMENT_STAGES.join(", ")}.`,
      );
    }

    const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
    return nodeEnv && EnvPathResolver.isValidStage(nodeEnv) ? nodeEnv : "dev";
  }

  /**
   * Determines whether the current environment is dev.
   * @returns True when the environment is dev.
   */
  public static isDev(): boolean {
    return this.getCurrentEnvironmentStage() === "dev";
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
