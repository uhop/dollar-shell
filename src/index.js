// @ts-self-types="./index.d.ts"

'use strict';

// load dependencies

export {isWindows, raw} from './utils.js';

import bqSpawn from './bq-spawn.js';
import bqShell from './bq-shell.js';

let modSpawn;
if (typeof Deno !== 'undefined') {
  modSpawn = await import('./spawn/deno.js');
} else if (typeof Bun !== 'undefined') {
  modSpawn = await import('./spawn/bun.js');
} else {
  modSpawn = await import('./spawn/node.js');
}
export const {spawn, cwd, currentExecPath, runFileArgs} = modSpawn;

let modShell;
if (isWindows) {
  modShell = await import('./shell/windows.js');
} else {
  modShell = await import('./shell/unix.js');
}
export const {shellEscape, currentShellPath, buildShellCommand} = modShell;

// define spawn functions

export const $$ = bqSpawn(spawn);

export const $ = bqSpawn((command, options) => {
  const sp = spawn(command, options);
  return sp.exited.then(() => ({code: sp.exitCode, signal: sp.signalCode, killed: sp.killed}));
});

const fromProcess = bqSpawn((command, options) => {
  const sp = spawn(command, Object.assign({}, options, {stdout: 'pipe'}));
  return sp.stdout;
});

const toProcess = bqSpawn((command, options) => {
  const sp = spawn(command, Object.assign({}, options, {stdin: 'pipe'}));
  return sp.stdin;
});

const throughProcess = bqSpawn((command, options) => {
  const sp = spawn(command, Object.assign({}, options, {stdin: 'pipe', stdout: 'pipe'}));
  return {readable: sp.stdout, writable: sp.stdin};
});

$.from = fromProcess;
$.to = toProcess;
$.through = $.io = throughProcess;

// define shell functions

export const shell = bqShell(shellEscape, (command, options) => spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), options));
export {shell as sh};

export const $sh = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), options);
  return sp.exited.then(() => ({code: sp.exitCode, signal: sp.signalCode, killed: sp.killed}));
});

const fromShell = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), Object.assign({}, options, {stdout: 'pipe'}));
  return sp.stdout;
});

const toShell = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), Object.assign({}, options, {stdin: 'pipe'}));
  return sp.stdin;
});

const throughShell = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), Object.assign({}, options, {stdin: 'pipe', stdout: 'pipe'}));
  return {readable: sp.stdout, writable: sp.stdin};
});

$sh.from = fromShell;
$sh.to = toShell;
$sh.through = $sh.io = throughShell;

export default $;
