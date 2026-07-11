// @ts-self-types="./index.d.ts"

// load dependencies

import {getEnv} from './utils.js';

import {buildApi} from './build.js';

export {isWindows, raw, winCmdEscape} from './utils.js';

// Force the Node backend on every runtime with the `DSH_FORCE_NODE` environment
// variable (e.g. DSH_FORCE_NODE=1) — Bun/Deno then run on their Node compat (e.g. to
// sidestep Bun's Web-Stream child-pipe tail-drop). The env var is inherited by spawned
// children; to force only this process, set `globalThis.DSH_FORCE_NODE` before a dynamic
// import instead. Treated as off: unset, '', '0', 'false'.
const isFlagOn = value =>
  value != null &&
  value !== '' &&
  value !== '0' &&
  value !== 0 &&
  String(value).toLowerCase() !== 'false';

const envForceNode = () => {
  if (typeof Deno !== 'undefined') {
    const status = Deno.permissions?.querySync?.({name: 'env', variable: 'DSH_FORCE_NODE'});
    if (status && status.state !== 'granted') return undefined;
  }
  try {
    return getEnv('DSH_FORCE_NODE');
  } catch {
    return undefined;
  }
};

const forceNode =
  isFlagOn(/** @type {any} */ (globalThis).DSH_FORCE_NODE) || isFlagOn(envForceNode());

// The runtime-native backend defines how to launch *this* runtime — `currentExecPath`,
// `runFileArgs`, `cwd`. DSH_FORCE_NODE forces only the spawn *implementation*
// (`node:child_process`); it must not change which runtime we target or how it is
// invoked, so a forced child of Bun/Deno is still `bun run …` / `deno run …`, never a
// bare `node`. (`process.execPath` is already the real runtime under Bun/Deno node
// compat; `runFileArgs` is what actually differs — `[]` for node vs `['run']`.)
let modRuntime;
if (typeof Deno !== 'undefined') {
  modRuntime = await import('./spawn/deno.js');
} else if (typeof Bun !== 'undefined') {
  modRuntime = await import('./spawn/bun.js');
} else {
  modRuntime = await import('./spawn/node.js');
}
const modSpawn = forceNode ? await import('./spawn/node.js') : modRuntime;

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
  capture,
  shell,
  sh,
  $sh
} = await buildApi({
  spawn: modSpawn.spawn,
  cwd: modRuntime.cwd,
  currentExecPath: modRuntime.currentExecPath,
  runFileArgs: modRuntime.runFileArgs
});

export default $;
