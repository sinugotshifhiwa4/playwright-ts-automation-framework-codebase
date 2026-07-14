# Foundation

**[← Back to Core](../README.md)**

The bottom of the dependency graph. These three modules are what everything else in `src/` is
allowed to depend on, and they can afford to depend on almost nothing themselves.

Read them in this order — the third one composes the first two.

| Page                                   | Covers                                                                                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [LOGGING.md](LOGGING.md)               | The Winston singleton in `src/config/logger/`: one file per level, a console level per environment, and the second logger in `scripts/`.       |
| [SANITIZATION.md](SANITIZATION.md)     | `DataSanitizer` in `src/utils/sanitization/`: how secrets are masked before anything is written down, and what it deliberately does not catch. |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | `ErrorHandler` in `src/utils/error-handling/`: how a caught value becomes one structured, sanitized, deduplicated log entry.                   |

Logging and Sanitization import nothing from `src/` at all. Error handling is the first module
in the framework that composes anything — it is where the logger and the sanitizer, which know
nothing about each other, are finally put together.
