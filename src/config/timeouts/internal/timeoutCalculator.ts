import type { TimeoutCalculatorOptions } from "../types/timeoutCalculator.types.js";

/**
 * Computes an effective timeout value for the current runtime environment.
 *
 * In CI, the base timeout is multiplied to absorb slower execution.
 * @param options - The base timeout and the runtime conditions that scale it.
 * @returns The timeout in milliseconds, scaled by the multiplier when running in CI.
 */
export function calculateTimeout(options: TimeoutCalculatorOptions): number {
  const { baseMs, isCI = false, multiplier = 2 } = options;

  return isCI ? baseMs * multiplier : baseMs;
}
