import { calculateTimeout } from "./internal/timeoutCalculator.js";

// Indicates whether the current process is running in CI.
const IS_CI = !!process.env.CI;

/** Centralized Playwright timeout values adjusted for local and CI execution. */
export const GLOBAL_TIMEOUTS = {
  // Maximum duration allowed for a single test run.
  test: calculateTimeout({
    baseMs: 165_000,
    isCI: IS_CI,
  }),

  // Maximum time Playwright assertions can keep retrying.
  expect: calculateTimeout({
    baseMs: 50_000,
    isCI: IS_CI,
  }),
} as const;

export const { test: TEST_TIMEOUT, expect: EXPECT_TIMEOUT } = GLOBAL_TIMEOUTS;
