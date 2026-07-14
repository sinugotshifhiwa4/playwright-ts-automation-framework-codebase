/**
 * Public entry point for the Playwright project definitions.
 *
 * The pieces below live under internal/ because nothing outside this folder should
 * depend on how a project is assembled — only on the projects themselves.
 */
export { browserProjects } from "./internal/browserProjects.js";
export { setupProjects } from "./internal/setupProjects.js";
export { resolvedVideoSize, resolvedViewport } from "./internal/viewport.js";
