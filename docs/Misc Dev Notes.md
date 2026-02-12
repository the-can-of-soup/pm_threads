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
| `true`                   | `true`     | `true`                | `false`                | `false`                        | `true`                   | `false` |

[^1]: Subject to change.

## Sequencer behavior with little to no threads

- If after a tick there are no threads in `runtime.threads`, the frame immediately ends and a redraw is triggered after the frame time is met.
- If before a frame there are no threads in `runtime.threads`, no ticks will occurr that frame; instead, the frame immediately ends and a redraw is triggered after the frame time is met.

## Monitor updater threads

- Monitor updater threads are added to the end of `runtime.threads` before the start of every _frame_.
- Monitor updater threads exit immediately after being stepped once. If they were the only thread in `runtime.threads`, this means there are now 0 threads, immediately ending the frame and having the same effect as if graphics updated was `true`.
