/** Configuration options used to derive runtime timeout values. */
export interface TimeoutCalculatorOptions {
  baseMs: number;
  isCI?: boolean;
  multiplier?: number;
}
