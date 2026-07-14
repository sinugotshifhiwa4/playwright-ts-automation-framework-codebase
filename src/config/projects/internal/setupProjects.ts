import { devices, type Project } from "@playwright/test";
import { chromiumLaunchOptions } from "./chromiumLaunchOptions.js";
import { shouldSkipBrowserInit } from "../../flags/browser.flags.js";

// The browser projects depend on this project by name, so the two must agree.
export const SETUP_PROJECT_NAME = "setup-auth-state";

/**
 * No trace is recorded while the credentials are typed.
 *
 * This is the only project that ever handles a real username and password: every other
 * test reuses the storage state it produces. It is therefore the only project where a
 * trace can capture a secret — and a trace captures it completely.
 *
 * A trace cannot be sanitized. `locator.fill(value)` is recorded verbatim, twice: once in
 * the action's params and once in the call log, both inside the trace's core action
 * record. The DOM snapshots hold the input's value too, including on a `type="password"`
 * field. Playwright's trace options are `{ mode, snapshots, screenshots, sources,
 * attachments }` — there is no mask, so no configuration keeps the trace and hides the
 * value. DataSanitizer guards the framework's own logs and report step titles, which is a
 * different channel: the trace is written by Playwright, underneath it.
 *
 * Video and screenshots deliberately keep the global settings. The browser renders a
 * `type="password"` field as dots, so the password is not legible in either. The username
 * is — it is typed into a plain text input — and that residual exposure is accepted.
 *
 * The cost is real and deliberate: if the login itself breaks, it must be debugged
 * without a trace. Run it headed. That is a worse debugging experience for one spec, in
 * exchange for a password that never reaches an artifact a CI job might upload or archive.
 */
const NO_TRACE = { trace: "off" } as const;

// Conditionally include the auth setup project — skipped when browser init is disabled (e.g. API-only runs)
export const setupProjects: Project[] = shouldSkipBrowserInit()
  ? []
  : [
      {
        name: SETUP_PROJECT_NAME,
        use: {
          ...devices["Desktop Chrome"],
          launchOptions: chromiumLaunchOptions,
          ...NO_TRACE,
        },
        testMatch: /.*\.setup\.ts/,
      },
    ];
