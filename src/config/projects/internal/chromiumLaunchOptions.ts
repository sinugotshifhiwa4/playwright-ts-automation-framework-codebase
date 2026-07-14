import type { LaunchOptions } from "@playwright/test";

// Chromium-only launch flags. These are Chromium CLI switches and must NOT be
// applied globally — Firefox/WebKit reject unknown options and fail to launch.
export const chromiumLaunchOptions: LaunchOptions = {
  args: [
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-extensions",
    "--no-first-run",
    "--disable-default-apps",
    "--disable-translate",
    ...(process.env.CI ? ["--no-sandbox", "--disable-dev-shm-usage"] : []),
  ],
};
