// @ts-self-types="./index.d.ts"

// The Node-streams facade: identical API to the main entry, but stdin/stdout/stderr
// (and .from/.to/.through/.io/asDuplex) are Node streams instead of Web streams.
// Spawning always goes through node:child_process (on Bun/Deno via their node compat) —
// that is the point of this entry. But, like DSH_FORCE_NODE on the main entry, this must
// affect only the spawn implementation: `currentExecPath` / `runFileArgs` / `cwd` stay
// runtime-native, so a child of Bun/Deno is still launched as `bun run …` / `deno run …`,
// never a bare `node`.

import {buildApi} from '../build.js';
import * as backend from '../spawn/node.js';

export {isWindows, raw, winCmdEscape} from '../utils.js';

let modRuntime;
if (typeof Deno !== 'undefined') {
  modRuntime = await import('../spawn/deno.js');
} else if (typeof Bun !== 'undefined') {
  modRuntime = await import('../spawn/bun.js');
} else {
  modRuntime = backend;
}

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
  cwd: modRuntime.cwd,
  currentExecPath: modRuntime.currentExecPath,
  runFileArgs: modRuntime.runFileArgs
});

export default $;
