import type { ViewportSize } from "@playwright/test";

// Shared viewport applied to all browser projects and the global use block.
export const resolvedViewport: ViewportSize = { width: 1366, height: 768 };

// Videos are recorded at 60% of the viewport to keep CI artifacts small. The size is
// derived from the viewport rather than written out, so the recording cannot end up
// letterboxed or squashed when the viewport changes.
const VIDEO_SCALE = 0.6;

export const resolvedVideoSize: ViewportSize = {
  width: Math.round(resolvedViewport.width * VIDEO_SCALE),
  height: Math.round(resolvedViewport.height * VIDEO_SCALE),
};
