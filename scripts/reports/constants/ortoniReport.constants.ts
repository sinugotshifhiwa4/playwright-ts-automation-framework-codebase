/**
 * ortoniReport.constants.ts
 * Shared configuration for the Ortoni report scripts (show / stop).
 */

/**
 * Candidate ports the report server tries in order. The first free one wins.
 * The stop script also targets this list when reclaiming ports.
 */
export const CANDIDATE_PORTS = [2004, 2006, 2008, 2009];

/** Directory the report server serves the generated report from. */
export const REPORT_DIR = "ortoni-report";

/** Entry HTML file served as the report root. */
export const REPORT_FILE = "index.html";

/** Host the report server binds to (loopback only). */
export const HOST = "127.0.0.1";
