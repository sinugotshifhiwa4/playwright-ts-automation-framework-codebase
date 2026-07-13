import { defineConfig } from "@playwright/test";
import {
  resolvedVideoSize,
  resolvedViewport,
  setupProjects,
  browserProjects,
} from "./src/config/projects/projects.config.js";
import { reportConfig } from "./src/config/reports/ortoniReport.config.js";
import EnvironmentDetector from "./src/config/resolution/detector/environmentDetector.js";
import WorkerAllocator from "./src/config/runtime/workers/workerAllocator.js";
import { GLOBAL_TIMEOUTS } from "./src/config/timeouts/global.timeouts.js";

// check if running in CI
const isCI = EnvironmentDetector.isCI();

// Determine if running in headed mode
const isHeaded = process.env.HEADED === "true";

// Determine the local worker allocation percentage
const workerPercentage = WorkerAllocator.resolveWorkerPercentage(
  process.env.WORKER_PERCENTAGE,
  10,
);

// Determine shard index for parallel execution in CI
const shardIndex = process.env.SHARD_INDEX ?? "0";

// Set by the CI merge job: regenerate the human-readable reports (HTML + Ortoni)
// from the combined blob reports instead of running tests.
const isReportMerge = process.env.REPORTER_MERGE === "true";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: GLOBAL_TIMEOUTS.test,
  expect: {
    timeout: GLOBAL_TIMEOUTS.expect,
  },
  globalSetup: "src/config/runtime/globalSetup.ts",
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: WorkerAllocator.getOptimalWorkerCount(workerPercentage),

  reporter: isReportMerge
    ? [["html"], ["junit"], ["json"], ["ortoni-report", reportConfig]]
    : isCI
      ? [["blob", { outputDir: `blob-report-${shardIndex}`, alwaysReport: true }]]
      : [["html"], ["line"], ["ortoni-report", reportConfig]],

  /**
   * The `grep` option enables running tests by tag or keyword.
   * You can set the `TEST_TAGS` environment variable (e.g., `@regression`, `@sanity`) to filter which tests run.
   */
  grep:
    typeof process.env.TEST_TAGS === "string"
      ? new RegExp(`(^|\\s)${process.env.TEST_TAGS}(\\s|$)`)
      : (process.env.TEST_TAGS ?? /.*/),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    trace: "retain-on-failure",
    video: isCI ? { mode: "on-first-retry", size: resolvedVideoSize } : "on",
    screenshot: isCI ? "only-on-failure" : "on",
    headless: !isHeaded,
    viewport: resolvedViewport,
  },

  /* Configure projects for major browsers */
  projects: [
    ...setupProjects,
    {
      name: "api",
      testMatch: /tests\/layers\/api\/.*/,
    },
    {
      name: "db",
      testMatch: /tests\/layers\/db\/.*/,
    },
    ...browserProjects,
  ],
});
