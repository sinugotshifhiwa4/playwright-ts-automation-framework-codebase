# Environment

**[← Back to Core](../README.md)**

`src/config/environment/` — how a value in a `.env` file, or a variable injected by a CI
pipeline, becomes something a test can read.

Three pages, because the module answers three separate questions. Read them in this order.

| Page                           | Answers                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [LOADING.md](LOADING.md)       | **How does a `.env` file become `process.env`?** The `envs/` folder, the stages, `globalSetup`, and why CI reads no file at all.                     |
| [RESOLUTION.md](RESOLUTION.md) | **Where does a value come from?** `EnvironmentDetector`, the CI-vs-local fork, the `CI_` prefix, and what `playwright.config.ts` is allowed to read. |
| [VARIABLES.md](VARIABLES.md)   | **How is it read safely?** `ENV_KEYS`, why every value is a lazy getter, and how `VariableValidator` rejects a missing variable by name.             |

The single most expensive thing to discover the hard way is in
[RESOLUTION.md](RESOLUTION.md#the-ci_-prefix): **in CI, the same value has a different variable
name.** `PORTAL_BASE_URL` locally is `CI_PORTAL_BASE_URL` in a pipeline.
