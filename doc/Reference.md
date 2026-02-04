# Threads Reference

[← Back to Documentation](https://github.com/the-can-of-soup/pm_threads/blob/main/doc/Documentation.md)

### Table of Contents
- [\(top of page\)](#threads-reference)
    - [Table of Contents](#table-of-contents)
- [Blocks](#blocks)
  - [Thread Getters](#thread-getters)
    - [`(active thread)` -> Thread](#active-thread---thread)
    - [`(active index)` -> Number](#active-index---number)
    - [`(null thread)` -> Thread](#null-thread---thread)
    - [`(thread at (INDEX v))` -> Thread](#thread-at-index-v---thread)
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
    - [`<[THREAD] was started by clicking in the editor?>` -> Boolean](#thread-was-started-by-clicking-in-the-editor---boolean)
  - [Yielding](#yielding)
    - [`yield to next thread` -> Undefined](#yield-to-next-thread---undefined)
    - [`yield [TIMES] times` -> Undefined](#yield-times-times---undefined)
    - [`yield to previous thread` -> Undefined](#yield-to-previous-thread---undefined)
    - [`yield to [ACTIVETHREAD]` -> Undefined](#yield-to-activethread---undefined)
    - [`yield to thread at (INDEX v)` -> Undefined](#yield-to-thread-at-index-v---undefined)
    - [`yield to end of tick` -> Undefined](#yield-to-end-of-tick---undefined)
  - [Threads List](#threads-list)
    - [`(threads)` -> Array\[Thread\]](#threads---arraythread)
  - [Atomic Loops](#atomic-loops)
    - [`repeat [TIMES] without yielding {SUBSTACK}` -> Undefined](#repeat-times-without-yielding-substack---undefined)
    - [`repeat until [CONDITION] without yielding {SUBSTACK}` -> Undefined](#repeat-until-condition-without-yielding-substack---undefined)
    - [`while [CONDITION] without yielding {SUBSTACK}` -> Undefined](#while-condition-without-yielding-substack---undefined)
    - [`forever without yielding {SUBSTACK}` -> Undefined](#forever-without-yielding-substack---undefined)
  - [Warp Mode](#warp-mode)
    - [`<warp mode>` -> Boolean](#warp-mode---boolean)
  - [Graphics Updated](#graphics-updated)
    - [`<graphics updated>` -> Boolean](#graphics-updated---boolean)
    - [`set graphics updated to <VALUE>` -> Undefined](#set-graphics-updated-to-value---undefined)
- [Menus](#menus)
    - [Index](#index)
    - [Status Format](#status-format)



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

Returns the thread that is at `INDEX` in the threads list.

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

Returns the current status code of `THREAD`, or the status code in text format if `STATUSFORMAT` is "text". These are the possible values:

| Status # | Status text          | Description                                                  |
|----------|----------------------|--------------------------------------------------------------|
| 0        | Running              | The default status of a thread.[^1]                          |
| 1        | Waiting for promise  | Behavior unknown                                             |
| 2        | Yielded              | Behavior unknown                                             |
| 3        | Yielded for one tick | Behavior unknown                                             |
| 4        | Completed            | The thread is "dead", i.e. it will never run code again.[^1] |
| 5        | Suspended            | Behavior unknown                                             |

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

Yields and makes `ACTIVETHREAD` active. If `ACTIVETHREAD` is null or not in the [threads list](#threads---arraythread), does nothing.

<details>
  <summary>Internal behavior</summary>
  
  Sets `sequencer.activeThreadIndex` to 1 less than the desired index before yielding. The decrement is because this value is always incremented by the engine after every yield.
</details>

### `yield to thread at (INDEX v)` -> Undefined
_Menus: `INDEX` uses [Index](#index) (get mode)_

<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/yield_to_thread_at_start.png?raw=true">

Yields and makes the thread at `INDEX` active.

If `INDEX` is larger than the normally accepted range, will immediately end the tick.

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



## Threads List

### `(threads)` -> Array\[Thread\]
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/threads.png?raw=true">

Returns all threads that are currently alive and all threads that [exited naturally](#thread-exited-naturally---boolean) this tick in their execution order.

<details>
  <summary>Internal behavior</summary>
  
  Reads the `runtime.threads` array.
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



## Warp Mode

### `<warp mode>` -> Boolean
<img src="https://github.com/the-can-of-soup/pm_threads/blob/main/assets/blocks/warp_mode.png?raw=true">

Returns `true` if warp mode is enabled. When warp mode is enabled, all yields are ignored.

For example, code inside an `all at once` block or inside a "Run without screen refresh" custom block has warp mode enabled.

<details>
  <summary>Internal behavior</summary>

  At JS compile time, reads `compiler.isWarp`.
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

Depending on whether the argument is going to be used as a *get* index or an *insert* index, the menu items will be:

| Get                         | Insert                      |
|-----------------------------|-----------------------------|
| start                       | before start                |
| end                         | after end                   |
| previous index              | before previous             |
| active index                | before active               |
| next index                  | before next                 |
| (you can put an index here) | (you can put an index here) |

For *get* indexes, the value can be overridden by an integer from `0` to the length of the threads list (inclusive).\
For *insert* indexes, the value can be overridden by an integer from `0` to the length of the threads list + 1 (inclusive).

For the value `0`, the behavior of `end` or `after end` is used. Otherwise, the value is used as a 1-based index. In the case of *insert*, the operation will insert the thread(s) **before the specified index**.

### Status Format

| Menu Items |
|------------|
| #          |
| text       |



[^1]: Status is not a reliable indicator for whether a thread is alive. To reliably check if a thread is alive, instead you should use [`<[THREAD] is alive?>`](#thread-is-alive---boolean). This is because in many cases when a thread is stopped, it will enter limbo. Limbo is when a dead thread's status does not get set to [4](#status-statusformat-v-of-thread---number). Some known cases where a thread enters limbo:
    - When the &nbsp;<img alt="blue flag" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/flag.svg"> blue flag is clicked, all previously running threads will enter limbo.
    - When the &nbsp;<img alt="stop sign" style="height: 1em;" src="https://raw.githubusercontent.com/PenguinMod/PenguinMod-Home/refs/heads/main/static/stage_controls/gradient/stop.svg"> stop sign is clicked, all previously running threads will enter limbo.
    - When a stack restarts because its hat is triggered again, the old thread enters limbo.

[^2]: There are some exceptions where a thread is considered "killed" even though it caused its own termination:
    - When a thread runs `stop [all v]`, it is considered killed.
    - When `stop (SPRITE v)` is run, all threads running as `SPRITE` are considered killed, even if they caused it.
    - When a clone is deleted, all threads running as that clone are considered killed, even if they caused the deletion.

[^3]: The contents of the loop will **NOT** be run with warp mode (all at once); only the loop itself has this behavior.

[^4]: This block will yield after a loop if the editor is frozen and warp timer is enabled to prevent crashes.
