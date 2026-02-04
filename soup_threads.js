// Name: Threads
// ID: soupThreads
// Description: Take full control of the sequencer so you can fix all of those pesky one-frame-off bugs.
// By: soup
// License: MIT

// GitHub repo: https://github.com/the-can-of-soup/pm_threads



// TO-DO
//
// - Figure out if it is possible for dead threads to be in `runtime.threads` during a step, and if so, apply patches
// - Fix weird bug where `(running threads)` result desyncs from `vm.runtime.threads`. Maybe `vm` or `vm.runtime` are being swapped for different objects?
//   (maybe fixed by using `util.sequencer` in every block instead of having `const sequencer = vm.runtime.sequencer;` at the start?)
// - Yell at @jwklong until they fix the lip that is happening in the `builder` block

// NOTES
//
// graphics-updated is stored in `runtime.redrawRequested`.
//
// Sequencer: https://github.com/PenguinMod/PenguinMod-Vm/blob/develop/src/engine/sequencer.js
// Specifically look at `stepThreads()` which executes ticks until the stage should be redrawn.
//
// Threads: https://github.com/PenguinMod/PenguinMod-Vm/blob/develop/src/engine/thread.js
// Runtime: https://github.com/PenguinMod/PenguinMod-Vm/blob/develop/src/engine/runtime.js
//
// `util` (the second parameter to block functions): https://github.com/PenguinMod/PenguinMod-Vm/blob/develop/src/engine/block-utility.js



(function(Scratch) {
  'use strict';

  const vm = Scratch.vm;
  const runtime = vm.runtime;

  let jwArray;
  let jwTargets;

  // Copied from pmControlsExpansion
  const AsyncIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPgo8ZGVmcz4KPGcgaWQ9IkxheWVyMV8wX0ZJTEwiPgo8cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLW9wYWNpdHk9IjAuNDQ3MDU4ODIzNTI5NDExOCIgc3Ryb2tlPSJub25lIiBkPSIKTSAxMi4xIDEuNTUKUSAxMS41MTU0Mjk2ODc1IDEuNDk5NjA5Mzc1IDEwLjk1IDIuMTUKTCA3LjMgNi4xClEgNi42ODcxMDkzNzUgNi41NjI1IDYuNyA3LjIgNi43MjUgOC43NzUxOTUzMTI1IDguMyA4Ljc1CkwgOS4yNSA4Ljc1ClEgOS42MTA1NDY4NzUgMTIuMjU2MDU0Njg3NSA5LjI1IDE1LjMKTCA4LjEgMTUuMjUKUSA3LjE1MzkwNjI1IDE1LjI3MTY3OTY4NzUgNi44IDE2IDYuNjc2MzY3MTg3NSAxNi4yNjY3OTY4NzUgNi42NSAxNi42NSA2LjYxMjY5NTMxMjUgMTcuMTY3MTg3NSA3LjIgMTcuODUKTCAxMC45NSAyMS45ClEgMTEuNDQxMjEwOTM3NSAyMi42NTE5NTMxMjUgMTIuMSAyMi41NSAxMi42MDkxNzk2ODc1IDIyLjY0NDcyNjU2MjUgMTMuMiAyMi4wNQpMIDEzLjIgMjIuMDUgMTcuMDUgMTcuOQpRIDE3LjU1ODc4OTA2MjUgMTcuNDY4OTQ1MzEyNSAxNy41IDE2LjkgMTcuNTI1IDE1LjMyNDgwNDY4NzUgMTUuOTUgMTUuMwpMIDE0LjggMTUuMwpRIDE0LjUyODMyMDMxMjUgMTIuMTIxNjc5Njg3NSAxNC44NSA4LjgKTCAxNi4xNSA4LjgKUSAxNy4xOTg0Mzc1IDguODI4NzEwOTM3NSAxNy40NSA3LjkgMTcuNTIzNjMyODEyNSA3Ljc1MTE3MTg3NSAxNy41IDcuNiAxNy41MjUgNy41NSAxNy41IDcuNDUgMTcuNTQ3NDYwOTM3NSA2Ljg0NDUzMTI1IDE3LjA1IDYuMjUKTCAxMy4yIDIuMgpRIDEyLjc1NTA3ODEyNSAxLjQ5ODI0MjE4NzUgMTIuMSAxLjU1IFoiLz4KPC9nPgoKPGcgaWQ9IkxheWVyMF8wX0ZJTEwiPgo8cGF0aCBmaWxsPSIjRkZGRkZGIiBzdHJva2U9Im5vbmUiIGQ9IgpNIDE2LjM1IDYuODUKTCAxMi40NSAyLjc1ClEgMTIuMyAyLjUgMTIuMSAyLjUgMTEuOSAyLjUgMTEuNyAyLjc1CkwgNy44NSA2Ljg1ClEgNy42NSA3IDcuNjUgNy4yIDcuNjUgNy44NSA4LjMgNy44NQpMIDEwLjEgNy44NQpRIDEwLjY1IDEyLjQgMTAuMSAxNi4yNQpMIDguMSAxNi4yClEgNy43NSAxNi4yIDcuNjUgMTYuNSA3LjYgMTYuNTUgNy42IDE2LjY1IDcuNiAxNi45IDcuOSAxNy4yNQpMIDExLjc1IDIxLjQKUSAxMS45IDIxLjY1IDEyLjEgMjEuNjUgMTIuMyAyMS42NSAxMi41NSAyMS40CkwgMTYuNCAxNy4yNQpRIDE2LjYgMTcuMSAxNi42IDE2LjkgMTYuNiAxNi4yNSAxNS45NSAxNi4yNQpMIDE0IDE2LjI1ClEgMTMuNSAxMi4xNSAxNCA3LjkKTCAxNi4xNSA3LjkKUSAxNi41IDcuOSAxNi42IDcuNiAxNi42IDcuNTUgMTYuNiA3LjQ1IDE2LjYgNy4xNSAxNi4zNSA2Ljg1IFoiLz4KPC9nPgo8L2RlZnM+Cgo8ZyBpZD0iTGF5ZXJfMyI+CjxnIHRyYW5zZm9ybT0ibWF0cml4KCAxLCAwLCAwLCAxLCAwLDApICI+Cjx1c2UgeGxpbms6aHJlZj0iI0xheWVyMV8wX0ZJTEwiLz4KPC9nPgo8L2c+Cgo8ZyBpZD0iYXN5bmNfc3ZnIj4KPGcgdHJhbnNmb3JtPSJtYXRyaXgoIDEsIDAsIDAsIDEsIDAsMCkgIj4KPHVzZSB4bGluazpocmVmPSIjTGF5ZXIwXzBfRklMTCIvPgo8L2c+CjwvZz4KPC9zdmc+Cg==';

  const LoopIcon = './static/blocks-media/repeat.svg';
  const BlueFlagIcon = './static/blocks-media/blue-flag.svg';

  function span(text) {
    // Copied from jwArray, jwVector

    let el = document.createElement('span');
    el.innerHTML = text;
    el.style.display = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.width = '100%';
    el.style.textAlign = 'center';
    return el;
  }

  function escapeHTML(unsafe) {
    // Copied from jwTargets

    return unsafe
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Copied from: https://github.com/PenguinMod/PenguinMod-Vm/blob/develop/src/util/uid.js
  const soup_ = '!#%()*+,-./:;=?@[]^_`{|}~' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const uid = function () {
    const length = 20;
    const soupLength = soup_.length;
    const id = [];
    for (let i = 0; i < length; i++) {
      id[i] = soup_.charAt(Math.random() * soupLength);
    }
    return id.join('');
  };

  class ThreadType {
    customId = 'soupThread';

    thread = null;

    static serialize(thread) {
      return [];
    }

    static unserialize(serializedThread) {
      return new ThreadType(); // Maybe make threads serializable at some point
    }

    static toThread(thread) {
      if (thread instanceof ThreadType) {
        return thread;
      }
      return new ThreadType();
    }

    constructor(thread = null) {
      this.thread = thread;

      if (this.thread !== null && !('soupThreadId' in this.thread)) {
        this.thread.soupThreadId = uid();
      }
    }

    getHeader() {
      if (this.thread === null) {
        return `Null thread`;
      }
      let result = `${ThreadStatus[this.thread.status]} thread`;
      try {
        result += ` in ${this.thread.target.sprite.name}`;
      } catch {
        return result;
      }
      if (!this.thread.target.isOriginal) {
        result += ` (clone)`;
      }
      return result;
    }

    getId() {
      if (this.thread === null) {
        return 'undefined';
      }
      return this.thread.soupThreadId;
    }

    toString() {
      return `Thread ${this.getId()}`;
    }

    toJSON() {
      return this.toString();
    }

    toShortString() {
      if (this.thread === null) {
        return `Thread<Null>`;
      }
      try {
        return `Thread<${escapeHTML(this.thread.target.sprite.name)}>`;
      } catch {
        return `Thread<Unknown>`;
      }
    }

    toReporterContent() {
      return span(`${escapeHTML(this.getHeader())}<br><small style="font-family: Consolas, 'Courier New', monospace;">${escapeHTML(this.getId())}</small>`);
    }

    toMonitorContent() {
      return this.toReporterContent();
    }

    toListItem() {
      return span(`${escapeHTML(this.getHeader())} <small style="font-family: Consolas, 'Courier New', monospace;">${escapeHTML(this.getId())}</small>`);
    }

    jwArrayHandler() {
      return escapeHTML(this.toShortString());
    }

    dogeiscutObjectHandler() {
      return `<span style="white-space: nowrap;">${escapeHTML(this.getHeader())} <small style="font-family: Consolas, 'Courier New', monospace;">${escapeHTML(this.getId())}</small></span>`;
    }

    toListEditor() {
      // Should never change after the thread object is constructed.
      // Does not need to be escaped.
      return `Thread ${this.getId()}`;
    }

    fromListEditor(edit) {
      if (edit === this.toListEditor()) {
        return this;
      }
      return edit;
    }

    deadThreadWasKilled() {
      // Should only be called if the thread is known to be dead.

      // Thread is considered killed if its status is not "completed"
      // because dead threads are only not "completed" if they are
      // in limbo.
      return this.thread.isKilled || this.thread.status !== 4;
    }
  }

  const Thread = {
    Type: ThreadType,
    Block: {
        blockType: Scratch.BlockType.REPORTER,
        blockShape: Scratch.BlockShape.ARROW,
        forceOutputType: 'soupThread',
        disableMonitor: true,
    },
    Argument: {
        shape: Scratch.BlockShape.ARROW,
        check: ['soupThread'],
        exemptFromNormalization: true,
    }
  }

  const BooleanBlock = {
    blockType: Scratch.BlockType.BOOLEAN,
    disableMonitor: true,
  }

  const ReporterBlock = {
    blockType: Scratch.BlockType.REPORTER,
    disableMonitor: true,
  }

  const CommandBlock = {
    blockType: Scratch.BlockType.COMMAND,
  }

  const MessageArgument = {
    type: Scratch.ArgumentType.BROADCAST,
    exemptFromNormalization: true,
    defaultValue: 'message1',
  }

  const EmptyArgument = {
    exemptFromNormalization: true,
  }

  const ThreadStatus = {
    0: 'Running',
    1: 'Waiting for promise',
    2: 'Yielded',
    3: 'Yielded for one tick',
    4: 'Completed',
    5: 'Suspended',
  }

  class SoupThreadsUtil {

    ThreadType = ThreadType;
    ThreadStatus = ThreadStatus;

    uid = uid;

    static handleIndexInput(INDEX, insertMode = false, constrain = false) {
      // If insertMode is true, the "end" index will select the index after the last index.

      // Convert index to a 1-based integer
      switch (INDEX) {
        case 'start':
        case 'before start':
          INDEX = 1;
          break;

        case 'end':
        case 'after end':
          INDEX = 0;
          break;

        case 'previous index':
        case 'before previous':
          INDEX = runtime.sequencer.activeThreadIndex;
          break;

        case 'active index':
        case 'before active':
          INDEX = runtime.sequencer.activeThreadIndex + 1;
          break;

        case 'next index':
        case 'before next':
          INDEX = runtime.sequencer.activeThreadIndex + 2;
          break;

        default:
          INDEX = Scratch.Cast.toNumber(INDEX);
          INDEX = Math.floor(INDEX);
      }

      // Index 0 means "end", otherwise index is 1-based
      let end = runtime.threads.length - 1 + insertMode;
      let unconstrained = INDEX === 0 ? end : INDEX - 1;
      return constrain ? Math.max(0, Math.min(unconstrained, end)) : unconstrained;
    }

  }

  class SoupThreadsExtension {

    constructor() {
      // Register compiled blocks
      runtime.registerCompiledExtensionBlocks('soupThreads', this.getCompileInfo());

      // Store reference to SoupThreadsUtil
      vm.SoupThreadsUtil = SoupThreadsUtil;

      // Register thread type
      vm.SoupThreads = Thread;
      runtime.registerSerializer(
          'soupThread',
          Thread.Type.serialize,
          Thread.Type.unserialize,
      );

      // Load dependencies
      if (!vm.jwArray) { vm.extensionManager.loadExtensionIdSync('jwArray'); }
      if (!vm.jwTargets) { vm.extensionManager.loadExtensionIdSync('jwTargets'); }
      jwArray = vm.jwArray;
      jwTargets = vm.jwTargets;

      // Register event listeners
      runtime.on('BEFORE_EXECUTE', function() {
        // Runs before every frame

        // Mimics this line from sequencer.js: https://github.com/PenguinMod/PenguinMod-Vm/blob/b88731f3f93ed36d2b57024f8e8d758b6b60b54e/src/engine/sequencer.js#L74
        runtime.sequencer.soupThreadsWorkTime = 0.75 * runtime.currentStepTime;
      });
    }

    getInfo() {
      return {
        id: 'soupThreads',
        name: 'Threads',
        docsURI: 'https://github.com/the-can-of-soup/pm_threads/blob/main/docs/Documentation.md',
        color1: '#45c010',
        blocks: [
          {
            opcode: 'currentThread',
            text: 'active thread',
            ...Thread.Block,
          },
          {
            opcode: 'currentThreadIdx',
            text: 'active index',
            ...ReporterBlock,
          },
          {
            opcode: 'nullThread',
            text: 'null thread',
            ...Thread.Block,
          },
          /*
          {
            opcode: 'firstThread',
            text: '(not implemented) first thread',
            ...Thread.Block,
          },
          {
            opcode: 'lastThread',
            text: '(not implemented) last thread',
            ...Thread.Block,
          },
          */
          {
            opcode: 'threadAt',
            text: 'thread at [INDEX]',
            ...Thread.Block,
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 'start',
              },
            }
          },

          '---',

          {
            opcode: 'builderNoReturn',
            text: ['(not implemented) new thread in [TARGET] moved to [INDEX]', '[ICON]'],
            alignments: [
              null, // text
              null, // branch
              Scratch.ArgumentAlignment.RIGHT, // icon
            ],
            ...CommandBlock,
            branches: [{}],
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'indexInsert',
                defaultValue: 'after end',
              },
              TARGET: {
                shape: jwTargets.Argument.shape, // Do not include "check" parameter from jwTargets.Argument because that breaks menu
                exemptFromNormalization: true,
                // fillIn: 'menu_target',
                menu: 'target',
              },
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: AsyncIcon,
              },
            }
          },
          {
            opcode: 'builder',
            text: ['(not implemented) new thread in [TARGET] moved to [INDEX]', '[ICON]'],
            alignments: [
              null, // text
              null, // branch
              Scratch.ArgumentAlignment.RIGHT, // icon
            ],
            ...Thread.Block,
            branches: [{}],
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'indexInsert',
                defaultValue: 'after end',
              },
              TARGET: {
                shape: jwTargets.Argument.shape, // Do not include "check" parameter from jwTargets.Argument because that breaks menu
                exemptFromNormalization: true,
                // fillIn: 'menu_target',
                menu: 'target',
              },
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: AsyncIcon,
              },
            }
          },

          '---',

          {
            opcode: 'getTarget',
            text: 'target of [THREAD]',
            ...jwTargets.Block,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'getId',
            text: 'id of [THREAD]',
            ...ReporterBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'getStatus',
            text: 'status [STATUSFORMAT] of [THREAD]',
            ...ReporterBlock,
            arguments: {
              THREAD: Thread.Argument,
              STATUSFORMAT: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                menu: 'statusFormat',
                defaultValue: '#',
              }
            }
          },
          {
            opcode: 'getIndex',
            text: 'index of [THREAD]',
            ...ReporterBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'threadsEqual',
            text: '[THREADONE] is [THREADTWO]',
            ...BooleanBlock,
            arguments: {
              THREADONE: Thread.Argument,
              THREADTWO: Thread.Argument,
            }
          },
          {
            opcode: 'isThread',
            text: '[VALUE] is a thread?',
            ...BooleanBlock,
            arguments: {
              VALUE: EmptyArgument,
            }
          },
          {
            opcode: 'isNull',
            text: '[THREAD] is null?',
            ...BooleanBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'isRunning',
            text: '[THREAD] is alive?',
            ...BooleanBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'isFinished',
            text: '[THREAD] exited naturally?',
            ...BooleanBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'isKilled',
            text: '[THREAD] was killed?',
            ...BooleanBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'isPaused',
            text: '(not implemented) [THREAD] is suspended?',
            ...BooleanBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'isStackClick',
            text: '[THREAD] was started by clicking in the editor?',
            ...BooleanBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'yield',
            text: 'yield to next thread',
            ...CommandBlock,
          },
          {
            opcode: 'multiYield',
            text: 'yield [TIMES] times',
            ...CommandBlock,
            arguments: {
              TIMES: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 30,
              },
            }
          },
          {
            opcode: 'yieldBack',
            text: 'yield to previous thread',
            ...CommandBlock,
          },
          /*
          {
            opcode: 'yieldTo',
            text: '(not implemented) yield to [THREAD]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          */
          {
            opcode: 'yieldToThread',
            text: 'yield to [ACTIVETHREAD]',
            ...CommandBlock,
            arguments: {
              ACTIVETHREAD: Thread.Argument,
            }
          },
          {
            opcode: 'yieldToIndex',
            text: 'yield to thread at [ACTIVEINDEX]',
            ...CommandBlock,
            arguments: {
              ACTIVEINDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 'start',
              },
            }
          },
          {
            opcode: 'yieldToEnd',
            text: 'yield to end of tick',
            ...CommandBlock,
          },

          '---',

          {
            opcode: 'broadcastAt',
            text: '(not implemented) broadcast [MESSAGE] to [INDEX]',
            ...CommandBlock,
            arguments: {
              MESSAGE: MessageArgument,
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'indexInsert',
                defaultValue: 'after end',
              },
            }
          },
          {
            opcode: 'broadcastAtAndWait',
            text: '(not implemented) broadcast [MESSAGE] to [INDEX] and wait',
            ...CommandBlock,
            arguments: {
              MESSAGE: MessageArgument,
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'indexInsert',
                defaultValue: 'after end',
              },
            }
          },
          {
            opcode: 'broadcastAtomic',
            text: '(not implemented) run [MESSAGE] immediately and return',
            ...CommandBlock,
            arguments: {
              MESSAGE: MessageArgument,
            }
          },
          {
            opcode: 'getLastBroadcastThreads',
            text: '(not implemented) last broadcast',
            ...jwArray.Block,
          },
          {
            opcode: 'getLastBroadcastFirstThread',
            text: '(not implemented) last broadcast',
            ...Thread.Block,
          },

          '---',

          {
            opcode: 'killThread',
            text: '(not implemented) kill thread [THREAD]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'pauseThread',
            text: '(not implemented) suspend thread [THREAD]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'unpauseThread',
            text: '(not implemented) resume thread [THREAD]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'getThreads',
            ...jwArray.Block,
            disableMonitor: false,
            text: 'threads',
          },
          {
            opcode: 'getThreadsInTarget',
            ...jwArray.Block,
            text: '(not implemented) threads in [TARGET]',
            arguments: {
              TARGET: {
                ...jwTargets.Argument,
                exemptFromNormalization: true, // not included in jwTargets.Argument for some reason
              },
            }
          },
          {
            opcode: 'setRunningThreadsActiveIndex',
            text: '(not implemented) set threads to [THREADS] with active index [ACTIVEINDEX]',
            ...CommandBlock,
            arguments: {
              THREADS: jwArray.Argument,
              ACTIVEINDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 'start',
              },
            }
          },
          {
            opcode: 'setRunningThreadsActiveThread',
            text: '(not implemented) set threads to [THREADS] with active thread [ACTIVETHREAD]',
            ...CommandBlock,
            arguments: {
              THREADS: jwArray.Argument,
              ACTIVETHREAD: Thread.Argument,
            }
          },
          {
            opcode: 'moveThread',
            text: '(not implemented) move thread [THREAD] to [INDEX]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'indexInsert',
                defaultValue: 'after end',
              },
            }
          },
          {
            opcode: 'swapThreads',
            text: '(not implemented) swap thread [THREADONE] with [THREADTWO]',
            ...CommandBlock,
            arguments: {
              THREADONE: Thread.Argument,
              THREADTWO: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'repeatAtomic',
            text: ['repeat [TIMES] without yielding', '[ICON]'],
            alignments: [
              null, // text
              null, // branch
              Scratch.ArgumentAlignment.RIGHT, // icon
            ],
            ...CommandBlock,
            branches: [{}],
            arguments: {
              TIMES: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 10,
              },
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: LoopIcon,
              },
            }
          },
          {
            opcode: 'repeatUntilAtomic',
            text: ['repeat until [CONDITION] without yielding', '[ICON]'],
            alignments: [
              null, // text
              null, // branch
              Scratch.ArgumentAlignment.RIGHT, // icon
            ],
            ...CommandBlock,
            branches: [{}],
            arguments: {
              CONDITION: {
                type: Scratch.ArgumentType.BOOLEAN,
                exemptFromNormalization: true,
              },
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: LoopIcon,
              },
            }
          },
          {
            opcode: 'repeatWhileAtomic',
            text: ['while [CONDITION] without yielding', '[ICON]'],
            alignments: [
              null, // text
              null, // branch
              Scratch.ArgumentAlignment.RIGHT, // icon
            ],
            ...CommandBlock,
            branches: [{}],
            arguments: {
              CONDITION: {
                type: Scratch.ArgumentType.BOOLEAN,
                exemptFromNormalization: true,
              },
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: LoopIcon,
              },
            }
          },
          {
            opcode: 'repeatForeverAtomic',
            text: ['forever without yielding', '[ICON]'],
            alignments: [
              null, // text
              null, // branch
              Scratch.ArgumentAlignment.RIGHT, // icon
            ],
            ...CommandBlock,
            branches: [{}],
            isTerminal: true,
            arguments: {
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: LoopIcon,
              },
            }
          },

          '---',

          {
            opcode: 'getThreadVar',
            text: '(not implemented) get [VARIABLE] in [THREAD]',
            ...ReporterBlock,
            allowDropAnywhere: true,
            arguments: {
              VARIABLE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo',
              },
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'setThreadVar',
            text: '(not implemented) set [VARIABLE] in [THREAD] to [VALUE]',
            ...CommandBlock,
            arguments: {
              VARIABLE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo',
              },
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'bar',
              },
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'getThreadVarNames',
            text: '(not implemented) variables in [THREAD]',
            ...jwArray.Block,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'deleteThreadVar',
            text: '(not implemented) delete [VARIABLE] in [THREAD]',
            ...CommandBlock,
            arguments: {
              VARIABLE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo',
              },
              THREAD: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'afterDeath',
            text: '(not implemented) immediately after [THREAD] dies',
            blockType: Scratch.BlockType.HAT,
            isEdgeActivated: false,
            shouldRestartExistingThreads: false, // While there is already a thread alive from this hat, repeated events will be ignored.
            arguments: {
              THREAD: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'getTickOverall',
            text: '(not implemented) tick # from init',
            ...ReporterBlock,
            disableMonitor: false,
          },
          {
            opcode: 'getFrameOverall',
            text: '(not implemented) frame # from init',
            ...ReporterBlock,
            disableMonitor: false,
          },
          {
            opcode: 'getTick',
            text: '(not implemented) tick # from [BLUEFLAG]',
            ...ReporterBlock,
            disableMonitor: false,
            arguments: {
              BLUEFLAG: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: BlueFlagIcon,
              },
            }
          },
          {
            opcode: 'getFrame',
            text: '(not implemented) frame # from [BLUEFLAG]',
            ...ReporterBlock,
            disableMonitor: false,
            arguments: {
              BLUEFLAG: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: BlueFlagIcon,
              },
            }
          },
          {
            opcode: 'getTickInFrame',
            text: '(not implemented) tick # this frame',
            ...ReporterBlock,
            disableMonitor: false,
            arguments: {
              BLUEFLAG: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: BlueFlagIcon,
              },
            }
          },

          '---',

          {
            opcode: 'getWarpMode',
            text: 'warp mode',
            ...BooleanBlock,
          },
          {
            opcode: 'setWarpModeFor',
            text: '(not implemented) [SETBOOLEAN] warp mode for',
            ...CommandBlock,
            branches: [{}],
            arguments: {
              SETBOOLEAN: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                menu: 'setBoolean',
                defaultValue: 'enable',
              },
            }
          },

          '---',

          {
            opcode: 'getGraphicsUpdated',
            text: 'graphics updated',
            ...BooleanBlock,
          },
          {
            opcode: 'setGraphicsUpdated',
            text: 'set graphics updated to [VALUE]',
            ...CommandBlock,
            arguments: {
              VALUE: {
                type: Scratch.ArgumentType.BOOLEAN,
                exemptFromNormalization: true,
              },
            }
          },

          { blockType: Scratch.BlockType.LABEL, text: "Threads - DANGEROUS" },

          {
            opcode: 'getWorkTime',
            text: 'work time',
            ...ReporterBlock,
            disableMonitor: false,
          },
          {
            opcode: 'getWorkTimer',
            text: 'work timer',
            ...ReporterBlock,
            disableMonitor: false,
          },
          {
            opcode: 'setWorkTimer',
            text: 'set work timer to [TIME]',
            ...CommandBlock,
            arguments: {
              TIME: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 0,
              },
            }
          },
        ],
        menus: {
          index: {
            acceptReporters: true,
            items: [
              {
                text: 'start',
                value: 'start',
              },
              {
                text: 'end',
                value: 'end',
              },
              {
                text: 'previous index',
                value: 'previous index',
              },
              {
                text: 'active index',
                value: 'active index',
              },
              {
                text: 'next index',
                value: 'next index',
              },
              {
                text: '(you can put an index here)',
                value: '(you can put an index here)',
              },
            ],
          },
          indexInsert: {
            acceptReporters: true,
            items: [
              {
                text: 'before start',
                value: 'before start',
              },
              {
                text: 'after end',
                value: 'after end',
              },
              {
                text: 'before previous',
                value: 'before previous',
              },
              {
                text: 'before active',
                value: 'before active',
              },
              {
                text: 'before next',
                value: 'before next',
              },
              {
                text: '(you can put an index here)',
                value: '(you can put an index here)',
              },
            ],
          },
          target: {
            acceptReporters: true,
            items: 'getTargetMenu',
          },
          statusFormat: {
            acceptReporters: false,
            items: [
              {
                text: '#',
                value: '#',
              },
              {
                text: 'text',
                value: 'text',
              },
            ]
          },
          setBoolean: {
            acceptReporters: false,
            items: [
              {
                text: 'disable',
                value: 'disable',
              },
              {
                text: 'enable',
                value: 'enable',
              },
            ]
          }
        },
      };
    }

    getTargetMenu() {
      let menuItems = [{
        text: 'this target',
        value: 'this target',
      }];

      for (let i = 0; i < runtime.targets.length; i++) {
        let target = runtime.targets[i];
        let sprite = target.sprite;
        if (target.isOriginal) {
          menuItems.push({
            text: sprite.name,
            value: target.id,
          });
        }
      }

      return menuItems;
    }

    getCompileInfo() {
      return {
        ir: {

          yield(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
            };
          },

          multiYield(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
              args: {
                TIMES: generator.descendInputOfBlock(block, 'TIMES'),
              }
            };
          },

          yieldBack(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
            };
          },

          yieldToThread(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
              args: {
                ACTIVETHREAD: generator.descendInputOfBlock(block, 'ACTIVETHREAD'),
              }
            };
          },

          yieldToIndex(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
              args: {
                ACTIVEINDEX: generator.descendInputOfBlock(block, 'ACTIVEINDEX'),
              }
            };
          },

          yieldToEnd(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
            };
          },



          repeatAtomic(generator, block) {
            return {
              kind: 'stack',
              args: {
                TIMES: generator.descendInputOfBlock(block, 'TIMES'),
                SUBSTACK: generator.descendSubstack(block, 'SUBSTACK'),
              }
            };
          },

          repeatUntilAtomic(generator, block) {
            return {
              kind: 'stack',
              args: {
                CONDITION: generator.descendInputOfBlock(block, 'CONDITION'),
                SUBSTACK: generator.descendSubstack(block, 'SUBSTACK'),
              }
            };
          },

          repeatWhileAtomic(generator, block) {
            return {
              kind: 'stack',
              args: {
                CONDITION: generator.descendInputOfBlock(block, 'CONDITION'),
                SUBSTACK: generator.descendSubstack(block, 'SUBSTACK'),
              }
            };
          },

          repeatForeverAtomic(generator, block) {
            return {
              kind: 'stack',
              args: {
                SUBSTACK: generator.descendSubstack(block, 'SUBSTACK'),
              }
            };
          },



          getWarpMode(generator, block) {
            return {
              kind: 'input',
            };
          },

        },
        js: {

          yield(node, compiler, imports) {
            compiler.source += `
              {
                yield;
              }
            `;
          },

          multiYield(node, compiler, imports) {
            compiler.source += `
              {
                let TIMES = ${compiler.descendInput(node.args.TIMES).asNumber()};

                for (let i = 0; i < TIMES; i++) {
                  yield;
                }
              }
            `;
          },

          yieldBack(node, compiler, imports) {
            compiler.source += `
              {
                // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value
                // Will yield to end of the tick if the current thread is at the start.
                if (runtime.sequencer.activeThreadIndex <= 0) {
                  runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;
                } else {
                  runtime.sequencer.activeThreadIndex -= 2;
                }

                yield;
              }
            `;
          },

          yieldToThread(node, compiler, imports) {
            compiler.source += `
              {
                let ACTIVETHREAD = vm.SoupThreads.Type.toThread(${compiler.descendInput(node.args.ACTIVETHREAD).asUnknown()});

                let threadIndex;
                if (ACTIVETHREAD.thread !== null && (threadIndex = runtime.threads.indexOf(ACTIVETHREAD.thread)) !== -1) {
                  // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value
                  runtime.sequencer.activeThreadIndex = threadIndex - 1;

                  yield;
                }
              }
            `;
          },

          yieldToIndex(node, compiler, imports) {
            compiler.source += `
              {
                let ACTIVEINDEX = vm.SoupThreadsUtil.handleIndexInput(${compiler.descendInput(node.args.ACTIVEINDEX).asUnknown()});

                // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value
                if (ACTIVEINDEX < 0) {
                  // yield to first thread
                  runtime.sequencer.activeThreadIndex = -1;
                } else if (ACTIVEINDEX >= runtime.threads.length) {
                  // yield to end of tick
                  runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;
                } else {
                  runtime.sequencer.activeThreadIndex = ACTIVEINDEX - 1;
                }

                yield;
              }
            `;
          },

          yieldToEnd(node, compiler, imports) {
            compiler.source += `
              {
                // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value
                runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;

                yield;
              }
            `;
          },



          repeatAtomic(node, compiler, imports) {
            compiler.source += `
              {
                let TIMES = ${compiler.descendInput(node.args.TIMES).asNumber()};

                for (let i = 0; i < TIMES; i++) {
            `;
            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads_repeatAtomic')); // true means this is a loop
            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `
                if (isStuck()) {
                  yield;
                }
              `;
            }
            compiler.source += `
                }
              }
            `;
          },

          repeatUntilAtomic(node, compiler, imports) {
            compiler.source += `
              {
                while (!(${compiler.descendInput(node.args.CONDITION).asBoolean()})) {
            `;
            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads_repeatUntilAtomic')); // true means this is a loop
            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `
                if (isStuck()) {
                  yield;
                }
              `;
            }
            compiler.source += `
                }
              }
            `;
          },

          repeatWhileAtomic(node, compiler, imports) {
            compiler.source += `
              {
                while (${compiler.descendInput(node.args.CONDITION).asBoolean()}) {
            `;
            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads_repeatWhileAtomic')); // true means this is a loop
            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `
                if (isStuck()) {
                  yield;
                }
              `;
            }
            compiler.source += `
                }
              }
            `;
          },

          repeatForeverAtomic(node, compiler, imports) {
            compiler.source += `
              {
                while (true) {
            `;
            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads_repeatForeverAtomic')); // true means this is a loop
            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `
                if (isStuck()) {
                  yield;
                }
              `;
            }
            compiler.source += `
                }
              }
            `;
          },



          getWarpMode(node, compiler, imports) {
            return new imports.TypedInput(`${compiler.isWarp}`, imports.TYPE_BOOLEAN);
          },

        },
      };
    }



    currentThread({}, util) {
      return new ThreadType(util.sequencer.activeThread);
    }

    currentThreadIdx({}, util) {
      if (util.sequencer.activeThread === null) {
        return '';
      }
      return util.sequencer.activeThreadIndex + 1;
    }

    nullThread({}, util) {
      return new ThreadType();
    }

    threadAt({INDEX}, util) {
      INDEX = SoupThreadsUtil.handleIndexInput(INDEX);

      if (INDEX < 0 || INDEX >= runtime.threads.length) {
        return new ThreadType();
      }

      return new ThreadType(runtime.threads[INDEX]);
    }



    getTarget({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return '';
      }
      return new jwTargets.Type(THREAD.thread.target.id);
    }

    getId({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      return THREAD.getId();
    }

    getStatus({THREAD, STATUSFORMAT}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return '';
      }
      if (STATUSFORMAT === 'text') {
        return ThreadStatus[THREAD.thread.status];
      }
      return THREAD.thread.status;
    }

    getIndex({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return '';
      }

      let threadIndex;
      if ((threadIndex = runtime.threads.indexOf(THREAD.thread)) !== -1) {
        return threadIndex + 1;
      }

      return '';
    }



    threadsEqual({THREADONE, THREADTWO}, util) {
      THREADONE = ThreadType.toThread(THREADONE);
      THREADTWO = ThreadType.toThread(THREADTWO);

      return THREADONE.getId() === THREADTWO.getId();
    }

    isThread({VALUE}, util) {
      return VALUE instanceof ThreadType;
    }

    isNull({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      return THREAD.thread === null;
    }

    isRunning({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return false;
      }

      // Returns true if:
      //
      // - The thread is in the threads list (it died this tick if its status is 4).
      // - The thread's status is not 4.

      return runtime.threads.includes(THREAD.thread) && THREAD.thread.status !== 4;
    }

    isFinished({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if(THREAD.thread === null) {
        return false;
      }
      
      // Returns true if:
      //
      // - The thread is not in the threads list (it is dead).
      // - The thread was not killed.
      // OR
      // - The thread *is* in the threads list (it died this tick if its status is 4).
      // - The thread's status is 4.

      if (runtime.threads.includes(THREAD.thread)) {
        return THREAD.thread.status === 4;
      }
      if (THREAD.deadThreadWasKilled()) {
        return false;
      }
      return true;
    }

    isKilled({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return false;
      }

      // Returns true if:
      //
      // - The thread is not in the threads list (it is dead).
      // - The thread was killed.

      // Order of AND swapped for optimization, but should be read in reverse.
      return THREAD.deadThreadWasKilled() && !runtime.threads.includes(THREAD.thread);
    }

    isStackClick({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return false;
      }
      return THREAD.thread.stackClick;
    }



    getThreads({}, util) {
      return new jwArray.Type(runtime.threads.map((rawThread) => new ThreadType(rawThread)));
    }



    getGraphicsUpdated({}, util) {
      return runtime.redrawRequested;
    }

    setGraphicsUpdated({VALUE}, util) {
      VALUE = Scratch.Cast.toBoolean(VALUE);

      runtime.redrawRequested = VALUE;
    }



    getWorkTimer({}, util) {
      return util.sequencer.timer.timeElapsed() / 1000;
    }

    getWorkTime({}, util) {
      // Fall back to calculating work time immediately instead of at the start of the frame
      return (util.sequencer.soupThreadsWorkTime ?? 0.75 * runtime.currentStepTime) / 1000;
    }

    setWorkTimer({TIME}, util) {
      TIME = Scratch.Cast.toNumber(TIME);

      if (util.sequencer.timer._pausedTime !== null) {
        util.sequencer.timer._pausedTime = TIME * 1000;
      } else {
        util.sequencer.timer.startTime = util.sequencer.timer.relativeTime() - TIME * 1000;
      }
    }

  }

  if (Scratch.extensions.isPenguinMod) {
    if (Scratch.extensions.unsandboxed) {
      Scratch.extensions.register(new SoupThreadsExtension());
    } else {
      alert('Please load Threads unsandboxed.');
      throw new Error('Soup\'s Threads extension attempted to be loaded sandboxed');
    }
  } else {
    alert('Threads only supports PenguinMod.');
    throw new Error('Soup\'s Threads extension attempted to be loaded outside of PenguinMod');
  }

})(Scratch);
