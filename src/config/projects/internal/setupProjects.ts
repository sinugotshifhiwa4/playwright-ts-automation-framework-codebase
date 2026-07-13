import { devices, type Project } from "@playwright/test";
import { chromiumLaunchOptions } from "./chromiumLaunchOptions.js";
import { shouldSkipBrowserInit } from "../../flags/browser.flags.js";

// The browser projects depend on this project by name, so the two must agree.
export const SETUP_PROJECT_NAME = "setup-auth-state";

// Conditionally include the auth setup project — skipped when browser init is disabled (e.g. API-only runs)
export const setupProjects: Project[] = shouldSkipBrowserInit()
  ? []
  : [
      {
        name: SETUP_PROJECT_NAME,
        use: {
          ...devices["Desktop Chrome"],
          launchOptions: chromiumLaunchOptions,
        },
        testMatch: /.*\.setup\.ts/,
      },
    ];
