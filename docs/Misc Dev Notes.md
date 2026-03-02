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
- Monitor updater threads are added to the end of `runtime.threads` before the start of every _frame_ (immediately after executable hat threads).[^4]
- Monitor updater threads exit immediately after being stepped once. If they were the only thread in `runtime.threads`, this means there are now 0 threads, immediately ending the frame and having the same effect as if graphics updated was `true`.

[^4]: https://github.com/PenguinMod/PenguinMod-Vm/blob/5510cff79cd043256dcb6dac0375f2261e56be09/src/engine/runtime.js#L3118

## Execution phase

- Is defined here as everything that happens during [this call to `sequencer.stepThreads`](https://github.com/PenguinMod/PenguinMod-Vm/blob/6aae00994609a76f74f81036893e5511f0f2a9ed/src/engine/runtime.js#L3126C47-L3126C47).

## Executable hat threads & predicate steps

- These are threads with the `executableHat` flag.
- Every _frame_, before the normal execution phase begins (more precisely, before the `BEFORE_EXECUTE` event is fired but after `RUNTIME_STEP_START`), all blocks of the `Scratch.BlockType.HAT` type with the `isEdgeActivated` flag will have their threads created and appended to the end of `runtime.threads`.[^2] These threads are executable hat threads.
- Also, `Scratch.BlockType.HAT` blocks _without_ the `isEdgeActivated` flag will very likely (but controlled by the extension that added them) have their threads be created and appended every frame on the `BEFORE_EXECUTE` event. These threads are also executable hat threads.
- Immediately after these threads are created, they are stepped once (call this step their "predicate step"). `sequencer.activeThread` is `null` during this time, because the execution phase has not yet begun, however the `thread` global in the compiled context _is_ set and is the currently stepping executable hat thread.[^3]
- In a predicate step, the hat block evaluates its inputs and then its predicate. If its predicate is `true` (and it wasn't `true` on the last check if edge-activated), the thread yields, and on its next step, it will step the body (blocks below the hat). If the predicate is `false`, the thread completes with status 4 (completed) and ends the step.
- When the predicate step evaluates the hat's inputs, this will execute whatever blocks are in the inputs _(even though this is outside of the execution phase!)_. I have yet to determine what happens if an input block yields while being executed.
- Interestingly, edge-activated executable hat threads are created and therefore initially stepped _before `runtime.redrawRequested` (graphics updated) is set to `false`_; this means that the graphics updated value from the end of the previous frame should actually bleed into predicate steps of the current frame (although this has yet to be tested).[^2][^5]
- Keep in mind that both during and after the predicate step, the thread is still an executable hat thread, so `executableHat` will be `true` even while the thread is being stepped normally by the sequencer during the execution phase.

[^2]: https://github.com/PenguinMod/PenguinMod-Vm/blob/5510cff79cd043256dcb6dac0375f2261e56be09/src/engine/runtime.js#L3109
[^3]: https://github.com/PenguinMod/PenguinMod-Vm/blob/5510cff79cd043256dcb6dac0375f2261e56be09/src/engine/runtime.js#L2786
[^5]: https://github.com/PenguinMod/PenguinMod-Vm/blob/5510cff79cd043256dcb6dac0375f2261e56be09/src/engine/runtime.js#L3117
