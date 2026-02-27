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

- These are threads with the `updateMonitor` flag.
- Monitor updater threads are added to the end of `runtime.threads` before the start of every _frame_.
- Monitor updater threads exit immediately after being stepped once. If they were the only thread in `runtime.threads`, this means there are now 0 threads, immediately ending the frame and having the same effect as if graphics updated was `true`.

## Executable hat threads

- These are threads with the `executableHat` flag.
- Every _frame_, before the normal execution phase begins (therefore before the `BEFORE_EXECUTE` event is fired but after `RUNTIME_STEP_START`), all blocks of the `Scratch.BlockType.HAT` type with the `isEdgeActivated` flag will have their threads created and appended to the end of `runtime.threads`.[^2] These threads are executable hat threads.
- Immediately after these threads are created, they are stepped once (call this step their "predicate step"). `sequencer.activeThread` is `null` during this time, because the execution phase has not yet begun, however the `thread` global in the compiled context _is_ set and is the currently stepping executable hat thread.[^3]
- In a predicate step, the first thing that happens is its hat block evaluates its inputs and then its predicate. If its predicate is `true`, the step then continues as normal, and the body of the script steps. If the predicate is `false`, the thread completes with status 4 (completed) and ends the step.
- Keep in mind that both during and after the predicate step, the thread is still an executable hat thread, so `executableHat` will be `true` even while the thread is being stepped normally by the sequencer during the execution phase.

[^2]: https://github.com/PenguinMod/PenguinMod-Vm/blob/5510cff79cd043256dcb6dac0375f2261e56be09/src/engine/runtime.js#L3109
[^3]: https://github.com/PenguinMod/PenguinMod-Vm/blob/5510cff79cd043256dcb6dac0375f2261e56be09/src/engine/runtime.js#L2786
