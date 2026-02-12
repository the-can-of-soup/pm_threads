// Name: Threads
// ID: soupThreads
// Description: Take full control of the sequencer so you can fix all of those pesky one-frame-off bugs.
// By: soup
// License: MIT

// GitHub repo: https://github.com/the-can-of-soup/pm_threads



// TO-DO
//
// - Make all blocks compiled
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
  const RawThreadType = vm.exports.Thread;

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

      if (this.thread !== null) {
        if (!('soupThreadId' in this.thread)) {
          this.thread.soupThreadId = uid();
        }
        if (!('soupThreadVariables' in this.thread)) {
          this.thread.soupThreadVariables = {};
        }
      }
    }

    getHeader() {
      if (this.thread === null) {
        return `Null thread`;
      }
      let result = ThreadStatus[this.thread.status];
      if (this.thread.status !== RawThreadType.STATUS_DONE && !runtime.threads.includes(this.thread)) {
        result += ` (limbo)`;
      }
      result += ` thread`;
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
      // Should only be used if the thread is known to be dead.

      // Thread is considered killed if its status is not "completed"
      // because dead threads are only not "completed" if they are
      // in limbo.
      return this.thread.isKilled || this.thread.status !== RawThreadType.STATUS_DONE;
    }
  }

  const Thread = {
    Type: ThreadType,
    Block: {
        blockType: Scratch.BlockType.REPORTER,
        blockShape: Scratch.BlockShape.ARROW,
        // blockShape: 'soupThreads-wave',
        // blockShape: 'soupThreads-flag',
        forceOutputType: 'soupThread',
        disableMonitor: true,
    },
    Argument: {
        shape: Scratch.BlockShape.ARROW,
        // shape: 'soupThreads-wave',
        // shape: 'soupThreads-flag',
        check: ['soupThread'],
        exemptFromNormalization: true,
    }
  };

  const BooleanBlock = {
    blockType: Scratch.BlockType.BOOLEAN,
    disableMonitor: true,
  };

  const ReporterBlock = {
    blockType: Scratch.BlockType.REPORTER,
    disableMonitor: true,
  };

  const CommandBlock = {
    blockType: Scratch.BlockType.COMMAND,
  };

  const MessageArgument = {
    type: Scratch.ArgumentType.BROADCAST,
    exemptFromNormalization: true,
    defaultValue: 'message1',
  };

  const EmptyArgument = {
    exemptFromNormalization: true,
  };

  const ThreadStatus = {
    [RawThreadType.STATUS_RUNNING]: 'Running',
    [RawThreadType.STATUS_PROMISE_WAIT]: 'Waiting for promise',
    [RawThreadType.STATUS_YIELD]: 'Yielded',
    [RawThreadType.STATUS_YIELD_TICK]: 'Yielded for one tick',
    [RawThreadType.STATUS_DONE]: 'Completed',
    [RawThreadType.STATUS_PAUSED]: 'Suspended',
  };

  const ThreadStatusInternalNames = {
    [RawThreadType.STATUS_RUNNING]: 'STATUS_RUNNING',
    [RawThreadType.STATUS_PROMISE_WAIT]: 'STATUS_PROMISE_WAIT',
    [RawThreadType.STATUS_YIELD]: 'STATUS_YIELD',
    [RawThreadType.STATUS_YIELD_TICK]: 'STATUS_YIELD_TICK',
    [RawThreadType.STATUS_DONE]: 'STATUS_DONE',
    [RawThreadType.STATUS_PAUSED]: 'STATUS_PAUSED',
  }

  class SoupThreadsUtil {

    ThreadType = ThreadType;
    ThreadStatus = ThreadStatus;

    uid = uid;

    /**
     * Converts an arbitrary block input value from an "index" menu to a 0-based index for the threads array.
     * 
     * @static
     * @param {*} INDEX - An arbitrary block input value from an "index" menu.
     * @param {boolean} insertMode - If true, the "end" index will select the index after the last index.
     *     This is to allow inserting to the end of the array.
     * @param {boolean} absoluteMode - If true, relative indexes such as "active index" and "previous index"
     *     will be ignored and instead treated as a generic invalid string.
     * @returns {number} - A 0-based index to be used on the threads array.
     */
    static handleIndexInput(INDEX, insertMode = false, absoluteMode = false, constrain = false) {
      // Convert index to a 1-based integer
      switch (Scratch.Cast.toString(INDEX)) {
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
          if (!absoluteMode) {
            INDEX = runtime.sequencer.activeThreadIndex;
            break;
          }

        case 'active index':
        case 'before active':
          if (!absoluteMode) {
            INDEX = runtime.sequencer.activeThreadIndex + 1;
            break;
          }

        case 'next index':
        case 'before next':
          if (!absoluteMode) {
            INDEX = runtime.sequencer.activeThreadIndex + 2;
            break;
          }

        default:
          INDEX = Scratch.Cast.toNumber(INDEX);
          INDEX = Math.floor(INDEX);
      }

      // Index 0 means "end", otherwise index is 1-based
      let end = runtime.threads.length - 1 + insertMode;
      let unconstrained = INDEX === 0 ? end : INDEX - 1;
      return constrain ? Math.max(0, Math.min(unconstrained, end)) : unconstrained;
    }

    /**
     * Converts an arbitrary block input value from a "target" menu to an ID of an existing target or `null`.
     * 
     * @static
     * @param {*} TARGET - An arbitrary block input value from a "target" menu.
     * @param {Object} thisTarget - The current raw target being operated on.
     * @returns {?string} - ID of an existing target or `null` if input is invalid.
     */
    static handleTargetInput(TARGET, thisTarget) {
      if (Scratch.Cast.toString(TARGET) === 'this target') {
        return thisTarget.id;
      }

      if (!(TARGET instanceof jwTargets.Type)) {
        TARGET = jwTargets.Type.toTarget(TARGET);
      }

      if (vm.runtime.targets.some((rawTarget) => (rawTarget.id === TARGET.targetId))) {
        return TARGET.targetId;
      }
      return null;
    }

    /**
     * Generates the `leftPath` and `rightPath` functions for a custom block shape definition.
     * 
     * @static
     * @param {string} path - An SVG path of the full block shape will all commands relative.
     *     There should be a "l 0 0" command immediately before the first command and after the last command of
     *     both sides.
     *     The "h 0" and "v 0" commands can be used to begin and end an unscaled section respectively.
     *     All commands in an unscaled section (between "h 0" and "v 0") will not have their coordinates scaled as
     *     the block changes size.
     *     Finally, the "c 0 <offset> 0 0 0 0" command pattern indicates that the magnitude of the next
     *     "v" command's parameter should be overwritten by the height of the block minus `offset`. This is intended
     *     to be used for the line separating the top and bottom of the block so that it stretches vertically.
     * @returns {Object} An object containing the `leftPath` and `rightPath` keys; to be merged with the custom
     *     shape definition.
     */
    static generateCustomShapeEdges(path) {
      const RelativePathOpcodes = [
        'm', 'l', 'h', 'v', 'c', 's', 'q', 't', 'a', 'z',
      ];
      const AbsolutePathOpcodes = [
        'M', 'L', 'H', 'V', 'C', 'S', 'Q', 'T', 'A', 'Z',
      ]

      // Split path into commands
      const allWords = path.split(' ');
      let allCommands = [];
      let commandIdx = -1;
      for (let word of allWords) {
        if (AbsolutePathOpcodes.includes(word)) {
          throw new Error('Cannot generate custom shape edges from a path with an absolute command');
        } else if (RelativePathOpcodes.includes(word)) {
          allCommands.push([word]);
          commandIdx += 1;
        } else {
          allCommands[commandIdx].push(word);
        }
      }

      // Split into parts with "l 0 0" command
      // Also remove all "z" commands
      let commandsByPart = [[]];
      let partIdx = 0;
      for (let command of allCommands) {
        if (command[0] === 'l' && command[1] === '0' && command[2] === '0') {
          commandsByPart.push([]);
          partIdx += 1;
        } else if (command[0] !== 'z') {
          commandsByPart[partIdx].push(command);
        }
      }

      // Split into edges (every other part)
      let commandsByEdge = [];
      for (let i = 1; i < commandsByPart.length; i += 2) {
        commandsByEdge.push(commandsByPart[i]);
      }

      // Generate functions for each edge
      let functionsByEdge = [];
      for (let i = 0; i < commandsByEdge.length; i++) {
        const edgeCommands = commandsByEdge[i];
        const isRightEdge = i === 0;

        functionsByEdge.push(function(block) {
          const edgeWidth = isRightEdge ? block.edgeShapeWidth_ : block.height / 2;
          const scalingFactor = edgeWidth / 16;
          const height = edgeWidth * 2;

          // Generate result commands
          let resultCommands = [];
          let unscaledSection = false;
          let separatorLine = false;
          let separatorLineOffset = null;
          for (const command of edgeCommands) {
            let specialCommand = true;

            // Handle special commands
            if (command[0] === 'h' && command[1] === '0') {
              // "h 0" command; begin unscaled section
              unscaledSection = true;
            } else if (command[0] === 'v' && command[1] === '0') {
              // "v 0" command; end unscaled section
              unscaledSection = false;
            } else if (command[0] === 'c' && command[1] === '0' && command[3] === '0' && command[4] === '0' && command[5] === '0' && command[6] === '0') {
              // "c 0 <offset> 0 0 0 0" command pattern
              separatorLineOffset = Number.parseFloat(command[2]);
              separatorLine = true;
            } else {
              specialCommand = false;
            }

            // Handle normal commands
            if (!specialCommand) {
              if (command[0] === 'v' && separatorLine) {
                let sign = Math.sign(Number.parseFloat(command[1]));
                resultCommands.push(['v', (sign * (height - separatorLineOffset)).toString()]);
                separatorLine = false;
              } else if (unscaledSection) {
                resultCommands.push(command);
              } else if (command[0] === 'a') {
                // Arc command; only arguments 0, 1, 5, 6 should be scaled
                let scaledCommand = [command[0]];
                for (let i of [0, 1, 5, 6]) {
                  scaledCommand.push((Number.parseFloat(command[i]) * scalingFactor).toString());
                }
                resultCommands.push(scaledCommand);
              } else {
                // All arguments should be scaled
                let scaledCommand = [command[0]];
                for (let i = 1; i < command.length; i++) {
                  scaledCommand.push((Number.parseFloat(command[i]) * scalingFactor).toString());
                }
                resultCommands.push(scaledCommand);
              }
            }
          }

          // Combine result commands to a string
          let resultCommandStrings = resultCommands.map((command) => (command.join(' ')));
          let resultCommandsAsString = resultCommandStrings.join(' ');
          return [resultCommandsAsString];
        });
      }

      return {
        leftPath: functionsByEdge[1],
        rightPath: functionsByEdge[0],
      };
    }

  }

  class SoupThreadsExtension {

    constructor() {
      // Store reference to SoupThreadsUtil
      vm.SoupThreadsUtil = SoupThreadsUtil;

      // Register compiled blocks
      runtime.registerCompiledExtensionBlocks('soupThreads', this.getCompileInfo());

      // Register custom shapes
      Scratch.gui.getBlockly().then(function(ScratchBlocks) {
        let shapeInfo = SoupThreadsExtension.getShapeInfo(ScratchBlocks);
        for (let shapeId in shapeInfo) {
          ScratchBlocks.BlockSvg.registerCustomShape(`soupThreads-${shapeId}`, shapeInfo[shapeId]);
        }
      });

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

      // Set up state
      runtime.soupThreadsTickFromInit = 0;
      runtime.soupThreadsFrameFromInit = 0;
      runtime.soupThreadsTickFromStart = 0;
      runtime.soupThreadsFrameFromStart = 0;
      runtime.soupThreadsTickWithinFrame = 0;

      // Register event listeners
      runtime.on('BEFORE_EXECUTE', function() {
        // Runs before every frame

        runtime.soupThreadsFrameFromInit += 1;
        runtime.soupThreadsFrameFromStart += 1;

        runtime.soupThreadsTickWithinFrame = 0;

        // Calculate work time
        // Mimics this line from sequencer.js: https://github.com/PenguinMod/PenguinMod-Vm/blob/b88731f3f93ed36d2b57024f8e8d758b6b60b54e/src/engine/sequencer.js#L74
        runtime.sequencer.soupThreadsWorkTime = 0.75 * runtime.currentStepTime;
      });
      runtime.on('BEFORE_TICK', function() {
        // Runs before every tick

        runtime.soupThreadsTickFromInit += 1;
        runtime.soupThreadsTickFromStart += 1;
        runtime.soupThreadsTickWithinFrame += 1;
      });
      runtime.on('PROJECT_START', function() {
        // Runs when blue flag clicked, after state has been reset

        runtime.soupThreadsTickFromStart = 0;
        runtime.soupThreadsFrameFromStart = 0;
      })
    }

    static getShapeInfo(ScratchBlocks) {
      // https://docs.penguinmod.com/development/extensions/api/blocks/custom-block-shape/
      // https://yqnn.github.io/svg-path-editor/

      const BlockSvg = ScratchBlocks.BlockSvg;

      return {

        wave: {
          emptyInputPath: 'm 16 0 h 16 l 0 0 h 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 v 0 c 0 0 0 0 0 0 v 32 h 0 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 v 0 l 0 0 h -16 l 0 0 h 0 c -4 1 -4 2 -8 2 c -8 0 -8 -4 -16 -4 c -4 0 -4 1 -8 2 v 0 c 0 0 0 0 0 0 v -32 h 0 c 4 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 v 0 l 0 0 z',
          emptyInputWidth: 20 * BlockSvg.GRID_UNIT,

          // See docstring of generateCustomShapeEdges for info
          ...SoupThreadsUtil.generateCustomShapeEdges('m 16 0 h 16 l 0 0 h 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 v 0 c 0 0 0 0 0 0 v 32 h 0 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 v 0 l 0 0 h -16 l 0 0 h 0 c -4 1 -4 2 -8 2 c -8 0 -8 -4 -16 -4 c -4 0 -4 1 -8 2 v 0 c 0 0 0 0 0 0 v -32 h 0 c 4 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 v 0 l 0 0 z'),

          // Negative values allow for shape edges to overlap with start and end of block text in reporters
          blockPaddingStart(block, otherShape, firstInput, firstField, row) {
            return -5 * BlockSvg.GRID_UNIT;
          },
          blockPaddingEnd(block, otherShape, lastInput, lastField, row) {
            return -5 * BlockSvg.GRID_UNIT;
          },

          outputLeftPadding(block) {
            let padding = 0;

            // Patches bug where reporter blocks with branches will move to the right as they get taller.
            // Copied from here: https://github.com/Dicuo/Iterators-Extension/blob/849b32e5b1566e2710cfbdffa00d24c1a1e4e94a/Iterators%20Extension.js#L503-L506
            // div got it from jwklong. no clue why this works but lets just roll with it
            let hasASubstack = block.inputList.some(i => i.type == ScratchBlocks.NEXT_STATEMENT);
            if (hasASubstack) {
              padding += -block.height/2 + (5.5 * BlockSvg.GRID_UNIT);
            }

            // Prevents reporters from going off the left edge of the palette.
            padding += (hasASubstack) ? (2.5 * BlockSvg.GRID_UNIT) : (4.5 * BlockSvg.GRID_UNIT);

            return padding;
          },
        },

        flag: {
          // emptyInputPath: 'm 16 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 c 0 0 0 0 0 0 v 32 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 l 0 4 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 l 0 -4 v -32 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 z',
          // emptyInputPath: 'm 4 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 c 0 0 0 0 0 0 v 28 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 l 0 4 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 v -32 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 z',
          emptyInputPath: 'm 4 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 c 0 0 0 0 0 0 v 26 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 l 0 6 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 v -32 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 z',
          emptyInputWidth: 9 * BlockSvg.GRID_UNIT,

          // See docstring of generateCustomShapeEdges for info
          // ...SoupThreadsUtil.generateCustomShapeEdges('m 16 0 h 16 l 0 0 h 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 v 0 c 0 0 0 0 0 0 v 32 h 0 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 v 0 l 0 0 h -16 l 0 0 h 0 c -2 0 -2 -2 -4 -2 l 0 6 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 l 0 -4 v 0 c 0 0 0 0 0 0 v -32 h 0 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 l 0 2 c 2 0 2 -2 4 -2 v 0 l 0 0 z'),
          // ...SoupThreadsUtil.generateCustomShapeEdges('m 16 0 h 16 l 0 0 h 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 v 0 c 0 0 0 0 0 0 v 32 h 0 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 v 0 l 0 0 h -16 l 0 0 h 0 c -6 0 -6 -8 -12 -8 l 0 8 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 v 0 c 0 0 0 0 0 0 v -32 h 0 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 l 0 4 c 6 0 6 -4 12 -4 v 0 l 0 0 z'),
          // ...SoupThreadsUtil.generateCustomShapeEdges('m 16 0 h 16 l 0 0 h 0 c 3 -1 4 -2 8 -2 c 8 0 8 4 16 4 c 4 0 4 -1 8 -2 v 0 c 0 0 0 0 0 0 v 32 h 0 c -4 1 -4 2 -8 2 c -9 0 -9 -4 -16 -4 c -4 0 -4 1 -8 2 v 0 l 0 0 h -16 l 0 0 h 0 l 0 2 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 v 0 v -2 c 0 0 0 0 0 0 v -32 h 0 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 v 0 l 0 0 z'),
          // ...SoupThreadsUtil.generateCustomShapeEdges('m 16 0 h 16 l 0 0 h 0 c 4 1 4 2 8 2 c 4 0 4 -1 8 -2 v 0 c 0 0 0 0 0 0 v 32 h 0 c -4 1 -4 2 -8 2 c -4 0 -4 -1 -8 -2 v 0 l 0 0 h -16 l 0 0 h 0 c -4 -1 -4 -2 -8 -2 c -4 0 -4 1 -8 2 l 0 2 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 v -2 v 0 c 0 0 0 0 0 0 v -32 h 0 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 c 4 -1 4 -2 8 -2 c 4 0 4 1 8 2 v 0 l 0 0 z'),
          ...SoupThreadsUtil.generateCustomShapeEdges('m 16 0 h 16 l 0 0 h 0 c 4 1 4 2 8 2 c 4 0 4 -1 8 -2 v 0 c 0 0 0 0 0 0 v 32 h 0 c -4 1 -4 2 -8 2 c -4 0 -4 -1 -8 -2 v 0 l 0 0 h -16 l 0 0 h 0 c -4 -1 -4 -2 -8 -2 c -4 0 -4 1 -8 2 c 0 1 -1 2 -2 2 c -1 0 -2 -1 -2 -2 v 0 c 0 0 0 0 0 0 v -32 h 0 c 0 -1 1 -2 2 -2 c 1 0 2 1 2 2 c 4 -1 4 -2 8 -2 c 4 0 4 1 8 2 v 0 l 0 0 z'),

          // Negative values allow for shape edges to overlap with start and end of block text in reporters
          blockPaddingStart(block, otherShape, firstInput, firstField, row) {
            return -2.5 * BlockSvg.GRID_UNIT;
          },
          blockPaddingEnd(block, otherShape, lastInput, lastField, row) {
            return -2.5 * BlockSvg.GRID_UNIT;
          },

          outputLeftPadding(block) {
            let padding = 0;

            // Patches bug where reporter blocks with branches will move to the right as they get taller.
            // Copied from here: https://github.com/Dicuo/Iterators-Extension/blob/849b32e5b1566e2710cfbdffa00d24c1a1e4e94a/Iterators%20Extension.js#L503-L506
            // div got it from jwklong. no clue why this works but lets just roll with it
            let hasASubstack = block.inputList.some(i => i.type == ScratchBlocks.NEXT_STATEMENT);
            if (hasASubstack) {
              padding += -block.height/2 + (5.5 * BlockSvg.GRID_UNIT);
            }

            // Aligns reporters to the left edge of the palette.
            padding += (hasASubstack) ? (-0.5 * BlockSvg.GRID_UNIT) : (1.5 * BlockSvg.GRID_UNIT);

            return padding;
          },
        }

      };
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
          /*
          {
            opcode: 'builderSecondSubstackLolwut',
            text: ['(renderer testing) builder with a', 'second substack lolwut??', '[ICON]'],
            alignments: [
              null, // text
              null, // branch
              null, // text 2
              null, // branch 2
              Scratch.ArgumentAlignment.RIGHT, // icon
            ],
            ...Thread.Block,
            branches: [{}, {}],
            arguments: {
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: AsyncIcon,
              },
            }
          },
          */

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
          {
            opcode: 'isMonitor',
            text: '[THREAD] is a monitor updater?',
            ...BooleanBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'killThread',
            text: 'kill [THREAD]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'pauseThread',
            text: '(not implemented) suspend [THREAD]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'unpauseThread',
            text: '(not implemented) resume [THREAD]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
            }
          },

          '---',

          {
            opcode: 'yield',
            text: 'yield',
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
            text: '(not implemented) last broadcast threads',
            ...jwArray.Block,
          },
          {
            opcode: 'getLastBroadcastFirstThread',
            text: '(not implemented) first thread from last broadcast',
            ...Thread.Block,
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
            text: 'threads in [TARGET]',
            arguments: {
              TARGET: {
                shape: jwTargets.Argument.shape, // Do not include "check" parameter from jwTargets.Argument because that breaks menu
                exemptFromNormalization: true,
                // fillIn: 'menu_target',
                menu: 'target',
              },
            }
          },
          {
            opcode: 'setRunningThreadsActiveThread',
            text: 'set threads to [THREADS] and yield to [ACTIVETHREAD]',
            ...CommandBlock,
            arguments: {
              THREADS: jwArray.Argument,
              ACTIVETHREAD: Thread.Argument,
            }
          },
          {
            opcode: 'setRunningThreadsActiveIndex',
            text: 'set threads to [THREADS] and yield to thread at [ACTIVEINDEX]',
            ...CommandBlock,
            arguments: {
              THREADS: jwArray.Argument,
              ACTIVEINDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'indexAbsolute',
                defaultValue: 'start',
              },
            }
          },
          /*
          {
            opcode: 'moveThreadRelative',
            text: '(not implemented) move [THREADONE] to [BEFOREORAFTER] [THREADTWO]',
            ...CommandBlock,
            arguments: {
              THREADONE: Thread.Argument,
              BEFOREORAFTER: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                menu: 'beforeOrAfter',
                defaultValue: 'before',
              },
              THREADTWO: Thread.Argument,
            }
          },
          */
          {
            opcode: 'moveThread',
            text: 'move [THREAD] to [INDEX]',
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
          /*
          {
            opcode: 'moveThreadByIndex',
            text: '(not implemented) move thread at [INDEXONE] to [INDEXTWO]',
            ...CommandBlock,
            arguments: {
              THREAD: Thread.Argument,
              INDEXONE: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 'end',
              },
              INDEXTWO: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'indexInsert',
                defaultValue: 'after end',
              },
            }
          },
          */
          {
            opcode: 'swapThreads',
            text: 'swap [THREADONE] with [THREADTWO]',
            ...CommandBlock,
            arguments: {
              THREADONE: Thread.Argument,
              THREADTWO: Thread.Argument,
            }
          },
          /*
          {
            opcode: 'swapThreadsByIndex',
            text: '(not implemented) swap thread at [INDEXONE] with thread at [INDEXTWO]',
            ...CommandBlock,
            arguments: {
              INDEXONE: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 'end',
              },
              INDEXTWO: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                menu: 'index',
                defaultValue: 'end',
              },
            }
          },
          */

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
            text: 'get [VARIABLE] in [THREAD]',
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
            text: 'set [VARIABLE] in [THREAD] to [VALUE]',
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
            text: 'variables in [THREAD]',
            ...jwArray.Block,
            arguments: {
              THREAD: Thread.Argument,
            }
          },
          {
            opcode: 'deleteThreadVar',
            text: 'delete [VARIABLE] in [THREAD]',
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
            text: 'tick # from init',
            ...ReporterBlock,
            disableMonitor: false,
          },
          {
            opcode: 'getFrameOverall',
            text: 'frame # from init',
            ...ReporterBlock,
            disableMonitor: false,
          },
          {
            opcode: 'getTick',
            text: 'tick # from [BLUEFLAG]',
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
            text: 'frame # from [BLUEFLAG]',
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
            text: 'tick # this frame',
            ...ReporterBlock,
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
            text: '[SETBOOLEAN] warp mode for',
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
            opcode: 'getFrameTime',
            text: 'frame time',
            ...ReporterBlock,
            disableMonitor: false,
          },
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
          indexAbsolute: {
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
          indexInsertAbsolute: {
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
              {
                text: 'internal name',
                value: 'internal name',
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
          },
          beforeOrAfter: {
            acceptReporters: false,
            items: [
              {
                text: 'before',
                value: 'before',
              },
              {
                text: 'after',
                value: 'after',
              },
            ]
          },
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

          killThread(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
              args: {
                THREAD: generator.descendInputOfBlock(block, 'THREAD'),
              }
            };
          },



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



          setRunningThreadsActiveThread(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
              args: {
                THREADS: generator.descendInputOfBlock(block, 'THREADS'),
                ACTIVETHREAD: generator.descendInputOfBlock(block, 'ACTIVETHREAD'),
              }
            };
          },

          setRunningThreadsActiveIndex(generator, block) {
            generator.script.yields = true;

            return {
              kind: 'stack',
              args: {
                THREADS: generator.descendInputOfBlock(block, 'THREADS'),
                ACTIVEINDEX: generator.descendInputOfBlock(block, 'ACTIVEINDEX'),
              }
            };
          },

          moveThread(generator, block) {
            return {
              kind: 'stack',
              args: {
                THREAD: generator.descendInputOfBlock(block, 'THREAD'),
                INDEX: generator.descendInputOfBlock(block, 'INDEX'),
              }
            };
          },

          swapThreads(generator, block) {
            return {
              kind: 'stack',
              args: {
                THREADONE: generator.descendInputOfBlock(block, 'THREADONE'),
                THREADTWO: generator.descendInputOfBlock(block, 'THREADTWO'),
              }
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

          setWarpModeFor(generator, block) {
            return {
              kind: 'stack',
              args: {
                SUBSTACK: generator.descendSubstack(block, 'SUBSTACK'),
              },
              constants: {
                SETBOOLEAN: block.fields.SETBOOLEAN.value,
              },
            };
          },

        },
        js: {

          killThread(node, compiler, imports) {
            let THREAD = compiler.localVariables.next();
            compiler.source += `let ${THREAD} = vm.SoupThreads.Type.toThread(${compiler.descendInput(node.args.THREAD).asUnknown()});`;

            compiler.source += `if (${THREAD}.thread !== null && ${THREAD}.thread.status !== vm.exports.Thread.STATUS_DONE && runtime.threads.includes(${THREAD}.thread)) {`;

            // Sets isKilled to true, sets status to STATUS_DONE, clears some other properties
            compiler.source += `runtime._stopThread(${THREAD}.thread);`;

            // Yield if active thread was killed.
            compiler.source += `let threadIndex = runtime.threads.indexOf(${THREAD}.thread);`;
            compiler.source += `if (threadIndex !== -1 && threadIndex === runtime.sequencer.activeThreadIndex) {`;
            compiler.source += `yield;`;
            compiler.source += `}`;

            compiler.source += `}`;
          },



          yield(node, compiler, imports) {
            compiler.source += `yield;`;
          },

          multiYield(node, compiler, imports) {
            let i = compiler.localVariables.next();
            compiler.source += `for (let ${i} = 0; ${i} < (${compiler.descendInput(node.args.TIMES).asNumber()}); ${i}++) {`;
            compiler.source += `yield;`
            compiler.source += `}`;
          },

          yieldBack(node, compiler, imports) {
            // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value.
            // Will yield to current thread if the current thread is at the start.
            compiler.source += `if (runtime.sequencer.activeThreadIndex <= 0) {`;
            compiler.source += `runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;`;
            compiler.source += `} else {`;
            // Yield to current thread
            compiler.source += `runtime.sequencer.activeThreadIndex--;`;
            compiler.source += `}`;

            compiler.source += `yield;`;
          },

          yieldToThread(node, compiler, imports) {
            let ACTIVETHREAD = compiler.localVariables.next();
            compiler.source += `let ${ACTIVETHREAD} = vm.SoupThreads.Type.toThread(${compiler.descendInput(node.args.ACTIVETHREAD).asUnknown()});`;

            // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value.

            let threadIndex = compiler.localVariables.next();
            compiler.source += `let ${threadIndex};`;
            compiler.source += `if (${ACTIVETHREAD}.thread !== null && (${threadIndex} = runtime.threads.indexOf(${ACTIVETHREAD}.thread)) !== -1) {`;
            compiler.source += `runtime.sequencer.activeThreadIndex = ${threadIndex} - 1;`;
            compiler.source += `} else {`;
            // Fall back to yielding to end of tick.
            compiler.source += `runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;`;
            compiler.source += `}`;

            compiler.source += `yield;`;
          },

          yieldToIndex(node, compiler, imports) {
            let ACTIVEINDEX = compiler.localVariables.next();
            compiler.source += `let ${ACTIVEINDEX} = vm.SoupThreadsUtil.handleIndexInput(${compiler.descendInput(node.args.ACTIVEINDEX).asUnknown()});`;

            // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value.

            compiler.source += `if (${ACTIVEINDEX} < 0) {`;
            // yield to first thread
            compiler.source += `runtime.sequencer.activeThreadIndex = -1;`;
            compiler.source += `} else if (${ACTIVEINDEX} >= runtime.threads.length) {`;
            // yield to end of tick
            compiler.source += `runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;`;
            compiler.source += `} else {`;
            compiler.source += `runtime.sequencer.activeThreadIndex = ${ACTIVEINDEX} - 1;`;
            compiler.source += `}`;

            compiler.source += `yield;`;
          },

          yieldToEnd(node, compiler, imports) {
            // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value.
            compiler.source += `runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;`;

            compiler.source += `yield;`;
          },



          setRunningThreadsActiveIndex(node, compiler, imports) {
            let THREADS = compiler.localVariables.next();
            compiler.source += `let ${THREADS} = vm.jwArray.Type.toArray(${compiler.descendInput(node.args.THREADS).asUnknown()}).array;`;
            compiler.source += `${THREADS} = ${THREADS}.map((thread) => (vm.SoupThreads.Type.toThread(thread)).thread);`;
            compiler.source += `${THREADS} = Array.from(new Set(${THREADS}));`;
            compiler.source += `${THREADS} = ${THREADS}.filter((rawThread) => (rawThread !== null && runtime.threads.includes(rawThread)));`;

            // Completely replace threads array via mutating only.
            compiler.source += `runtime.threads.splice(0, runtime.threads.length, ...${THREADS});`;

            // Only handle index input after replacing threads array so that length calculations are correct.
            // insertMode = false, absoluteMode = true
            let ACTIVEINDEX = compiler.localVariables.next();
            compiler.source += `let ${ACTIVEINDEX} = vm.SoupThreadsUtil.handleIndexInput(${compiler.descendInput(node.args.ACTIVEINDEX).asUnknown()}, false, true);`;

            // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value.

            compiler.source += `if (${ACTIVEINDEX} < 0) {`;
            // yield to first thread
            compiler.source += `runtime.sequencer.activeThreadIndex = -1;`;
            compiler.source += `} else if (${ACTIVEINDEX} >= runtime.threads.length) {`;
            // yield to end of tick
            compiler.source += `runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;`;
            compiler.source += `} else {`;
            compiler.source += `runtime.sequencer.activeThreadIndex = ${ACTIVEINDEX} - 1;`;
            compiler.source += `}`;

            compiler.source += `yield;`;
          },

          setRunningThreadsActiveThread(node, compiler, imports) {
            let THREADS = compiler.localVariables.next();
            compiler.source += `let ${THREADS} = vm.jwArray.Type.toArray(${compiler.descendInput(node.args.THREADS).asUnknown()}).array;`;
            compiler.source += `${THREADS} = ${THREADS}.map((thread) => (vm.SoupThreads.Type.toThread(thread)).thread);`;
            compiler.source += `${THREADS} = Array.from(new Set(${THREADS}));`;
            compiler.source += `${THREADS} = ${THREADS}.filter((rawThread) => (rawThread !== null && runtime.threads.includes(rawThread)));`;

            // Completely replace threads array via mutating only.
            compiler.source += `runtime.threads.splice(0, runtime.threads.length, ...${THREADS});`;

            let ACTIVETHREAD = compiler.localVariables.next();
            compiler.source += `let ${ACTIVETHREAD} = vm.SoupThreads.Type.toThread(${compiler.descendInput(node.args.ACTIVETHREAD).asUnknown()});`;

            // activeThreadIndex is incremented immediately after yield, so it is set to 1 less than the desired value.

            compiler.source += `let threadIndex;`;
            compiler.source += `if (${ACTIVETHREAD}.thread !== null && (threadIndex = runtime.threads.indexOf(${ACTIVETHREAD}.thread)) !== -1) {`;
            compiler.source += `runtime.sequencer.activeThreadIndex = threadIndex - 1;`;
            compiler.source += `} else {`;
            // Fall back to yielding to end of tick.
            compiler.source += `runtime.sequencer.activeThreadIndex = runtime.threads.length - 1;`;
            compiler.source += `}`;

            compiler.source += `yield;`;
          },

          moveThread(node, compiler, imports) {
            let THREAD = compiler.localVariables.next();
            compiler.source += `let ${THREAD} = vm.SoupThreads.Type.toThread(${compiler.descendInput(node.args.THREAD).asUnknown()});`;

            let threadIndex = compiler.localVariables.next();
            compiler.source += `let ${threadIndex};`;
            compiler.source += `if (${THREAD}.thread !== null && (${threadIndex} = runtime.threads.indexOf(${THREAD}.thread)) !== -1) {`;
            // insertMode = true, absoluteMode = false, constrain = true
            let INDEX = compiler.localVariables.next();
            compiler.source += `let ${INDEX} = vm.SoupThreadsUtil.handleIndexInput(${compiler.descendInput(node.args.INDEX).asUnknown()}, true, false, true);`;

            // Move the thread

            compiler.source += `if (${INDEX} <= ${threadIndex}) {`;

            // Moving backwards (or to the same position)
            // Remove the thread.
            compiler.source += `runtime.threads.splice(${threadIndex}, 1);`;
            // Insert the thread.
            compiler.source += `runtime.threads.splice(${INDEX}, 0, ${THREAD}.thread);`;

            compiler.source += `} else {`;

            // Moving forwards
            // Insert the thread.
            compiler.source += `runtime.threads.splice(${INDEX}, 0, ${THREAD}.thread);`;
            // Remove the old reference to the thread.
            compiler.source += `runtime.threads.splice(${threadIndex}, 1);`;

            compiler.source += `}`;

            // Update activeThreadIndex if the active thread moved

            compiler.source += `if (${threadIndex} === runtime.sequencer.activeThreadIndex) {`;
            // The active thread was directly moved.
            compiler.source += `runtime.sequencer.activeThreadIndex = ${INDEX};`;
            compiler.source += `} else if (${INDEX} <= runtime.sequencer.activeThreadIndex) {`;
            // The active thread was indirectly moved.
            compiler.source += `runtime.sequencer.activeThreadIndex += 1;`;
            compiler.source += `}`;

            compiler.source += `}`;
          },

          swapThreads(node, compiler, imports) {
            let THREADONE = compiler.localVariables.next();
            compiler.source += `let ${THREADONE} = vm.SoupThreads.Type.toThread(${compiler.descendInput(node.args.THREADONE).asUnknown()});`;
            let THREADTWO = compiler.localVariables.next();
            compiler.source += `let ${THREADTWO} = vm.SoupThreads.Type.toThread(${compiler.descendInput(node.args.THREADTWO).asUnknown()});`;

            compiler.source += `if (${THREADONE}.thread !== null && ${THREADTWO}.thread !== null) {`;
            let threadIndex1 = compiler.localVariables.next();
            compiler.source += `let ${threadIndex1} = runtime.threads.indexOf(${THREADONE}.thread);`;
            let threadIndex2 = compiler.localVariables.next();
            compiler.source += `let ${threadIndex2} = runtime.threads.indexOf(${THREADTWO}.thread);`;

            compiler.source += `if (${threadIndex1} !== -1 && ${threadIndex2} !== -1 && ${threadIndex1} !== ${threadIndex2}) {`;

            // Swap threads
            compiler.source += `runtime.threads[${threadIndex1}] = ${THREADTWO}.thread;`;
            compiler.source += `runtime.threads[${threadIndex2}] = ${THREADONE}.thread;`;

            // Update activeThreadIndex if the active thread moved
            compiler.source += `if (runtime.sequencer.activeThreadIndex === ${threadIndex1}) {`;
            compiler.source += `runtime.sequencer.activeThreadIndex = ${threadIndex2};`;
            compiler.source += `} else if (runtime.sequencer.activeThreadIndex === ${threadIndex2}) {`;
            compiler.source += `runtime.sequencer.activeThreadIndex = ${threadIndex1};`;
            compiler.source += `}`;

            compiler.source += `}`;
            compiler.source += `}`;
          },



          repeatAtomic(node, compiler, imports) {
            let i = compiler.localVariables.next();
            compiler.source += `for (let ${i} = 0; ${i} < (${compiler.descendInput(node.args.TIMES).asNumber()}); ${i}++) {`;

            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads.repeatAtomic')); // true means this is a loop

            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `if (isStuck()) {`;
              compiler.source += `yield;`;
              compiler.source += `}`;
            }

            compiler.source += `}`;
          },

          repeatUntilAtomic(node, compiler, imports) {
            compiler.source += `while (!(${compiler.descendInput(node.args.CONDITION).asBoolean()})) {`;

            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads.repeatUntilAtomic')); // true means this is a loop

            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `if (isStuck()) {`;
              compiler.source += `yield;`;
              compiler.source += `}`;
            }

            compiler.source += `}`;
          },

          repeatWhileAtomic(node, compiler, imports) {
            compiler.source += `while (${compiler.descendInput(node.args.CONDITION).asBoolean()}) {`;

            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads.repeatWhileAtomic')); // true means this is a loop

            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `if (isStuck()) {`;
              compiler.source += `yield;`;
              compiler.source += `}`;
            }

            compiler.source += `}`;
          },

          repeatForeverAtomic(node, compiler, imports) {
            compiler.source += `while (true) {`;

            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads.repeatForeverAtomic')); // true means this is a loop

            if (runtime.compilerOptions.warpTimer) {
              compiler.source += `if (isStuck()) {`;
              compiler.source += `yield;`;
              compiler.source += `}`;
            }

            compiler.source += `}`;
          },



          getWarpMode(node, compiler, imports) {
            return new imports.TypedInput(`${compiler.isWarp}`, imports.TYPE_BOOLEAN);
          },

          setWarpModeFor(node, compiler, imports) {
            let dropdown = node.constants.SETBOOLEAN;
            
            let oldWarp = compiler.isWarp;
            compiler.isWarp = (dropdown === 'enable');
            compiler.descendStack(node.args.SUBSTACK, new imports.Frame(true, 'soupThreads.setWarpModeFor')); // false means this is not a loop
            compiler.isWarp = oldWarp;
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
      if (STATUSFORMAT === 'internal name') {
        return ThreadStatusInternalNames[THREAD.thread.status];
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
      // - The thread is in the threads list (it died this tick if its status is STATUS_DONE).
      // - The thread's status is not STATUS_DONE.

      return runtime.threads.includes(THREAD.thread) && THREAD.thread.status !== RawThreadType.STATUS_DONE;
    }

    isFinished({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if(THREAD.thread === null) {
        return false;
      }
      
      // Returns true if:
      //
      // - The thread is not in the threads list (it is dead).
      // - The thread was not killed (as defined in `deadThreadWasKilled()`).
      // OR
      // - The thread *is* in the threads list (it died this tick if its status is STATUS_DONE).
      // - The thread's status is STATUS_DONE.
      // - The thread's `isKilled` property is `false`.

      if (runtime.threads.includes(THREAD.thread)) {
        return THREAD.thread.status === RawThreadType.STATUS_DONE && !THREAD.thread.isKilled;
      }
      return !THREAD.deadThreadWasKilled();
    }

    isKilled({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return false;
      }

      // Returns true if:
      //
      // - The thread is not in the threads list (it is dead).
      // - The thread was killed (as defined in `deadThreadWasKilled()`).
      // OR
      // - The thread *is* in the threads list (it died this tick if its status is STATUS_DONE).
      // - The thread's status is STATUS_DONE.
      // - The thread's `isKilled` property is `true`.

      if (runtime.threads.includes(THREAD.thread)) {
        return THREAD.thread.status === RawThreadType.STATUS_DONE && THREAD.thread.isKilled;
      }
      return THREAD.deadThreadWasKilled();
    }

    isStackClick({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return false;
      }
      return THREAD.thread.stackClick;
    }

    isMonitor({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return false;
      }
      return THREAD.thread.updateMonitor;
    }



    getThreads({}, util) {
      return new jwArray.Type(
        runtime.threads
        .map((rawThread) => (new ThreadType(rawThread)))
      );
    }

    getThreadsInTarget({TARGET}, util) {
      TARGET = SoupThreadsUtil.handleTargetInput(TARGET, util.target);

      if (TARGET === null) {
        return new jwArray.Type();
      }

      return new jwArray.Type(
        runtime.threads
        .filter((rawThread) => (rawThread.target.id === TARGET))
        .map((rawThread) => (new ThreadType(rawThread)))
      );
    }



    getThreadVar({THREAD, VARIABLE}, util) {
      THREAD = ThreadType.toThread(THREAD);
      VARIABLE = Scratch.Cast.toString(VARIABLE);

      if (THREAD.thread === null) {
        return '';
      }

      let variables = THREAD.thread.soupThreadVariables;
      return variables.hasOwnProperty(VARIABLE) ? variables[VARIABLE] : '';
    }

    setThreadVar({THREAD, VARIABLE, VALUE}, util) {
      THREAD = ThreadType.toThread(THREAD);
      VARIABLE = Scratch.Cast.toString(VARIABLE);

      if (THREAD.thread === null) {
        return;
      }

      let variables = THREAD.thread.soupThreadVariables;
      variables[VARIABLE] = VALUE;
    }

    getThreadVarNames({THREAD}, util) {
      THREAD = ThreadType.toThread(THREAD);

      if (THREAD.thread === null) {
        return new jwArray.Type([]);
      }

      let variables = THREAD.thread.soupThreadVariables;
      return new jwArray.Type(Object.keys(variables));
    }

    deleteThreadVar({THREAD, VARIABLE}, util) {
      THREAD = ThreadType.toThread(THREAD);
      VARIABLE = Scratch.Cast.toString(VARIABLE);

      if (THREAD.thread === null) {
        return;
      }

      let variables = THREAD.thread.soupThreadVariables;
      delete variables[VARIABLE];
    }



    getTickOverall({}, util) {
      return runtime.soupThreadsTickFromInit ?? 0;
    }

    getFrameOverall({}, util) {
      return runtime.soupThreadsFrameFromInit ?? 0;
    }

    getTick({}, util) {
      return runtime.soupThreadsTickFromStart ?? 0;
    }

    getFrame({}, util) {
      return runtime.soupThreadsFrameFromStart ?? 0;
    }

    getTickInFrame({}, util) {
      return runtime.soupThreadsTickWithinFrame ?? 0;
    }



    getGraphicsUpdated({}, util) {
      return runtime.redrawRequested;
    }

    setGraphicsUpdated({VALUE}, util) {
      VALUE = Scratch.Cast.toBoolean(VALUE);

      runtime.redrawRequested = VALUE;
    }



    getFrameTime({}, util) {
      return runtime.currentStepTime / 1000;
    }

    getWorkTime({}, util) {
      // Fall back to calculating work time immediately instead of at the start of the frame
      return (util.sequencer.soupThreadsWorkTime ?? 0.75 * runtime.currentStepTime) / 1000;
    }

    getWorkTimer({}, util) {
      return util.sequencer.timer.timeElapsed() / 1000;
    }

    setWorkTimer({TIME}, util) {
      TIME = Scratch.Cast.toNumber(TIME);

      // Allow infinite values for now
      // if (!Number.isFinite(TIME)) {
      //   return;
      // }

      if (util.sequencer.timer._pausedTime !== null) {
        util.sequencer.timer._pausedTime = TIME * 1000;
      } else {
        util.sequencer.timer.startTime = util.sequencer.timer.relativeTime() - TIME * 1000;
      }
    }

  }

  // Load extension
  if (Array.from(vm.extensionManager._loadedExtensions.keys()).includes('soupThreads')) {
    console.warn('Soup\'s Threads extension attempted to be loaded while already present in the project; ignoring');
  } else {
    if (Scratch.extensions.isPenguinMod && !Scratch.extensions.isDinosaurMod) {
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
  }

})(Scratch);
