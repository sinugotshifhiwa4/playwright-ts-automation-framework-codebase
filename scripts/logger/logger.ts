/**
 * A console-only winston logger for the CLI scripts under `scripts/` — the test executor
 * and the Ortoni report commands. Import `logger` directly; it is a module-level singleton.
 *
 * This is deliberately NOT the framework's logger. `src/config/logger/` writes to files
 * under `logs/`, and pulling it in here would make a script that only prints "starting
 * Playwright" initialize the framework's singleton and create a log directory before the
 * run it is about to launch has even begun. These scripts import nothing from `src/`.
 */

import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  transports: [new winston.transports.Console()],
});
