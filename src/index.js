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

let modSpawn;
if (forceNode) {
  modSpawn = await import('./spawn/node.js');
} else if (typeof Deno !== 'undefined') {
  modSpawn = await import('./spawn/deno.js');
} else if (typeof Bun !== 'undefined') {
  modSpawn = await import('./spawn/bun.js');
} else {
  modSpawn = await import('./spawn/node.js');
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
} = await buildApi(modSpawn);

export default $;
