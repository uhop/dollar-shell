// @ts-self-types="./index.d.ts"

// load dependencies

import {isWindows, raw, winCmdEscape} from './utils.js';

import bqSpawn from './bq-spawn.js';
import bqShell from './bq-shell.js';

export {isWindows, raw, winCmdEscape};

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
  const sp = spawn(command, {...options, stdout: 'pipe'});
  return sp.stdout;
});

const toProcess = bqSpawn((command, options) => {
  const sp = spawn(command, {...options, stdin: 'pipe'});
  return sp.stdin;
});

const throughProcess = bqSpawn((command, options) => {
  const sp = spawn(command, {...options, stdin: 'pipe', stdout: 'pipe'});
  return sp.asDuplex;
});

const $impl = /** @type {import('./index.d.ts').DollarImpl} */ ($);
$impl.from = fromProcess;
$impl.to = toProcess;
$impl.through = $impl.io = throughProcess;

// define shell functions

export const shell = bqShell(shellEscape, (command, options) =>
  spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), {
    ...options,
    windowsVerbatimArguments: true
  })
);
export {shell as sh};

export const $sh = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), {
    ...options,
    windowsVerbatimArguments: true
  });
  return sp.exited.then(() => ({code: sp.exitCode, signal: sp.signalCode, killed: sp.killed}));
});

const fromShell = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), {
    ...options,
    stdout: 'pipe',
    windowsVerbatimArguments: true
  });
  return sp.stdout;
});

const toShell = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), {
    ...options,
    stdin: 'pipe',
    windowsVerbatimArguments: true
  });
  return sp.stdin;
});

const throughShell = bqShell(shellEscape, (command, options) => {
  const sp = spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), {
    ...options,
    stdin: 'pipe',
    stdout: 'pipe',
    windowsVerbatimArguments: true
  });
  return sp.asDuplex;
});

const $shImpl = /** @type {import('./index.d.ts').ShellImpl} */ ($sh);
$shImpl.from = fromShell;
$shImpl.to = toShell;
$shImpl.through = $shImpl.io = throughShell;

export default $;
