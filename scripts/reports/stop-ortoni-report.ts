/**
 * stop-ortoni-report.ts
 * Finds and stops any Ortoni report servers left running on the candidate ports.
 *
 * Report servers are foreground processes meant to be ended with Ctrl+C; closing
 * the terminal can leave them listening and holding a port. This reclaims them.
 */

import { execSync } from "child_process";
import { CANDIDATE_PORTS } from "./constants/ortoniReport.constants.js";
import { logger } from "../logger/logger.js";

const isWindows = process.platform === "win32";

/**
 * Returns the PIDs listening on the given TCP port.
 * @param port - Port to inspect.
 * @returns A list of owning process IDs (empty if none).
 */
function findListenerPids(port: number): number[] {
  try {
    if (isWindows) {
      // netstat columns: Proto  Local  Foreign  State  PID
      const output = execSync(`netstat -ano -p TCP`, { encoding: "utf8" });
      const pids = new Set<number>();
      for (const line of output.split(/\r?\n/)) {
        if (!/\bLISTENING\b/.test(line)) continue;
        if (!new RegExp(`[:.]${port}\\b`).test(line)) continue;
        const pid = Number(line.trim().split(/\s+/).pop());
        if (Number.isInteger(pid) && pid > 0) pids.add(pid);
      }
      return [...pids];
    }

    // macOS / Linux
    const output = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
      encoding: "utf8",
    });
    return output
      .split(/\r?\n/)
      .map((line) => Number(line.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  } catch {
    // No listener on the port (or the lookup command found nothing).
    return [];
  }
}

/**
 * Terminates a process by PID.
 * @param pid - Process ID to kill.
 */
function killPid(pid: number): void {
  if (isWindows) {
    execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
  } else {
    execSync(`kill -9 ${pid}`, { stdio: "ignore" });
  }
}

/**
 * Stops any Ortoni report servers listening on the candidate ports.
 */
function main(): void {
  let stopped = 0;

  for (const port of CANDIDATE_PORTS) {
    const pids = findListenerPids(port);
    for (const pid of pids) {
      try {
        killPid(pid);
        logger.info(`Stopped report server on port ${port} (PID ${pid}).`);
        stopped += 1;
      } catch {
        logger.warn(`Failed to stop PID ${pid} on port ${port}.`);
      }
    }
  }

  if (stopped === 0) {
    logger.info(`No report servers found on ports ${CANDIDATE_PORTS.join(", ")}.`);
  }
}

main();
