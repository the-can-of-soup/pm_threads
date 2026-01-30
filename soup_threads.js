// Name: Threads
// ID: soupThreads
// Description: Take full control of the sequencer so you can fix all of those pesky one-frame-off bugs.
// By: soup
// License: MIT

// GitHub repo: https://github.com/the-can-of-soup/pm_threads



// TO-DO
//
// [ ] Change all implemented yield blocks to compiled
// [ ] Fix behavior when the first thread uses yieldBack
// [ ] Fix weird bug where `(running threads)` result desyncs from `vm.runtime.threads`. Maybe `vm` or `vm.runtime` are being swapped for different objects?
//     (maybe fixed by using `util.sequencer` in every block instead of having `const sequencer = vm.runtime.sequencer;` at the start?)

// NOTES
//
// graphics-updated is stored in vm.runtime.redrawRequested
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

  const ThreadStatus = {
    0: 'Running',
    1: 'Waiting for promise',
    2: 'Yielded',
    3: 'Yielded for one tick',
    4: 'Completed',
    5: 'Suspended',
  }

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
      // because dead threads are only not "completed" if they were killed
      // by a stop all block.
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

  function handleIndexInput(INDEX, goPastEnd = false, constrain = false) {
    // If goPastEnd is true, the "end" index will select the index after the last index.

    INDEX = Scratch.Cast.toNumber(INDEX);
    INDEX = Math.floor(INDEX);

    // Index 0 means "end", otherwise index is 1-based
    let end = runtime.threads.length - 1 + goPastEnd;
    let unconstrained = INDEX === 0 ? end : INDEX - 1;
    return constrain ? Math.max(0, Math.min(unconstrained, end)) : unconstrained;
  }

  class SoupThreadsExtension {

    constructor() {
      // Register compiled blocks
      vm.runtime.registerCompiledExtensionBlocks('soupThreads', this.getCompileInfo());

      // Register serializer for thread type
      vm.soupThreads = Thread;
      vm.runtime.registerSerializer(
          'soupThread',
          Thread.Type.serialize,
          Thread.Type.unserialize,
      );

      // Load dependencies
      if (!vm.jwArray) { vm.extensionManager.loadExtensionIdSync('jwArray'); }
      if (!vm.jwTargets) { vm.extensionManager.loadExtensionIdSync('jwTargets'); }
      jwArray = vm.jwArray;
      jwTargets = vm.jwTargets;
    }

    getInfo() {
      return {
        id: 'soupThreads',
        name: 'Threads',
        docsURI: 'https://github.com/the-can-of-soup/pm_threads/blob/main/Documentation.md',
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
                defaultValue: 1, // start
              },
            }
          },

          '---',

          {
            opcode: 'threadBuilder',
            text: '(not implemented) new thread in [TARGET] at [INDEX]',
            ...Thread.Block,
            branches: [{}],
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 0, // end
              },
              TARGET: {
                shape: jwTargets.Argument.shape, // Do not include "check" parameter from jwTargets.Argument because that breaks menu
                exemptFromNormalization: true,
                // fillIn: 'menu_target',
                menu: 'target',
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
            opcode: 'multiYield',
            text: '(not implemented) yield [TIMES] times',
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
            opcode: 'yield',
            text: 'yield to next thread',
            ...CommandBlock,
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
            text: '(not implemented) yield to [ACTIVETHREAD]',
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
                defaultValue: 1, // start
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
            text: '(not implemented) broadcast [MESSAGE] at [INDEX]',
            ...CommandBlock,
            arguments: {
              MESSAGE: MessageArgument,
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 0, // end
              },
            }
          },
          {
            opcode: 'broadcastAtAndWait',
            text: '(not implemented) broadcast [MESSAGE] at [INDEX] and wait',
            ...CommandBlock,
            arguments: {
              MESSAGE: MessageArgument,
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 0, // end
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
            opcode: 'getRunningThreads',
            ...jwArray.Block,
            text: 'running threads',
          },
          {
            opcode: 'getRunningThreadsInTarget',
            ...jwArray.Block,
            text: '(not implemented) running threads in [TARGET]',
            arguments: {
              TARGET: {
                ...jwTargets.Argument,
                exemptFromNormalization: true, // not included in jwTargets.Argument for some reason
              },
            }
          },
          {
            opcode: 'setRunningThreadsActiveIndex',
            text: '(not implemented) set running threads to [THREADS] with active index [ACTIVEINDEX]',
            ...CommandBlock,
            arguments: {
              THREADS: jwArray.Argument,
              ACTIVEINDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 1, // start
              },
            }
          },
          {
            opcode: 'setRunningThreadsActiveThread',
            text: '(not implemented) set running threads to [THREADS] with active thread [ACTIVETHREAD]',
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
                menu: 'index',
                defaultValue: 0, // end
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
            text: '(not implemented) repeat [TIMES] without yielding',
            blockType: Scratch.BlockType.LOOP,
            arguments: {
              TIMES: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 10,
              },
            }
          },
          {
            opcode: 'repeatUntilAtomic',
            text: '(not implemented) repeat until [CONDITION] without yielding',
            blockType: Scratch.BlockType.LOOP,
            arguments: {
              CONDITION: {
                type: Scratch.ArgumentType.BOOLEAN,
                exemptFromNormalization: true,
              },
            }
          },
          {
            opcode: 'repeatWhileAtomic',
            text: '(not implemented) while [CONDITION] without yielding',
            blockType: Scratch.BlockType.LOOP,
            arguments: {
              CONDITION: {
                type: Scratch.ArgumentType.BOOLEAN,
                exemptFromNormalization: true,
              },
            }
          },
          {
            opcode: 'repeatForeverAtomic',
            text: '(not implemented) forever without yielding',
            blockType: Scratch.BlockType.LOOP,
            isTerminal: true,
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
            opcode: 'getGraphicsUpdated',
            text: '(not implemented) graphics-updated flag',
            ...BooleanBlock,
          },
          {
            opcode: 'setGraphicsUpdated',
            text: '(not implemented) set graphics-updated flag to [VALUE]',
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
            opcode: 'getWorkTimer',
            text: '(not implemented) work timer',
            ...ReporterBlock,
          },
          {
            opcode: 'setWorkTimer',
            text: '(not implemented) set work timer to [TIME]',
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
                value: 1,
              },
              {
                text: 'end',
                value: 0,
              },
              {
                text: '(you can put an index here)',
                value: null,
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

          yieldBack(generator, block) {
            generator.script.yields = true;
            return {
              kind: 'stack',
            };
          },

        },
        js: {

          yield(node, compiler, imports) {
            compiler.source += `
              yield;
            `;
          },

          yieldBack(node, compiler, imports) {
            // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value
            // Will yield to end of the tick if the current thread is at the start.
            compiler.source += `
              if (runtime.sequencer.activeThreadIndex <= 0) {
                runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;
              } else {
                runtime.sequencer.activeThreadIndex -= 2;
              }

              yield;
            `;
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
      INDEX = handleIndexInput(INDEX);

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

      let threadId = THREAD.getId();
      for (let i = 0; i < runtime.threads.length; i++) {
        if (new ThreadType(runtime.threads[i]).getId() === threadId) {
          return i + 1;
        }
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
      return runtime.threads.includes(THREAD.thread);
    }

    isFinished({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if(THREAD.thread === null) {
        return false;
      }
      // Order of AND swapped for optimization, but should be read in reverse.
      return !THREAD.deadThreadWasKilled() && !runtime.threads.includes(THREAD.thread);
    }

    isKilled({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return false;
      }
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



    *yieldToIndex({ACTIVEINDEX}, util) {
      ACTIVEINDEX = handleIndexInput(ACTIVEINDEX);

      // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value
      if (ACTIVEINDEX < 0) {
        // yield to first thread
        util.sequencer.activeThreadIndex = -1;
      } else if (ACTIVEINDEX >= runtime.threads.length) {
        // yield to end of tick
        util.sequencer.activeThreadIndex = runtime.threads.length - 1;
      } else {
        util.sequencer.activeThreadIndex = ACTIVEINDEX - 1;
      }

      yield;
    }

    *yieldToEnd({}, util) {
      // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value
      // yield to end of tick
      util.sequencer.activeThreadIndex = runtime.threads.length - 1;

      yield;
    }



    getRunningThreads({}, util) {
      return new jwArray.Type(runtime.threads.map((rawThread) => new ThreadType(rawThread)));
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
