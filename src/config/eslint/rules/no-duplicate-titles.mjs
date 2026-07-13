/**
 * Disallow two tests, or two describe blocks, sharing a title within the same scope.
 *
 * Why this is a lint rule and not a grep in a Git hook: duplicate titles are an
 * *AST* property, not a text property. A regex cannot tell a real `test("login")`
 * from one inside a comment, a string, or a commented-out block, and it cannot
 * know which describe block a test belongs to — so `tests/Cart.spec.ts` and
 * `tests/Auth.spec.ts` both having a "renders" test inside *different* describes
 * would be a false positive. Working on the syntax tree makes both problems
 * disappear, and as a bonus the violation is underlined in VS Code as you type
 * rather than surfacing minutes later at commit time.
 *
 * Duplicate titles matter because Playwright's HTML report, its `--grep` filter,
 * and every CI dashboard key off the title. Two tests called "checkout works"
 * are indistinguishable in a failure report.
 */

/** Identifiers that introduce a Playwright test. */
const TEST_CALLERS = new Set(["test", "it"]);

/** Chained modifiers that do not change what the call *is*: test.only("x", fn). */
const MODIFIERS = new Set([
  "only",
  "skip",
  "fixme",
  "fail",
  "slow",
  "serial",
  "parallel",
]);

/**
 * Classify a call expression as a test, a describe, or neither.
 * Walks the member chain so `test.describe.serial.only(...)` still resolves.
 */
function classify(node) {
  const { callee } = node;

  if (callee.type === "Identifier") {
    return TEST_CALLERS.has(callee.name) ? "test" : null;
  }
  if (callee.type !== "MemberExpression") return null;

  const chain = [];
  let current = callee;
  while (current.type === "MemberExpression") {
    if (current.property.type !== "Identifier") return null;
    chain.unshift(current.property.name);
    current = current.object;
  }
  if (current.type !== "Identifier" || !TEST_CALLERS.has(current.name)) return null;

  // test.describe.configure({...}) has no title, and getTitle() will drop it.
  if (chain.includes("describe")) return "describe";
  if (chain.every((part) => MODIFIERS.has(part))) return "test";
  return null;
}

/** The literal title, or null when it is dynamic (a variable, an interpolation). */
function getTitle(node) {
  const [first] = node.arguments;
  if (!first) return null;

  if (first.type === "Literal" && typeof first.value === "string") {
    return first.value;
  }
  // Template literals are only comparable when nothing is interpolated.
  if (first.type === "TemplateLiteral" && first.expressions.length === 0) {
    return first.quasis.map((quasi) => quasi.value.cooked).join("");
  }
  return null;
}

/** The callback a describe block wraps, so we know which scope to open. */
function getBody(node) {
  return node.arguments.find(
    (arg) => arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression",
  );
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow duplicate test or describe titles within the same describe scope.",
    },
    schema: [],
    messages: {
      duplicate:
        'Duplicate {{kind}} title "{{title}}" (already used on line {{line}}). ' +
        "Reports and --grep filters key off the title, so it must be unique.",
    },
  },

  create(context) {
    // One frame per describe scope. Sibling describes get independent frames, so
    // the same test title may legitimately appear under two different describes.
    const scopes = [{ test: new Map(), describe: new Map() }];
    // The callback nodes that opened a scope, so :exit knows when to pop.
    const openedBy = [];

    const currentScope = () => scopes[scopes.length - 1];

    function closeScope(node) {
      if (openedBy[openedBy.length - 1] === node) {
        openedBy.pop();
        scopes.pop();
      }
    }

    return {
      CallExpression(node) {
        const kind = classify(node);
        if (!kind) return;

        const title = getTitle(node);

        // Register the title in the *enclosing* scope before opening a new one:
        // two sibling describes named "checkout" collide, a describe and the
        // tests inside it never do.
        //
        // A null title means the title is absent or dynamic — an anonymous
        // `test.describe(() => {...})`, or a template literal with an
        // interpolation. There is nothing to compare, so nothing is registered.
        // Crucially we must NOT return here: an anonymous describe is still a
        // scope, and skipping the push below would spill its tests into the
        // parent scope and report two unrelated describes as colliding.
        if (title !== null) {
          const seen = currentScope()[kind];
          const firstSeenOn = seen.get(title);

          if (firstSeenOn !== undefined) {
            context.report({
              node: node.arguments[0],
              messageId: "duplicate",
              data: { kind, title, line: firstSeenOn },
            });
          } else {
            seen.set(title, node.arguments[0].loc.start.line);
          }
        }

        if (kind === "describe") {
          const body = getBody(node);
          if (body) {
            scopes.push({ test: new Map(), describe: new Map() });
            openedBy.push(body);
          }
        }
      },

      "ArrowFunctionExpression:exit": closeScope,
      "FunctionExpression:exit": closeScope,
    };
  },
};
