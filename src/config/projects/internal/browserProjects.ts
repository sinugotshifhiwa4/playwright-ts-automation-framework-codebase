import { devices, type Project } from "@playwright/test";
import { chromiumLaunchOptions } from "./chromiumLaunchOptions.js";
import { SETUP_PROJECT_NAME } from "./setupProjects.js";
import { resolvedViewport } from "./viewport.js";
import { shouldSkipBrowserInit } from "../../flags/browser.flags.js";

// Determine if browser initialization should be skipped (e.g., for API-only test runs)
const skipBrowserInit = shouldSkipBrowserInit();

// Nothing to wait for when the auth setup project is not part of the run.
const setupDependencies = skipBrowserInit ? [] : [SETUP_PROJECT_NAME];

// Browser projects are excluded when browser init is disabled (e.g. API-only runs)
export const browserProjects: Project[] = skipBrowserInit
  ? []
  : [
      {
        name: "chromium",
        use: {
          ...devices["Desktop Chrome"],
          viewport: resolvedViewport,
          launchOptions: chromiumLaunchOptions,
        },
        dependencies: setupDependencies,
      },
      {
        name: "firefox",
        use: { ...devices["Desktop Firefox"], viewport: resolvedViewport },
        dependencies: setupDependencies,
      },
      {
        name: "webkit",
        use: { ...devices["Desktop Safari"], viewport: resolvedViewport },
        dependencies: setupDependencies,
      },
    ];
