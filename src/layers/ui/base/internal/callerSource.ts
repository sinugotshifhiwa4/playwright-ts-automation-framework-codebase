/**
 * Resolves the *caller* of an action — the page-object method that initiated it —
 * so that no action has to be told its own caller's name.
 *
 * The action layer previously threaded a hand-written `callerMethodName` string
 * through every method. Nothing checked that string against reality, so it drifted:
 * `verifyFileDownloaded` reported itself as `assertFileDownloaded`, a method that no
 * longer existed, and the error pointed at nothing. A name the compiler cannot check
 * is a name that will eventually lie.
 *
 * The stack cannot lie. It is read once, at the moment the action is invoked.
 */

/** Reported when the stack is unavailable or yields nothing usable. */
const UNKNOWN_SOURCE = "unknown";

/**
 * Path fragment identifying the action layer itself. Any frame inside it is
 * machinery, not a caller, and is skipped — which is what makes the first surviving
 * frame the page-object method that actually asked for the action.
 */
const ACTION_LAYER = "/base/internal/";

/** Matches the function name in a V8 stack frame: `at LoginPage.login (file:1:2)`. */
const FRAME_NAME = /^\s*at\s+(?:async\s+)?([^\s(]+)/;

/**
 * Resolves the name of the first caller outside the action layer.
 *
 * Windows stacks use backslashes, so paths are normalised before matching; otherwise
 * the layer check would silently never fire on Windows and every source would resolve
 * to the action's own name.
 * @returns The qualified caller name, such as `LoginPage.login`, or `unknown` when the stack yields nothing usable.
 */
export function resolveCallerSource(): string {
  const stack = new Error().stack;
  if (stack === undefined) return UNKNOWN_SOURCE;

  // Frame 0 is the `Error` line itself, not a call site.
  for (const frame of stack.split("\n").slice(1)) {
    const normalised = frame.replace(/\\/g, "/");

    if (normalised.includes(ACTION_LAYER)) continue;
    if (normalised.includes("node_modules")) continue;

    const name = FRAME_NAME.exec(normalised)?.[1];
    if (name !== undefined && name !== "") return name;
  }

  return UNKNOWN_SOURCE;
}

/**
 * Resolves the name of the method that is calling this function — itself, not its caller.
 *
 * The mirror image of {@link resolveCallerSource}, and the distinction is the whole
 * reason both exist. An *action* wants to know who asked for it, so it skips its own
 * layer. A *public method delegating to a private helper* wants its own name, because
 * the helper's name is the one thing a reader of the error log does not need.
 *
 * This replaces hand-written literals like `"loginWithValidCredentials"` — a string
 * that names the very method it sits inside, which nothing checks and which is wrong
 * the first time the method is renamed.
 * @returns The qualified name of the calling method, such as `LoginCoordinator.loginWithValidCredentials`, or `unknown` when the stack yields nothing usable.
 */
export function resolveCurrentMethod(): string {
  const stack = new Error().stack;
  if (stack === undefined) return UNKNOWN_SOURCE;

  // Line 0 is the `Error` header and line 1 is this function's own frame, so the
  // method that called it — the name we want — is line 2.
  const frame = stack.split("\n")[2];
  if (frame === undefined) return UNKNOWN_SOURCE;

  const name = FRAME_NAME.exec(frame.replace(/\\/g, "/"))?.[1];
  return name !== undefined && name !== "" ? name : UNKNOWN_SOURCE;
}
