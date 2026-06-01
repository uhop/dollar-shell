// @ts-self-types="./index.d.ts"

// The Node-streams facade: identical API to the main entry, but stdin/stdout/stderr
// (and .from/.to/.through/.io/asDuplex) are Node streams instead of Web streams.
// Always uses the Node backend — on Bun/Deno it runs through their node:child_process compat.

import {buildApi} from '../build.js';
import * as backend from '../spawn/node.js';

export {isWindows, raw, winCmdEscape} from '../utils.js';

export const {
  spawn,
  cwd,
  currentExecPath,
  runFileArgs,
  shellEscape,
  currentShellPath,
  buildShellCommand,
  $$,
  $,
  shell,
  sh,
  $sh
} = await buildApi({
  spawn: backend.nodeStreamSpawn,
  cwd: backend.cwd,
  currentExecPath: backend.currentExecPath,
  runFileArgs: backend.runFileArgs
});

export default $;
