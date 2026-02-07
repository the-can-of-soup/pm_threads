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
  - Thread Builders
    - **TODO:** `new thread in (TARGET v) moved to (INDEX v)` -> Undefined
    - **TODO:** `(new thread in (TARGET v) moved to (INDEX v))` -> Thread
  - [Thread Properties](#thread-properties)
    - [`(target of [THREAD])` -> Target](#target-of-thread---target)
    - [`(id of [THREAD])` -> String](#id-of-thread---string)
    - [`(status [STATUSFORMAT v] of [THREAD])` -> Number](#status-statusformat-v-of-thread---number)
    - [`(index of [THREAD])` -> Number](#index-of-thread---number)
  - [Boolean Thread Operators](#boolean-thread-operators)
    - [`<[THREADONE] is [THREADTWO]>` -> Boolean](#threadone-is-threadtwo---boolean)
    - [`<[VALUE] is a thread?>` -> Boolean](#value-is-a-thread---boolean)
    - [`<[THREAD] is null?>` -> Boolean](#thread-is-null---boolean)
    - [`<[THREAD] is alive?>` -> Boolean](#thread-is-alive---boolean)
    - [`<[THREAD] exited naturally?>` -> Boolean](#thread-exited-naturally---boolean)
    - [`<[THREAD] was killed?>` -> Boolean](#thread-was-killed---boolean)
    - **TODO:** `<[THREAD] is suspended?>` -> Boolean
    - [`<[THREAD] was started by clicking in the editor?>` -> Boolean](#thread-was-started-by-clicking-in-the-editor---boolean)
    - [`<[THREAD] is a monitor updater?>` -> Boolean](#thread-is-a-monitor-updater---boolean)
  - Thread Actions
    - **TODO:** `kill thread [THREAD]` -> Undefined
    - **TODO:** `suspend thread [THREAD]` -> Undefined
    - **TODO:** `resume thread [THREAD]` -> Undefined
  - [Yielding](#yielding)
    - [`yield to next thread` -> Undefined](#yield-to-next-thread---undefined)
    - [`yield [TIMES] times` -> Undefined](#yield-times-times---undefined)
    - [`yield to previous thread` -> Undefined](#yield-to-previous-thread---undefined)
    - [`yield to [ACTIVETHREAD]` -> Undefined](#yield-to-activethread---undefined)
    - [`yield to thread at (INDEX v)` -> Undefined](#yield-to-thread-at-index-v---undefined)
    - [`yield to end of tick` -> Undefined](#yield-to-end-of-tick---undefined)
  - Broadcasts
    - **TODO:** `broadcast [MESSAGE v] to (INDEX v)` -> Undefined
    - **TODO:** `broadcast [MESSAGE v] to (INDEX v) and wait` -> Undefined
    - **TODO:** `run [MESSAGE v] immediately and return` -> Undefined
    - **TODO:** `(last broadcast)` -> Array\[Thread\]
    - **TODO:** `(last broadcast)` -> Thread
  - [Threads Array](#threads-array)
    - [`(threads)` -> Array\[Thread\]](#threads---arraythread)
    - **TODO:** `(threads in (TARGET v))` -> Array\[Thread\]
    - [`set threads to [THREADS] and yield to [ACTIVETHREAD]` -> Undefined](#set-threads-to-threads-and-yield-to-activethread---undefined)
    - [`set threads to [THREADS] and yield to thread at (ACTIVEINDEX v)` -> Undefined](#set-threads-to-threads-and-yield-to-thread-at-activeindex-v---undefined)
    - **TODO:** `move thread [THREAD] to (INDEX v)` -> Undefined
    - **TODO:** `swap thread [THREADONE] with [THREADTWO]` -> Undefined
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
  - [Work Timer](#work-timer)
    - [`(work time)` -> Number](#work-time---number)
    - [`(work timer)` -> Number](#work-timer---number)
    - [`set work timer to [TIME]` -> Undefined](#set-work-timer-to-time---undefined)
- [Menus](#menus)
    - [Index](#index)
    - [Status Format](#status-format)
    - [Set Boolean](#set-boolean)



# Blocks



## Thread Getters

### `(active thread)` -> Thread
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/active_thread.png?raw=true">

Returns the currently active thread.

This is always the thread that contains the block, because it is impossible to run this block without it being in the active thread.

<details>
  <summary>Internal behavior</summary>
  
  Reads `sequencer.activeThread`.
</details>

### `(active index)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/active_index.png?raw=true">

Returns the index of the currently active thread.

<details>
  <summary>Internal behavior</summary>
  
  Reads `sequencer.activeThreadIndex` _([I added that!](https://github.com/PenguinMod/PenguinMod-Vm/pull/173) :D)_.
</details>

### `(null thread)` -> Thread
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/null_thread.png?raw=true">

Returns the null thread.

This represents a thread that failed to load or doesn't exist. It has an ID of `undefined`. This thread is also used when the wrong type is inserted into a thread input.

### `(thread at (INDEX v))` -> Thread
_Menus: `INDEX` uses [Index](#index) (get mode)_

<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/thread_at_start.png?raw=true">

Returns the thread that is at `INDEX` in the [threads array](#threads---arraythread).

<details>
  <summary>Internal behavior</summary>
  
  Reads from the `runtime.threads` array.
</details>



## Thread Properties

### `(target of [THREAD])` -> Target
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/target_of.png?raw=true">

Returns the target that is running / ran `THREAD`.

<details>
  <summary>Internal behavior</summary>
  
  Reads the `target` key from the raw thread object.
</details>

### `(id of [THREAD])` -> String
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/id_of.png?raw=true">

Returns a unique identifier for `THREAD`. This ID is generated by the extension and is not used in the PenguinMod engine.

<details>
  <summary>Internal behavior</summary>
  
  Reads the custom `soupThreadId` key from the raw thread object.
</details>

### `(status [STATUSFORMAT v] of [THREAD])` -> Number
_Menus: `STATUSFORMAT` uses [Status Format](#status-format)_

<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/status_%23_of.png?raw=true">

Returns the current status code of `THREAD`, the status code in text format if `STATUSFORMAT` is "text", or the internal name of the status code if `STATUSFORMAT` is "internal name". These are the possible values:

| Status # | Status text          | Internal name         | Description                                                  |
|----------|----------------------|-----------------------|--------------------------------------------------------------|
| 0        | Running              | `STATUS_RUNNING`      | The default status of a thread.[^1]                          |
| 1        | Waiting for promise  | `STATUS_PROMISE_WAIT` | Behavior unknown                                             |
| 2        | Yielded              | `STATUS_YIELD`        | Behavior unknown                                             |
| 3        | Yielded for one tick | `STATUS_YIELD_TICK`   | Behavior unknown                                             |
| 4        | Completed            | `STATUS_DONE`         | The thread is "dead", i.e. it will never run code again.[^1] |
| 5        | Suspended            | `STATUS_PAUSED`       | Behavior unknown                                             |

<details>
  <summary>Internal behavior</summary>
  
  Reads the `status` key from the raw thread object.
</details>

### `(index of [THREAD])` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/index_of.png?raw=true">

Returns the index of `THREAD` in the [list of threads](#threads---arraythread).

<details>
  <summary>Internal behavior</summary>
  
  Finds the index of the thread in the `runtime.threads` array.
</details>



## Boolean Thread Operators

### `<[THREADONE] is [THREADTWO]>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/is.png?raw=true">

Returns `true` if the IDs of the threads match, otherwise returns `false`.

Note that the `<[] = []>` block in Operators is not meant for this, as that block compares the stringified value.

<details>
  <summary>Internal behavior</summary>
  
  Uses the `soupThreadId` key of the raw thread objects to compare the threads.
</details>

### `<[VALUE] is a thread?>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/is_a_thread.png?raw=true">

Returns `true` if `VALUE` is a thread, otherwise returns `false`.

### `<[THREAD] is null?>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/is_null.png?raw=true">

Returns `true` if `THREAD` is the null thread.

### `<[THREAD] is alive?>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/is_alive.png?raw=true">

Returns `true` if `THREAD` is alive, i.e. it is not finished.

<details>
  <summary>Internal behavior</summary>
  
  Returns `true` if the raw thread is in the `runtime.threads` array and its status is not [4 (completed)](#status-statusformat-v-of-thread---number).
</details>

### `<[THREAD] exited naturally?>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/exited_naturally.png?raw=true">

Returns `true` if `THREAD` is dead, but was not killed, i.e. it exited of its own accord.[^2]

<details>
  <summary>Internal behavior</summary>
  
  Returns `true` if either:
  - All of:
    - The raw thread is not in the `runtime.threads` array (therefore it is dead).
    - The raw thread's `isKilled` key is `false`.
    - The thread's status is [4 (completed)](#status-statusformat-v-of-thread---number). This catches limbo[^1] cases in which killed threads have `isKilled` set to `false` and `status` unchanged.
  - All of:
    - The raw thread is in the `runtime.threads` array (therefore it died this tick if its status is [4](#status-statusformat-v-of-thread---number)).
    - The thread's status is [4 (completed)](#status-statusformat-v-of-thread---number).
</details>

### `<[THREAD] was killed?>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/was_killed.png?raw=true">

Returns `true` if `THREAD` exited due to an external cause.[^2]

<details>
  <summary>Internal behavior</summary>
  
  Returns `true` if:
  - The raw thread is not in the `runtime.threads` array (therefore it is dead).
  - Either:
    - The raw thread's `isKilled` key is `true`.
    - The raw thead's `status` key is not 4 (completed). This catches limbo[^1] cases in which killed threads have `isKilled` set to `false` and `status` unchanged.
</details>

### `<[THREAD] was started by clicking in the editor?>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/was_started_by_clicking_in_the_editor.png?raw=true">

Returns `true` if `THREAD` was started by manually clicking a stack in the code editor.

<details>
  <summary>Internal behavior</summary>
  
  Returns the `stackClick` key from the raw thread object.
</details>

### `<[THREAD] is a monitor updater?>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/is_a_monitor_updater.png?raw=true">

Returns `true` if `THREAD` was started by the engine to check the value of a reporter for a monitor.

<details>
  <summary>Internal behavior</summary>
  
  Returns the `updateMonitor` key from the raw thread object.
</details>



## Yielding

### `yield to next thread` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/yield_to_next_thread.png?raw=true">

Yields.

### `yield [TIMES] times` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/yield_30_times.png?raw=true">

Yields `TIMES` times.

### `yield to previous thread` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/yield_to_previous_thread.png?raw=true">

Yields and makes the previous thread active.

<details>
  <summary>Internal behavior</summary>
  
  Decrements `sequencer.activeThreadIndex` twice before yielding. The second decrement is because this value is always incremented by the engine after every yield.
</details>

### `yield to [ACTIVETHREAD]` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/yield_to.png?raw=true">

Yields and makes `ACTIVETHREAD` active.

If `ACTIVETHREAD` is null or not in the [threads array](#threads---arraythread), instead yields to the [end of the tick](#yield-to-end-of-tick---undefined).

<details>
  <summary>Internal behavior</summary>
  
  If `ACTIVETHREAD` is valid, sets `sequencer.activeThreadIndex` to 1 less than the desired index before yielding. The decrement is because this value is always incremented by the engine after every yield. Otherwise, executes the behavior of [`yield to end of tick`](#yield-to-end-of-tick---undefined).
</details>

### `yield to thread at (INDEX v)` -> Undefined
_Menus: `INDEX` uses [Index](#index) (get mode)_

<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/yield_to_thread_at_start.png?raw=true">

Yields and makes the thread at `INDEX` active.

If `INDEX` is larger than the normally accepted range, will immediately end the tick. If `INDEX` is too small, will yield to the first thread.

<details>
  <summary>Internal behavior</summary>
  
  Sets `sequencer.activeThreadIndex` to 1 less than the desired index before yielding. The decrement is because this value is always incremented by the engine after every yield.
</details>

### `yield to end of tick` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/yield_to_end_of_tick.png?raw=true">

Yields and immediately ends the tick, skipping all threads that would normally step after this one.

<details>
  <summary>Internal behavior</summary>
  
  Sets `sequencer.activeThreadIndex` to 1 less than the length of `runtime.threads` before yielding. The engine increments the active thread index after every yield, so then it is left at the length of `runtime.threads`, causing the loop in the sequencer to exit, completing the tick.
</details>



## Threads Array

### `(threads)` -> Array\[Thread\]
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/threads.png?raw=true">

Returns all threads that are currently alive and all threads that [exited naturally](#thread-exited-naturally---boolean) this tick in their execution order.

<details>
  <summary>Internal behavior</summary>
  
  Reads the `runtime.threads` array.
</details>

### `set threads to [THREADS] and yield to [ACTIVETHREAD]` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/set_threads_to_and_yield_to.png?raw=true">

Sets the [threads array](#threads---arraythread) to `THREADS` and then yields to `ACTIVETHREAD`.

`THREADS` should be an array of unique non-null threads that are already in the [threads array](#threads---arraythread). Any duplicate threads, null threads, or threads not already in the threads array will be omitted.

If `ACTIVETHREAD` is null or not in the [threads array](#threads---arraythread) after the operation, instead yields to the [end of the tick](#yield-to-end-of-tick---undefined).

<details>
  <summary>Internal behavior</summary>
  
  Replaces the entire contents of the `runtime.threads` array by mutating it. Then, executes the behavior of [`yield to [ACTIVETHREAD]`](#yield-to-activethread---undefined).
</details>

### `set threads to [THREADS] and yield to thread at (ACTIVEINDEX v)` -> Undefined
_Menus: `ACTIVEINDEX` uses [Index](#index) (get mode & absolute mode)_

<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/set_threads_to_and_yield_to_thread_at_start.png?raw=true">

Sets the [threads array](#threads---arraythread) to `THREADS` and then yields to the thread at `ACTIVEINDEX`.

`THREADS` should be an array of unique non-null threads that are already in the [threads array](#threads---arraythread). Any duplicate threads, null threads, or threads not already in the threads array will be omitted.

If `ACTIVEINDEX` is larger than the normally accepted range, will immediately end the tick. If `ACTIVEINDEX` is too small, will yield to the first thread.

<details>
  <summary>Internal behavior</summary>
  
  Replaces the entire contents of the `runtime.threads` array by mutating it. Then, executes the behavior of [`yield to thread at (INDEX v)`](#yield-to-thread-at-index-v---undefined).
</details>



## Atomic Loops

### `repeat [TIMES] without yielding {SUBSTACK}` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/repeat_10_without_yielding.png?raw=true">

Repeatedly executes `SUBSTACK` `TIMES` times. The difference between this block and the normal repeat block is that this block **does not yield after every loop**.[^3][^4]

### `repeat until [CONDITION] without yielding {SUBSTACK}` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/repeat_until_without_yielding.png?raw=true">

Repeatedly executes `SUBSTACK` until `CONDITION` is truthy. The difference between this block and the normal repeat until block is that this block **does not yield after every loop**.[^3][^4]

### `while [CONDITION] without yielding {SUBSTACK}` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/while_without_yielding.png?raw=true">

Repeatedly executes `SUBSTACK` until `CONDITION` is falsy. The difference between this block and the normal while block is that this block **does not yield after every loop**.[^3][^4]

## `forever without yielding {SUBSTACK}` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/forever_without_yielding.png?raw=true">

Repeatedly executes `SUBSTACK` forever. The difference between this block and the normal forever block is that this block **does not yield after every loop**.[^3][^4]



## Thread Variables

### `(get [VARIABLE] in [THREAD])` -> Any
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/get_foo_in.png?raw=true">

Gets the thread variable named `VARIABLE` from `THREAD`. These thread variables are unique to this extension and are not used by the PenguinMod engine.

The null thread cannot store thread variables.

<details>
  <summary>Internal behavior</summary>

  Gets the `VARIABLE` key from the object at the `soupThreadVariables` key of the raw thread.
</details>

### `set [VARIABLE] in [THREAD] to [VALUE]` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/set_foo_in_to_bar.png?raw=true">

Sets the [thread variable](#get-variable-in-thread---any) named `VARIABLE` in `THREAD` to `VALUE`.

<details>
  <summary>Internal behavior</summary>

  Sets the `VARIABLE` key to `VALUE` in the object at the `soupThreadVariables` key of the raw thread.
</details>

### `(variables in [THREAD])` -> Array\[String\]
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/variables_in.png?raw=true">

Returns an array containing the name of every [thread variable](#get-variable-in-thread---any) stored in `THREAD`.

<details>
  <summary>Internal behavior</summary>

  Gets the list of keys in the object at the `soupThreadVariables` key of the raw thread.
</details>

### `delete [VARIABLE] in [THREAD]` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/delete_foo_in.png?raw=true">

Deletes the [thread variable](#get-variable-in-thread---any) named `VARIABLE` from `THREAD`.

<details>
  <summary>Internal behavior</summary>

  Deletes the `VARIABLE` key from the object at the `soupThreadVariables` key of the raw thread.
</details>



## Counters

### `(tick # from init)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/tick_%23_from_init.png?raw=true">

Returns the state of a counter that increments every tick and starts at 1 on the first tick the editor is loaded.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 when the extension is loaded and increments on the `BEFORE_TICK` event.
</details>

### `(frame # from init)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/frame_%23_from_init.png?raw=true">

Returns the state of a counter that increments every frame and starts at 1 on the first tick the editor is loaded.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 when the extension is loaded and increments on the `BEFORE_EXECUTE` event.
</details>

### `(tick # from @blueFlag)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/tick_%23_from_blueFlag.png?raw=true">

Returns the state of a counter that increments every tick and starts at 1 on the first tick after <img alt="blue flag" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/flag.svg"> is clicked.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 on the `PROJECT_START` event and increments on the `BEFORE_TICK` event.
</details>

### `(frame # from @blueFlag)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/frame_%23_from_blueFlag.png?raw=true">

Returns the state of a counter that increments every frame and starts at 1 on the first tick after <img alt="blue flag" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/flag.svg"> is clicked.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 on the `PROJECT_START` event and increments on the `BEFORE_EXECUTE` event.
</details>

### `(tick # this frame)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/tick_%23_this_frame.png?raw=true">

Returns the state of a counter that increments every frame and starts at 1 on the first tick of every frame.

<details>
  <summary>Internal behavior</summary>

  Sets to 0 on the `BEFORE_EXECUTE` event and increments on the `BEFORE_TICK` event.
</details>



## Warp Mode

### `<warp mode>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/warp_mode.png?raw=true">

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

<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/enable_warp_mode_for.png?raw=true">

Enables or disables [warp mode](#warp-mode---boolean) for `SUBSTACK`.

<details>
  <summary>Internal behavior</summary>

  At JS compile time, writes `compiler.isWarp` before compiling `SUBSTACK`, then restores it to its previous state.
</details>



## Work Timer

### `(work time)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/work_time.png?raw=true">

Returns the amount of time in seconds before the sequencer will end the frame and rerender.

<details>
  <summary>Internal behavior</summary>

  Before the start of every frame, reads `runtime.currentStepTime`, multiplies by 75% (as done [here↗](https://github.com/PenguinMod/PenguinMod-Vm/blob/b88731f3f93ed36d2b57024f8e8d758b6b60b54e/src/engine/sequencer.js#L74)), and stores it to be retrieved every time this block is run.
</details>

### `(work timer)` -> Number
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/work_timer.png?raw=true">

Returns the time elapsed so far this frame. This timer is used by the sequencer to know when to end the frame and rerender.

<details>
  <summary>Internal behavior</summary>

  Uses `sequencer.timer.timeElapsed()`.
</details>

### `set work timer to [TIME]` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/set_work_timer_to_0.png?raw=true">

Overrides the [work timer](#work-timer---number) by setting it to `TIME` seconds.

<details>
  <summary>Internal behavior</summary>

  Writes `sequencer.timer.startTime` (or `sequencer.timer._pausedTime` if paused) to change the timer value.
</details>



## Graphics Updated

### `<graphics updated>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/graphics_updated.png?raw=true">

Returns the current state of the "graphics-updated" flag as mentioned [here↗](https://www.rokcoder.com/tips/inner-workings.html).

Will always be `false` at the start of the tick, but certain blocks that update visuals will enable the flag. If the flag is `true` at the end of the tick, the engine will sleep until the end of the frame time and then render (instead of running more ticks until the end of the frame time).

<details>
  <summary>Internal behavior</summary>
  
  Reads `runtime.redrawRequested`.
</details>

### `set graphics updated to <VALUE>` -> Undefined
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/set_graphics_updated_to.png?raw=true">

Sets the "graphics-updated" flag as mentioned [here↗](https://www.rokcoder.com/tips/inner-workings.html).

The behavior and effects of this flag are described under [`<graphics updated>`](#graphics-updated---boolean).

<details>
  <summary>Internal behavior</summary>
  
  Writes `runtime.redrawRequested`.
</details>



# Menus

### Index

Depending on whether the argument is going to be used as a _get_ index or an _insert_ index and whether _absolute mode_ is used, the menu items will be:

| Get                         | Insert                      |
|-----------------------------|-----------------------------|
| start                       | before start                |
| end                         | after end                   |
| previous index*             | before previous*            |
| active index*               | before active*              |
| next index*                 | before next*                |
| (you can put an index here) | (you can put an index here) |

*This item will not appear if _absolute mode_ is used.

For *get* indexes, the value can be overridden by an integer from `0` to the length of the [threads array](#threads---arraythread) (inclusive).\
For *insert* indexes, the value can be overridden by an integer from `0` to the length of the threads array + 1 (inclusive).

For the value `0`, the behavior of `end` or `after end` is used. Otherwise, the value is interpreted as a 1-based index.

In the case of *insert*, the operation will insert the thread(s) **before the specified index**.

### Status Format

| Menu Items    |
|---------------|
| #             |
| text          |
| internal name |

### Set Boolean

| Menu Items |
|------------|
| enable     |
| disable    |



[^1]: Status is not a reliable indicator for whether a thread is alive. To reliably check if a thread is alive, instead you should use [`<[THREAD] is alive?>`](#thread-is-alive---boolean). This is because in many cases when a thread is stopped, it will enter limbo. Limbo is when a dead thread's [status](#status-statusformat-v-of-thread---number) does not get set to 4. Some known cases where a thread enters limbo:
    - When <img alt="blue flag" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/flag.svg"> is clicked, all previously running threads will enter limbo.
    - When <img alt="stop sign" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/stop.svg"> is clicked, all previously running threads will enter limbo.
    - When a stack restarts because its hat is triggered again, the old thread enters limbo.

[^2]: There are some exceptions where a thread is considered "killed" even though it caused its own termination:
    - When a thread runs `stop [all v]`, it is considered killed.
    - When `stop (SPRITE v)` is run, all threads running as `SPRITE` are considered killed, even if they caused it.
    - When a clone is deleted, all threads running as that clone are considered killed, even if they caused the deletion.

[^3]: The contents of the loop will **NOT** be run with warp mode (all at once); only the loop itself has this behavior.

[^4]: This block will yield after a loop if the editor is frozen and warp timer is enabled to prevent crashes.
