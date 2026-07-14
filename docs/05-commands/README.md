# Commands

**[← Back to Documentation](../README.md)**

What to type. The commands that run the suite and check the code, and every environment
variable the framework reads at runtime.

This section is the practical face of [03-core/execution/](../03-core/execution/README.md):
that section explains how a run is configured internally, this one explains how you drive it.

| Page                         | Covers                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [EXECUTION.md](EXECUTION.md) | The quality commands, the test commands, the execution templates, and every runtime flag with what it actually does. |

## Scope, Honestly

**None of these commands has been run end to end.** `tests/` is empty — there is no spec, and
no `.setup.ts` file for the `setup-auth-state` project to match. Every command listed is real
and every flag is genuinely read by the code, but the suite they would execute does not exist
yet.

There is no per-script reference page. `package.json` already lists every script, and a
hand-written copy of it would be wrong the first time someone edits one.
