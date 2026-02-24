# Threads Reference

[← Back to Documentation](https://github.com/the-can-of-soup/pm_threads/blob/main/docs/Documentation.md)

### Table of Contents
- [\(top of page\)](#threads-reference)
    - [Table of Contents](#table-of-contents)
- [Blocks](#blocks)
  - [Thread Getters](#thread-getters)
    - [`(active thread)` -> Thread](#active-thread---thread)
    - [`(active index)` -> Number](#active-index---number)
    - [`(null thread)` -> Thread](#null-thread---thread)
    - [`(thread at (INDEX v))` -> Thread](#thread-at-index-v---thread)
  - [Thread Builders](#thread-builders)
    - [`new thread in (TARGET v) inserted (INDEX v) {SUBSTACK}` -> Undefined](#new-thread-in-target-v-inserted-index-v-substack---undefined)
    - [`(new thread in (TARGET v) inserted (INDEX v) {SUBSTACK})` -> Thread](#new-thread-in-target-v-inserted-index-v-substack---thread)
  - [Thread Properties](#thread-properties)
    - [`(target of [THREAD])` -> Target](#target-of-thread---target)
    - [`(id of [THREAD])` -> String](#id-of-thread---string)
    - [`(status [STATUSFORMAT v] of [THREAD])` -> Number | String](#status-statusformat-v-of-thread---number--string)
    - [`(index of [THREAD])` -> Number](#index-of-thread---number)
  - [Boolean Thread Operators](#boolean-thread-operators)
    - [`<[VALUE] is a thread?>` -> Boolean](#value-is-a-thread---boolean)
    - [`<[THREADONE] is [THREADTWO]>` -> Boolean](#threadone-is-threadtwo---boolean)
    - [`<[THREAD] is null?>` -> Boolean](#thread-is-null---boolean)
    - [`<[THREAD] is alive?>` -> Boolean](#thread-is-alive---boolean)
    - [`<[THREAD] exited naturally?>` -> Boolean](#thread-exited-naturally---boolean)
    - [`<[THREAD] was killed?>` -> Boolean](#thread-was-killed---boolean)
    - [`<[THREAD] was paused manually?>` -> Boolean](#thread-was-paused-manually---boolean)
    - [`<[THREAD] is in limbo?>` -> Boolean](#thread-is-in-limbo---boolean)
    - [`<[THREAD] was started by clicking in the editor?>` -> Boolean](#thread-was-started-by-clicking-in-the-editor---boolean)
    - [`<[THREAD] is a monitor updater?>` -> Boolean](#thread-is-a-monitor-updater---boolean)
  - [Thread Actions](#thread-actions)
    - [`kill [THREAD]` -> Undefined](#kill-thread---undefined)
    - [`pause [THREAD]` -> Undefined](#pause-thread---undefined)
    - [`resume [THREAD]` -> Undefined](#resume-thread---undefined)
  - [Yielding](#yielding)
    - [`yield` -> Undefined](#yield---undefined)
    - [`yield [TIMES] times` -> Undefined](#yield-times-times---undefined)
    - [`yield to previous thread` -> Undefined](#yield-to-previous-thread---undefined)
    - [`yield to [ACTIVETHREAD]` -> Undefined](#yield-to-activethread---undefined)
    - [`yield to thread at (INDEX v)` -> Undefined](#yield-to-thread-at-index-v---undefined)
    - [`yield to end of tick` -> Undefined](#yield-to-end-of-tick---undefined)
  - [Broadcasts](#broadcasts)
    - [`broadcast [MESSAGE v] to (INDEX v)` -> Undefined](#broadcast-message-v-to-index-v---undefined)
    - [`broadcast [MESSAGE v] to (INDEX v) and wait` -> Undefined](#broadcast-message-v-to-index-v-and-wait---undefined)
    - [`step [MESSAGE v] immediately and return` -> Undefined](#step-message-v-immediately-and-return---undefined)
    - [`(last broadcast threads)` -> Array\[Thread\]](#last-broadcast-threads---arraythread)
    - [`(first thread from last broadcast)` -> Thread](#first-thread-from-last-broadcast---thread)
  - [Threads Array](#threads-array)
    - [`(threads)` -> Array\[Thread\]](#threads---arraythread)
    - [`(threads in (TARGET v))` -> Array\[Thread\]](#threads-in-target-v---arraythread)
    - [`set threads to [THREADS] and yield to [ACTIVETHREAD]` -> Undefined](#set-threads-to-threads-and-yield-to-activethread---undefined)
    - [`set threads to [THREADS] and yield to thread at (ACTIVEINDEX v)` -> Undefined](#set-threads-to-threads-and-yield-to-thread-at-activeindex-v---undefined)
    - [`move [THREAD] to (INDEX v)` -> Undefined](#move-thread-to-index-v---undefined)
    - [`swap [THREADONE] with [THREADTWO]` -> Undefined](#swap-threadone-with-threadtwo---undefined)
  - [Atomic Loops](#atomic-loops)
    - [`repeat [TIMES] without yielding {SUBSTACK}` -> Undefined](#repeat-times-without-yielding-substack---undefined)
    - [`repeat until [CONDITION] without yielding {SUBSTACK}` -> Undefined](#repeat-until-condition-without-yielding-substack---undefined)
    - [`while [CONDITION] without yielding {SUBSTACK}` -> Undefined](#while-condition-without-yielding-substack---undefined)
    - [`forever without yielding {SUBSTACK}` -> Undefined](#forever-without-yielding-substack---undefined)
  - [Thread Variables](#thread-variables)
    - [`(get [VARIABLE] in [THREAD])` -> Any](#get-variable-in-thread---any)
    - [`set [VARIABLE] in [THREAD] to [VALUE]` -> Undefined](#set-variable-in-thread-to-value---undefined)
    - [`(variables in [THREAD])` -> Array\[String\]](#variables-in-thread---arraystring)
    - [`delete [VARIABLE] in [THREAD]` -> Undefined](#delete-variable-in-thread---undefined)
  - Events
    - **TODO:** `immediately after [THREAD] dies` -> Undefined
  - [Counters](#counters)
    - [`(tick # from init)` -> Number](#tick--from-init---number)
    - [`(frame # from init)` -> Number](#frame--from-init---number)
    - [`(tick # from @blueFlag)` -> Number](#tick--from-blueflag---number)
    - [`(frame # from @blueFlag)` -> Number](#frame--from-blueflag---number)
    - [`(tick # this frame)` -> Number](#tick--this-frame---number)
  - [Warp Mode](#warp-mode)
    - [`<warp mode>` -> Boolean](#warp-mode---boolean)
    - [`[SETBOOLEAN v] warp mode for {SUBSTACK}` -> Undefined](#setboolean-v-warp-mode-for-substack---undefined)
  - [Graphics Updated](#graphics-updated)
    - [`<graphics updated>` -> Boolean](#graphics-updated---boolean)
    - [`set graphics updated to <VALUE>` -> Undefined](#set-graphics-updated-to-value---undefined)
  - [Timers](#timers)
    - [`(target frame time)` -> Number](#target-frame-time---number)
    - [`(last measured frame time)` -> Number](#last-measured-frame-time---number)
    - [`(target work time)` -> Number](#target-work-time---number)
    - [`(last measured work time)` -> Number](#last-measured-work-time---number)
    - [`(work timer)` -> Number](#work-timer---number)
    - [`set work timer to [TIME]` -> Undefined](#set-work-timer-to-time---undefined)
- [Menus](#menus)
    - [Get Index](#get-index)
    - [Insert Index](#insert-index)
    - [Target](#target)
    - [Status Format](#status-format)
    - [Set Boolean](#set-boolean)



# Blocks



## Thread Getters

### `(active thread)` -> Thread
<img src="../assets/blocks/active_thread.png">

Returns the currently active thread.

This is always the thread that contains the block, because it is impossible to run this block without it being in the active thread.

<details>
  <summary>Internal behavior</summary>
  
  Reads `sequencer.activeThread`.
</details>

### `(active index)` -> Number
<img src="../assets/blocks/active_index.png">

Returns the index of the currently active thread.

<details>
  <summary>Internal behavior</summary>
  
  Reads `sequencer.activeThreadIndex` _([I added that!](https://github.com/PenguinMod/PenguinMod-Vm/pull/173) :D)_.
</details>

### `(null thread)` -> Thread
<img src="../assets/blocks/null_thread.png">

Returns the null thread.

This represents a thread that failed to load or doesn't exist. It has an ID of `undefined`. This thread is also used when the wrong type is inserted into a thread input.

### `(thread at (INDEX v))` -> Thread
_Menus: `INDEX` uses [Get Index](#get-index)_

<img src="../assets/blocks/thread_at_start.png">

Returns the thread that is at `INDEX` in the [threads array](#threads---arraythread).

<details>
  <summary>Internal behavior</summary>
  
  Reads from the `runtime.threads` array.
</details>



## Thread Builders

### `new thread in (TARGET v) inserted (INDEX v) {SUBSTACK}` -> Undefined
_Menus: `TARGET` uses [Target](#target), `INDEX` uses [Insert Index](#insert-index)_

<img src="../assets/blocks/new_thread_in_this_target_inserted_after_end.png">

Creates a new thread that will execute in `TARGET`; then, inserts it into the [threads array](#threads---arraythread) at `INDEX`.

> [!NOTE]
>
> Local ("For this sprite only") variables have noteworthy behavior when used inside `SUBSTACK` where `TARGET` is not the current target:
> - If it exists, the variable with the same name in `TARGET` is used.
> - If no variable with the same name exists in `TARGET`, **a new local variable will be created** in `TARGET` with the name, but this variable will have the same ID as the variable in the original sprite. This can cause odd behavior and/or bugs with variable monitors due to ID conflict.

<details>
  <summary>Internal behavior</summary>
  
  Uses `runtime._pushThread` to create a new thread at the end of the [threads array](#threads---arraythread) containing the contents of `SUBSTACK`. Next, moves it to `INDEX`. Finally, updates `sequencer.activeThreadIndex` if the active thread was moved.

  The new thread is created by passing the ID of the first block in `SUBSTACK` to `runtime._pushThread`, rather than by starting some precompiled chunk. This means that **`SUBSTACK` is not compiled until the "new thread" block is run**.
</details>

### `(new thread in (TARGET v) inserted (INDEX v) {SUBSTACK})` -> Thread
_Menus: `TARGET` uses [Target](#target), `INDEX` uses [Insert Index](#insert-index)_

<img src="../assets/blocks/new_thread_in_this_target_inserted_after_end_2.png">

Same as [`new thread in (TARGET v) inserted (INDEX v) {SUBSTACK}`](#new-thread-in-target-v-inserted-index-v-substack---undefined), except returns the thread that was created (or null).

Will return the null thread if there are no blocks in `SUBSTACK` or if `TARGET` is invalid.



## Thread Properties

### `(target of [THREAD])` -> Target
<img src="../assets/blocks/target_of.png">

Returns the target that is running / ran `THREAD`.

<details>
  <summary>Internal behavior</summary>
  
  Reads the `target` key from the raw thread object.
</details>

### `(id of [THREAD])` -> String
<img src="../assets/blocks/id_of.png">

Returns a unique identifier for `THREAD`. This ID is generated by the extension and is not used in the PenguinMod engine.

<details>
  <summary>Internal behavior</summary>
  
  Reads the custom `soupThreadId` key from the raw thread object.
</details>

### `(status [STATUSFORMAT v] of [THREAD])` -> Number | String
_Menus: `STATUSFORMAT` uses [Status Format](#status-format)_

<img src="../assets/blocks/status_%23_of.png">

Returns the current status code of `THREAD`, the status code in text format if `STATUSFORMAT` is "text", or the internal name of the status code if `STATUSFORMAT` is "internal name". These are the possible values:

| Status # | Status text          | Internal name         | Description                                                                                                                    |
|----------|----------------------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------|
| 0        | Running              | `STATUS_RUNNING`      | The default status of a thread.[^1]                                                                                            |
| 1        | Waiting for promise  | `STATUS_PROMISE_WAIT` | Behavior unknown                                                                                                               |
| 2        | Yielded              | `STATUS_YIELD`        | Behavior unknown                                                                                                               |
| 3        | Yielded for one tick | `STATUS_YIELD_TICK`   | Behavior unknown                                                                                                               |
| 4        | Completed            | `STATUS_DONE`         | The thread is "dead", i.e. it will never run code again.[^1]                                                                   |
| 5        | Paused               | `STATUS_PAUSED`       | The thread is paused either from the [`pause [THREAD]`](#pause-thread---undefined) block, the pause button, or another source. |

<details>
  <summary>Internal behavior</summary>
  
  Reads the `status` key from the raw thread object.
</details>

### `(index of [THREAD])` -> Number
<img src="../assets/blocks/index_of.png">

Returns the index of `THREAD` in the [list of threads](#threads---arraythread).

<details>
  <summary>Internal behavior</summary>
  
  Finds the index of the thread in the `runtime.threads` array.
</details>



## Boolean Thread Operators

### `<[VALUE] is a thread?>` -> Boolean
<img src="../assets/blocks/is_a_thread.png">

Returns `true` if `VALUE` is a thread, otherwise returns `false`.

### `<[THREADONE] is [THREADTWO]>` -> Boolean
<img src="../assets/blocks/is.png">

Returns `true` if the IDs of the threads match, otherwise returns `false`.

Note that the `<[] = []>` block in Operators is not meant for this, as that block compares the stringified value.

<details>
  <summary>Internal behavior</summary>
  
  Uses the `soupThreadId` key of the raw thread objects to compare the threads.
</details>

### `<[THREAD] is null?>` -> Boolean
<img src="../assets/blocks/is_null.png">

Returns `true` if `THREAD` is the null thread.

### `<[THREAD] is alive?>` -> Boolean
<img src="../assets/blocks/is_alive.png">

Returns `true` if `THREAD` is alive, i.e. it is not finished.

<details>
  <summary>Internal behavior</summary>
  
  Returns `true` if the raw thread is in the `runtime.threads` array and its status is not [4 (completed)](#status-statusformat-v-of-thread---number--string).
</details>

### `<[THREAD] exited naturally?>` -> Boolean
<img src="../assets/blocks/exited_naturally.png">

Returns `true` if `THREAD` is dead, but was not killed, i.e. it exited of its own accord.[^2]

<details>
  <summary>Internal behavior</summary>
  
  Returns `true` if either:
  - All of:
    - The raw thread is not in the `runtime.threads` array (therefore it is dead).
    - The raw thread's `isKilled` key is `false`.
    - The thread's status is [4 (completed)](#status-statusformat-v-of-thread---number--string). This catches limbo[^1] cases in which killed threads have `isKilled` set to `false` and `status` unchanged.
  - All of:
    - The raw thread is in the `runtime.threads` array (therefore it died this tick if its status is [4](#status-statusformat-v-of-thread---number--string)).
    - The thread's status is [4 (completed)](#status-statusformat-v-of-thread---number--string).
    - The raw thread's `isKilled` key is `false`.
</details>

### `<[THREAD] was killed?>` -> Boolean
<img src="../assets/blocks/was_killed.png">

Returns `true` if `THREAD` exited due to an external cause.[^2]

<details>
  <summary>Internal behavior</summary>
  
  Returns `true` if either:
  - All of:
    - The raw thread is not in the `runtime.threads` array (therefore it is dead).
    - Either:
      - The raw thread's `isKilled` key is `true`.
      - The raw thead's `status` key is not 4 (completed). This catches limbo[^1] cases in which killed threads have `isKilled` set to `false` and `status` unchanged.
  - All of:
    - The raw thread is in the `runtime.threads` array (therefore it died this tick if its status is [4](#status-statusformat-v-of-thread---number--string)).
    - The thread's status is [4 (completed)](#status-statusformat-v-of-thread---number--string).
    - The raw thread's `isKilled` key is `true`.
</details>

### `<[THREAD] was paused manually?>` -> Boolean
<img src="../assets/blocks/was_paused_manually.png">

Returns `true` if `THREAD` was paused by the [`pause [THREAD]`](#pause-thread---undefined) block.

<details>
  <summary>Internal behavior</summary>
  
  Returns the custom `soupThreadsPaused` key from the raw thread object (or `false` if it is not present).
</details>

### `<[THREAD] is in limbo?>` -> Boolean
<img src="../assets/blocks/is_in_limbo.png">

Returns `true` if `THREAD` is in limbo.

In many cases when a thread is stopped, it will enter limbo. Limbo is when a dead thread's [status](#status-statusformat-v-of-thread---number--string) does not get set to 4 (completed). Some known cases where a thread enters limbo:
  - When <img alt="blue flag" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/flag.svg"> is clicked, all previously running threads will enter limbo.
  - When <img alt="stop sign" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/stop.svg"> is clicked, all previously running threads will enter limbo.
  - When a stack restarts because its hat is triggered again, the old thread enters limbo.
  - When [`set threads to [THREADS] and yield to [ACTIVETHREAD]`](#set-threads-to-threads-and-yield-to-activethread---undefined) or [`set threads to [THREADS] and yield to thread at (ACTIVEINDEX v)`](#set-threads-to-threads-and-yield-to-thread-at-activeindex-v---undefined) is used to kill a thread, that thread enters limbo.

<details>
  <summary>Internal behavior</summary>
  
  Returns `true` if all of:
  - The raw thread is not in the `runtime.threads` array (therefore it is dead).
  - The thread's status is not [4 (completed)](#status-statusformat-v-of-thread---number--string).
</details>

### `<[THREAD] was started by clicking in the editor?>` -> Boolean
<img src="../assets/blocks/was_started_by_clicking_in_the_editor.png">

Returns `true` if `THREAD` was started by manually clicking a stack in the code editor.

<details>
  <summary>Internal behavior</summary>
  
  Returns the `stackClick` key from the raw thread object.
</details>

### `<[THREAD] is a monitor updater?>` -> Boolean
<img src="../assets/blocks/is_a_monitor_updater.png">

Returns `true` if `THREAD` was started by the engine to check the value of a reporter for a monitor.

<details>
  <summary>Internal behavior</summary>
  
  Returns the `updateMonitor` key from the raw thread object.
</details>



## Thread Actions

### `kill [THREAD]` -> Undefined
<img src="../assets/blocks/kill.png">

Kills `THREAD`, and then yields if `THREAD` was the active thread.

<details>
  <summary>Internal behavior</summary>
  
  Calls `runtime._stopThread` on the raw thread of `THREAD`.
</details>

### `pause [THREAD]` -> Undefined
<img src="../assets/blocks/pause.png">

Pauses `THREAD`, and then yields if `THREAD` was the active thread.

### `resume [THREAD]` -> Undefined
<img src="../assets/blocks/resume.png">

Unpauses `THREAD`.



## Yielding

### `yield` -> Undefined
<img src="../assets/blocks/yield.png">

Yields.

### `yield [TIMES] times` -> Undefined
<img src="../assets/blocks/yield_30_times.png">

Yields `TIMES` times.

### `yield to previous thread` -> Undefined
<img src="../assets/blocks/yield_to_previous_thread.png">

Yields and makes the previous thread active. If there is no previous thread (the first thread is active), yields and makes the active thread active (effectively cancelling the yield in most cases).

<details>
  <summary>Internal behavior</summary>
  
  Decrements `sequencer.activeThreadIndex` twice before yielding (or once if the first thread is active). The extra decrement is because this value is always incremented by the engine after every yield.
</details>

### `yield to [ACTIVETHREAD]` -> Undefined
<img src="../assets/blocks/yield_to.png">

Yields and makes `ACTIVETHREAD` active.

If `ACTIVETHREAD` is null or not in the [threads array](#threads---arraythread), instead yields to the [end of the tick](#yield-to-end-of-tick---undefined).

<details>
  <summary>Internal behavior</summary>
  
  If `ACTIVETHREAD` is valid, sets `sequencer.activeThreadIndex` to 1 less than the desired index before yielding. The decrement is because this value is always incremented by the engine after every yield. Otherwise, executes the behavior of [`yield to end of tick`](#yield-to-end-of-tick---undefined).
</details>

### `yield to thread at (INDEX v)` -> Undefined
_Menus: `INDEX` uses [Get Index](#get-index)_

<img src="../assets/blocks/yield_to_thread_at_start.png">

Yields and makes the thread at `INDEX` active.

If `INDEX` is larger than the normally accepted range, will immediately end the tick. If `INDEX` is too small, will yield to the first thread.

<details>
  <summary>Internal behavior</summary>
  
  Sets `sequencer.activeThreadIndex` to 1 less than the desired index before yielding. The decrement is because this value is always incremented by the engine after every yield.
</details>

### `yield to end of tick` -> Undefined
<img src="../assets/blocks/yield_to_end_of_tick.png">

Yields and immediately ends the tick, skipping all threads that would normally step after this one.

<details>
  <summary>Internal behavior</summary>
  
  Sets `sequencer.activeThreadIndex` to 1 less than the length of `runtime.threads` before yielding. The engine increments the active thread index after every yield, so then it is left at the length of `runtime.threads`, causing the loop in the sequencer to exit, completing the tick.
</details>



## Broadcasts

### `broadcast [MESSAGE v] to (INDEX v)` -> Undefined
_Menus: `INDEX` uses [Insert Index](#insert-index)_

<img src="../assets/blocks/broadcast_message1_to_after_end.png">

Broadcasts `MESSAGE` and then moves all new threads that were created to `INDEX`.

Any preexisting threads with a `when I receive [MESSAGE v]` hat block will be restarted and moved to `INDEX` as well.

### `broadcast [MESSAGE v] to (INDEX v) and wait` -> Undefined
_Menus: `INDEX` uses [Insert Index](#insert-index)_

<img src="../assets/blocks/broadcast_message1_to_after_end_and_wait.png">

Executes the behavior of [`broadcast [MESSAGE v] to (INDEX v)`](#broadcast-message-v-to-index-v---undefined), and then yields until all threads that were created are not [alive](#thread-is-alive---boolean).

### `step [MESSAGE v] immediately and return` -> Undefined
<img src="../assets/blocks/step_message1_immediately_and_return.png">

Broadcasts `MESSAGE`, moves all new threads to immediately before the active thread, yields, and makes the first new thread active.

Any preexisting threads with a `when I receive [MESSAGE v]` hat block will be restarted and moved to before the active thread as well.

This has the effect of immediately stepping all new threads once after broadcast, and then stepping the active thread again (as if no yield happened).

### `(last broadcast threads)` -> Array\[Thread\]
<img src="../assets/blocks/last_broadcast_threads.png">

Returns an array of all threads that were started by the most recent broadcast (or an empty array if no broadcasts have happened yet). Broadcasts from any target using any method will be counted.

<details>
  <summary>Internal behavior</summary>
  
  On every `HATS_STARTED` event where hats with the opcode `event_whenbroadcastreceived` are started, all new threads are stored to be retrieved later by this block.
</details>

### `(first thread from last broadcast)` -> Thread
<img src="../assets/blocks/first_thread_from_last_broadcast.png">

Returns the first thread that was started by the most recent broadcast (or the null thread if no broadcasts have happened yet or the most recent broadcast didn't start any threads). Broadcasts from any target using any method will be counted.

<details>
  <summary>Internal behavior</summary>
  
  On every `HATS_STARTED` event where hats with the opcode `event_whenbroadcastreceived` are started, all new threads are stored to be retrieved later by this block.
</details>



## Threads Array

### `(threads)` -> Array\[Thread\]
<img src="../assets/blocks/threads.png">

Returns all threads that are currently alive and most[^5] threads that exited this tick in their execution order.

<details>
  <summary>Internal behavior</summary>
  
  Reads the `runtime.threads` array.
</details>

### `(threads in (TARGET v))` -> Array\[Thread\]
_Menus: `TARGET` uses [Target](#target)_

<img src="../assets/blocks/threads_in_this_target.png">

Returns all threads in `TARGET` that are currently alive and most[^5] threads that exited this tick in their execution order.

<details>
  <summary>Internal behavior</summary>
  
  Reads the `runtime.threads` array and then filters by target ID.
</details>

### `set threads to [THREADS] and yield to [ACTIVETHREAD]` -> Undefined
<img src="../assets/blocks/set_threads_to_and_yield_to.png">

Sets the [threads array](#threads---arraythread) to `THREADS` and then yields to `ACTIVETHREAD`.

`THREADS` should be an array of unique non-null threads that are already in the [threads array](#threads---arraythread). Any duplicate threads, null threads, or threads not already in the threads array will be omitted.

If a thread previously in the [threads array](#threads---arraythread) is not included in `THREADS`, it will be killed and put into limbo[^1].

If `ACTIVETHREAD` is null or not in the [threads array](#threads---arraythread) after the operation, instead yields to the [end of the tick](#yield-to-end-of-tick---undefined).

<details>
  <summary>Internal behavior</summary>
  
  Replaces the entire contents of the `runtime.threads` array by mutating it. Then, executes the behavior of [`yield to [ACTIVETHREAD]`](#yield-to-activethread---undefined).
</details>

### `set threads to [THREADS] and yield to thread at (ACTIVEINDEX v)` -> Undefined
_Menus: `ACTIVEINDEX` uses [Absolute Insert Index](#insert-index)_

<img src="../assets/blocks/set_threads_to_and_yield_to_thread_at_start.png">

Sets the [threads array](#threads---arraythread) to `THREADS` and then yields to the thread at `ACTIVEINDEX`.

`THREADS` should be an array of unique non-null threads that are already in the [threads array](#threads---arraythread). Any duplicate threads, null threads, or threads not already in the threads array will be omitted.

If a thread previously in the [threads array](#threads---arraythread) is not included in `THREADS`, it will be killed and put into limbo[^1].

If `ACTIVEINDEX` is larger than the normally accepted range, will immediately end the tick. If `ACTIVEINDEX` is too small, will yield to the first thread.

<details>
  <summary>Internal behavior</summary>
  
  Replaces the entire contents of the `runtime.threads` array by mutating it. Then, executes the behavior of [`yield to thread at (INDEX v)`](#yield-to-thread-at-index-v---undefined).
</details>

### `move [THREAD] to (INDEX v)` -> Undefined
_Menus: `INDEX` uses [Insert Index](#insert-index)_

<img src="../assets/blocks/move_to_after_end.png">

Moves `THREAD` to `INDEX` if it is in the [threads array](#threads---arraythread).

<details>
  <summary>Internal behavior</summary>
  
  If `INDEX` is less than or equal to the index of `THREAD`, removes `THREAD` from the threads array and then inserts it at `INDEX`. Otherwise, inserts it at `INDEX` and _then_ removes `THREAD` from the threads array. Then, if `sequencer.activeThreadIndex` was equal to the index of `THREAD`, sets it to `INDEX`. Otherwise, if it was greater than or equal to `INDEX`, increments it. This is to ensure that the active thread remains unchanged.
</details>

### `swap [THREADONE] with [THREADTWO]` -> Undefined
<img src="../assets/blocks/swap_with.png">

Swaps the positions of `THREADONE` and `THREADTWO` if they are distinct threads in the [threads array](#threads---arraythread).

<details>
  <summary>Internal behavior</summary>

  Swaps the positions of `THREADONE` and `THREADTWO` in `runtime.threads`.
</details>



## Atomic Loops

### `repeat [TIMES] without yielding {SUBSTACK}` -> Undefined
<img src="../assets/blocks/repeat_10_without_yielding.png">

Repeatedly executes `SUBSTACK` `TIMES` times. The difference between this block and the normal repeat block is that this block **does not yield after every loop**.[^3][^4]

### `repeat until [CONDITION] without yielding {SUBSTACK}` -> Undefined
<img src="../assets/blocks/repeat_until_without_yielding.png">

Repeatedly executes `SUBSTACK` until `CONDITION` is truthy. The difference between this block and the normal repeat until block is that this block **does not yield after every loop**.[^3][^4]

### `while [CONDITION] without yielding {SUBSTACK}` -> Undefined
<img src="../assets/blocks/while_without_yielding.png">

Repeatedly executes `SUBSTACK` until `CONDITION` is falsy. The difference between this block and the normal while block is that this block **does not yield after every loop**.[^3][^4]

## `forever without yielding {SUBSTACK}` -> Undefined
<img src="../assets/blocks/forever_without_yielding.png">

Repeatedly executes `SUBSTACK` forever. The difference between this block and the normal forever block is that this block **does not yield after every loop**.[^3][^4]



## Thread Variables

### `(get [VARIABLE] in [THREAD])` -> Any
<img src="../assets/blocks/get_foo_in.png">

Gets the thread variable named `VARIABLE` from `THREAD`. These thread variables are unique to this extension and are not used by the PenguinMod engine.

The null thread cannot store thread variables.

<details>
  <summary>Internal behavior</summary>

  Gets the `VARIABLE` key from the object at the `soupThreadVariables` key of the raw thread.
</details>

### `set [VARIABLE] in [THREAD] to [VALUE]` -> Undefined
<img src="../assets/blocks/set_foo_in_to_bar.png">

Sets the [thread variable](#get-variable-in-thread---any) named `VARIABLE` in `THREAD` to `VALUE`.

<details>
  <summary>Internal behavior</summary>

  Sets the `VARIABLE` key to `VALUE` in the object at the `soupThreadVariables` key of the raw thread.
</details>

### `(variables in [THREAD])` -> Array\[String\]
<img src="../assets/blocks/variables_in.png">

Returns an array containing the name of every [thread variable](#get-variable-in-thread---any) stored in `THREAD`.

<details>
  <summary>Internal behavior</summary>

  Gets the list of keys in the object at the `soupThreadVariables` key of the raw thread.
</details>

### `delete [VARIABLE] in [THREAD]` -> Undefined
<img src="../assets/blocks/delete_foo_in.png">

Deletes the [thread variable](#get-variable-in-thread---any) named `VARIABLE` from `THREAD`.

<details>
  <summary>Internal behavior</summary>

  Deletes the `VARIABLE` key from the object at the `soupThreadVariables` key of the raw thread.
</details>



## Counters

### `(tick # from init)` -> Number
<img src="../assets/blocks/tick_%23_from_init.png">

Returns the state of a counter that increments every tick and starts at 1 on the first tick the editor is loaded.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 when the extension is loaded and increments on the `BEFORE_TICK` event.
</details>

### `(frame # from init)` -> Number
<img src="../assets/blocks/frame_%23_from_init.png">

Returns the state of a counter that increments every frame and starts at 1 on the first tick the editor is loaded.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 when the extension is loaded and increments on the `BEFORE_EXECUTE` event.
</details>

### `(tick # from @blueFlag)` -> Number
<img src="../assets/blocks/tick_%23_from_blueFlag.png">

Returns the state of a counter that increments every tick and starts at 1 on the first tick after <img alt="blue flag" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/flag.svg"> is clicked.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 on the `PROJECT_START` event and increments on the `BEFORE_TICK` event.
</details>

### `(frame # from @blueFlag)` -> Number
<img src="../assets/blocks/frame_%23_from_blueFlag.png">

Returns the state of a counter that increments every frame and starts at 1 on the first tick after <img alt="blue flag" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/flag.svg"> is clicked.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 on the `PROJECT_START` event and increments on the `BEFORE_EXECUTE` event.
</details>

### `(tick # this frame)` -> Number
<img src="../assets/blocks/tick_%23_this_frame.png">

Returns the state of a counter that increments every frame and starts at 1 on the first tick of every frame.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 on the `BEFORE_EXECUTE` event and increments on the `BEFORE_TICK` event.
</details>



## Warp Mode

### `<warp mode>` -> Boolean
<img src="../assets/blocks/warp_mode.png">

Returns `true` if warp mode is enabled. When warp mode is enabled, **all yields are ignored**.

Some cases where warp mode is enabled:
- Code inside an `all at once` block
- Code inside a "Run without screen refresh" custom block
- Code inside an [`[enable v] warp mode for {SUBSTACK}`](#setboolean-v-warp-mode-for-substack---undefined) block

<details>
  <summary>Internal behavior</summary>

  At JS compile time, reads `compiler.isWarp`.
</details>

### `[SETBOOLEAN v] warp mode for {SUBSTACK}` -> Undefined
_Menus: `SETBOOLEAN` uses [Set Boolean](#set-boolean)_

<img src="../assets/blocks/enable_warp_mode_for.png">

Enables or disables [warp mode](#warp-mode---boolean) for `SUBSTACK`.

<details>
  <summary>Internal behavior</summary>

  At JS compile time, writes `compiler.isWarp` before compiling `SUBSTACK`, then restores it to its previous state.
</details>



## Timers

### `(target frame time)` -> Number
<img src="../assets/blocks/target_frame_time.png">

Returns the ideal time in seconds between every frame.

<details>
  <summary>Internal behavior</summary>

  Reads `runtime.currentStepTime`.
</details>

### `(last measured frame time)` -> Number
<img src="../assets/blocks/last_measured_frame_time.png">

Returns the duration in seconds of the previous frame, or `0` if this is the first frame.

<details>
  <summary>Internal behavior</summary>

  Measures the time with `Date.now()` on every `BEFORE_EXECUTE` event. This block returns the time difference between the last two event calls.
</details>

### `(target work time)` -> Number
<img src="../assets/blocks/target_work_time.png">

Returns the amount of time in seconds that the sequencer is allotted for execution every frame.

<details>
  <summary>Internal behavior</summary>

  Before the start of every frame, reads `runtime.currentStepTime`, multiplies by 75% (as done [here↗](https://github.com/PenguinMod/PenguinMod-Vm/blob/b88731f3f93ed36d2b57024f8e8d758b6b60b54e/src/engine/sequencer.js#L74)), and stores it to be retrieved every time this block is run.
</details>

### `(last measured work time)` -> Number
<img src="../assets/blocks/last_measured_work_time.png">

Returns the duration in seconds of the execution phase of the previous frame. This includes all time that code is being executed, but not the time that the renderer is redrawing the stage or waiting for the next frame.

<details>
  <summary>Internal behavior</summary>

  Measures the time with `Date.now()` on every `BEFORE_EXECUTE` and `AFTER_EXECUTE` event. This block returns the time difference between the last `AFTER_EXECUTE` and `BEFORE_EXECUTE` event calls.
</details>

### `(work timer)` -> Number
<img src="../assets/blocks/work_timer.png">

Returns the time elapsed for execution so far this frame. Before every tick, if this timer is greater than or equal to [`(target work time)`](#target-work-time---number), no more ticks will execute that frame, and the rest of the frame time is given to the renderer.

<details>
  <summary>Internal behavior</summary>

  Uses `sequencer.timer.timeElapsed()`.
</details>

### `set work timer to [TIME]` -> Undefined
<img src="../assets/blocks/set_work_timer_to_0.png">

Overrides the [work timer](#work-timer---number) by setting it to `TIME` seconds.

<details>
  <summary>Internal behavior</summary>

  Writes `sequencer.timer.startTime` (or `sequencer.timer._pausedTime` if paused) to change the timer value.
</details>



## Graphics Updated

### `<graphics updated>` -> Boolean
<img src="../assets/blocks/graphics_updated.png">

Returns the current state of the "graphics-updated" flag as mentioned [here↗](https://www.rokcoder.com/tips/inner-workings.html).

Will always be `false` at the start of the tick, but certain blocks that update visuals will enable the flag. If the flag is `true` at the end of the tick, the engine will sleep until the end of the frame time and then render (instead of running more ticks until the end of the frame time).

<details>
  <summary>Internal behavior</summary>
  
  Reads `runtime.redrawRequested`.
</details>

### `set graphics updated to <VALUE>` -> Undefined
<img src="../assets/blocks/set_graphics_updated_to.png">

Sets the "graphics-updated" flag as mentioned [here↗](https://www.rokcoder.com/tips/inner-workings.html).

The behavior and effects of this flag are described under [`<graphics updated>`](#graphics-updated---boolean).

<details>
  <summary>Internal behavior</summary>
  
  Writes `runtime.redrawRequested`.
</details>



# Menus

### Get Index
_Used in:_
- [`(thread at (INDEX v))`](#thread-at-index-v---thread)
- [`yield to thread at (INDEX v)`](#yield-to-thread-at-index-v---undefined)

_Type: **Number Textbox**_

| Item                        | Description                                                                  |
|-----------------------------|------------------------------------------------------------------------------|
| start                       | Gets the thread at the start of the [threads array](#threads---arraythread). |
| end                         | Gets the thread at the end of the threads array.                             |
| previous index*             | Gets the thread before the active thread in the threads array.               |
| active index*               | Gets the active thread.                                                      |
| next index*                 | Gets the thread after the active thread in the threads array.                |
| (you can put an index here) | _Sets the textbox to `1` when selected._                                     |

*This item will not appear for _absolute get index_ menus.

The value can be overridden by an integer from `0` to the length of the [threads array](#threads---arraythread) (inclusive). For the value `0`, the behavior of `end` is used. Otherwise, the value is interpreted as a 1-based index.

### Insert Index
_Used in:_
- [`new thread in (TARGET v) inserted (INDEX v) {SUBSTACK}`](#new-thread-in-target-v-inserted-index-v-substack---undefined)
- [`(new thread in (TARGET v) inserted (INDEX v) {SUBSTACK})`](#new-thread-in-target-v-inserted-index-v-substack---thread)
- [`broadcast [MESSAGE v] to (INDEX v)`](#broadcast-message-v-to-index-v---undefined)
- [`broadcast [MESSAGE v] to (INDEX v) and wait`](#broadcast-message-v-to-index-v-and-wait---undefined)
- [`set threads to [THREADS] and yield to thread at (ACTIVEINDEX v)`](#set-threads-to-threads-and-yield-to-thread-at-activeindex-v---undefined) _(absolute insert index)_
- [`move [THREAD] to (INDEX v)`](#move-thread-to-index-v---undefined)

_Type: **Number Textbox**_

| Item                        | Description                                                                              |
|-----------------------------|------------------------------------------------------------------------------------------|
| before start                | Inserts the thread(s) at the start of the [threads array](#threads---arraythread).       |
| after end                   | Inserts the thread(s) at the end of the threads array.                                   |
| before previous*            | Inserts the thread(s) before the _thread before the active thread_ in the threads array. |
| before active*              | Inserts the thread(s) before the active thread in the threads array.                     |
| after active*               | Inserts the thread(s) after the active thread in the threads array.                      |
| (you can put an index here) | _Sets the textbox to `1` when selected._                                                 |

*This item will not appear for _absolute insert index_ menus.

The value can be overridden by an integer from `0` to the length of the [threads array](#threads---arraythread) + 1 (inclusive). For the value `0`, the behavior of `after end` is used. Otherwise, the value is interpreted as a 1-based index; the operation will insert the thread(s) **before the specified index**.

### Target
_Used in:_
- [`new thread in (TARGET v) inserted (INDEX v) {SUBSTACK}`](#new-thread-in-target-v-inserted-index-v-substack---undefined)
- [`(new thread in (TARGET v) inserted (INDEX v) {SUBSTACK})`](#new-thread-in-target-v-inserted-index-v-substack---thread)
- [`(threads in (TARGET v))`](#threads-in-target-v---arraythread)

_Type: **Accepts Reporters**_

| Item                        | Description                                             |
|-----------------------------|---------------------------------------------------------|
| this target                 | Uses the current target.                                |
| _sprite name_               | Uses the non-clone target of the sprite with this name. |

The value can be overridden by a target or target ID.

### Status Format
_Used in:_
- [`(status [STATUSFORMAT v] of [THREAD])`](#status-statusformat-v-of-thread---number--string)

_Type: **Static**_

| Item          | Description                                                 |
|---------------|-------------------------------------------------------------|
| #             | Gives the status as an integer.                             |
| text          | Gives the status as a user-friendly string.                 |
| internal name | Gives the status as the name of its variable in the engine. |

### Set Boolean
_Used in:_
- [`[SETBOOLEAN v] warp mode for {SUBSTACK}`](#setboolean-v-warp-mode-for-substack---undefined)

_Type: **Static**_

| Item    | Description           |
|---------|-----------------------|
| enable  | Enables the setting.  |
| disable | Disables the setting. |



[^1]: Status is not a reliable indicator for whether a thread is alive. To reliably check if a thread is alive, instead you should use [`<[THREAD] is alive?>`](#thread-is-alive---boolean). This is because of [limbo](#thread-is-in-limbo---boolean).

[^2]: There are some exceptions where a thread is considered "killed" even though it caused its own termination:
    - When a thread runs `stop [all v]`, it is considered killed.
    - When `stop (SPRITE v)` is run, all threads running as `SPRITE` are considered killed, even if they caused it.
    - When a clone is deleted, all threads running as that clone are considered killed, even if they caused the deletion.

[^3]: The _contents_ of the loop will **NOT** be run with warp mode (all at once); only the loop itself has this behavior.

[^4]: This block _will_ yield after a loop if the editor is frozen and warp timer is enabled to prevent crashes.

[^5]: Threads that entered limbo[^1] this tick are not present in the [threads array](#threads---arraythread).
