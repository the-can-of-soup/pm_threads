# Threads Miscellaneous Dev Notes

[← Back to Documentation](https://github.com/the-can-of-soup/pm_threads/blob/main/docs/Documentation.md)

## Thread state table

| Status is `STATUS_DONE`? | `isKilled` | In `runtime.threads`? | `<[THREAD] is alive?>` | `<[THREAD] exited naturally?>` | `<[THREAD] was killed?>` | Limbo?  |
|--------------------------|------------|-----------------------|------------------------|--------------------------------|--------------------------|---------|
| `false`                  | `false`    | `false`               | `false`                | `false`                        | `true`                   | `true`  |
| `false`                  | `false`    | `true`                | `true`                 | `false`                        | `false`                  | `false` |
| `false`                  | `true`     | `false`               | `false`                | `false`                        | `true`                   | `true`  |
| `false`                  | `true`     | `true`                | `true`[^1]             | `false`                        | `false`[^1]              | `false` |
| `true`                   | `false`    | `false`               | `false`                | `true`                         | `false`                  | `false` |
| `true`                   | `false`    | `true`                | `false`                | `true`                         | `false`                  | `false` |
| `true`                   | `true`     | `false`               | `false`                | `false`                        | `true`                   | `false` |
| `true`                   | `true`     | `true`                | `false`                | `true`[^1]                     | `false`[^1]              | `false` |

[^1]: Subject to change.
