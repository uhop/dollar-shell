// Shared API builder. Given a spawn backend (`spawn`, `cwd`, `currentExecPath`,
// `runFileArgs`), wires up the shell helpers and all tag functions ($, $$, $sh,
// shell, with from/to/through/io). Both entry points reuse this — `index.js`
// passes a Web-Streams backend, `node/index.js` passes the raw-Node-streams one.

import bqSpawn from './bq-spawn.js';
import bqShell from './bq-shell.js';

import {isWindows} from './utils.js';

export const buildApi = async ({spawn, cwd, currentExecPath, runFileArgs}) => {
  let modShell;
  if (isWindows) {
    modShell = await import('./shell/windows.js');
  } else {
    modShell = await import('./shell/unix.js');
  }
  const {shellEscape, currentShellPath, buildShellCommand} = modShell;

  // spawn functions

  const $$ = bqSpawn(spawn);

  const $ = bqSpawn((command, options) => {
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

  // shell functions

  const shell = bqShell(shellEscape, (command, options) =>
    spawn(buildShellCommand(options?.shellPath, options?.shellArgs, command), {
      ...options,
      windowsVerbatimArguments: true
    })
  );

  const $sh = bqShell(shellEscape, (command, options) => {
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

  return {
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
    sh: shell,
    $sh
  };
};
