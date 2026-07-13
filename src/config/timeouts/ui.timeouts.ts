import { calculateTimeout } from "./internal/timeoutCalculator.js";

const IS_CI = !!process.env.CI;

const UI_DEFAULT_TIMEOUT_MS = calculateTimeout({
  baseMs: 50_000,
  isCI: IS_CI,
});

const UI_VALIDATION_TIMEOUT_MS = calculateTimeout({
  baseMs: 45_000,
  isCI: IS_CI,
});

/** Centralized timeout values for common UI waits and validations. */
export const UI_TIMEOUTS = {
  // Default wait for UI validations and slow page-state checks.
  default: UI_DEFAULT_TIMEOUT_MS,

  // Alias used when a timeout is specifically tied to UI validation behavior.
  validation: UI_VALIDATION_TIMEOUT_MS,

  // Short waits for quick DOM state changes like class and attribute updates.
  short: calculateTimeout({
    baseMs: 5_000,
    isCI: IS_CI,
  }),

  // Tiny settle delay for UI animations after an element becomes interactive.
  settle: calculateTimeout({
    baseMs: 300,
    isCI: IS_CI,
  }),

  // Popup and toast-style feedback messages that should appear quickly.
  notification: calculateTimeout({
    baseMs: 6_000,
    isCI: IS_CI,
  }),

  // Calendar dialogs need enough time to open and settle after interactions.
  calendar: calculateTimeout({
    baseMs: 10_000,
    isCI: IS_CI,
  }),

  // Toggle controls should settle quickly, but may need a moderate wait after interaction.
  toggle: calculateTimeout({
    baseMs: 20_000,
    isCI: IS_CI,
  }),

  // Table polling and first-row visibility checks need slightly longer waits.
  table: calculateTimeout({
    baseMs: 10_000,
    isCI: IS_CI,
  }),

  // Polling intervals should scale in CI without inflating assertion defaults.
  pollInterval: calculateTimeout({
    baseMs: 800,
    isCI: IS_CI,
  }),

  // Frame discovery can be slower than simple element checks.
  frame: calculateTimeout({
    baseMs: 30_000,
    isCI: IS_CI,
  }),
} as const;

export const {
  default: UI_DEFAULT_TIMEOUT,
  validation: UI_VALIDATION_TIMEOUT,
  short: UI_SHORT_TIMEOUT,
  settle: UI_SETTLE_TIMEOUT,
  notification: UI_NOTIFICATION_TIMEOUT,
  calendar: UI_CALENDAR_TIMEOUT,
  toggle: UI_TOGGLE_TIMEOUT,
  table: UI_TABLE_TIMEOUT,
  pollInterval: UI_POLL_INTERVAL_TIMEOUT,
  frame: UI_FRAME_TIMEOUT,
} = UI_TIMEOUTS;
