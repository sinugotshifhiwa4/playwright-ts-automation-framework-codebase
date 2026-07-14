# Utilities

**[← Back to Core](../README.md)**

The helpers that sit on top of [foundation/](../foundation/README.md) and beneath everything
else: file access, path construction, and a handful of small shared functions.

| Page                                   | Covers                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [FILE_MANAGERS.md](FILE_MANAGERS.md)   | `src/utils/file-manager/`: the path guards, the sync and async twins, and why a missing file returns `false` while a failed write throws. |
| [PATH_RESOLVERS.md](PATH_RESOLVERS.md) | `src/utils/path-resolver/`: where the `.env` file and the auth state live, and why a path must be computed in exactly one place.          |
| [SHARED_UTILS.md](SHARED_UTILS.md)     | `src/utils/shared/`: the two helpers that are wired in, and the parsing suite and placeholder guard that are built but not yet called.    |

Every file the framework reads or writes goes through the file managers, and every path it
writes to is built by a resolver. Neither is `fs` and neither is `path` — the wrappers add the
guards, the logging, and the error capture that no caller then has to repeat.
