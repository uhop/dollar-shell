// Shared API builder. Given a spawn backend (`spawn`, `cwd`, `currentExecPath`,
// `runFileArgs`), wires up the shell helpers and all tag functions ($, $$, $sh,
// shell, with from/to/through/io). Both entry points reuse this — `index.js`
// passes a Web-Streams backend, `node/index.js` passes the raw-Node-streams one.

import bqSpawn from './bq-spawn.js';
import bqShell from './bq-shell.js';

import {isWindows} from './utils.js';

// Abort semantics live here, not in the backends: the native signal options differ
// per runtime (Node rejects `exited` with AbortError, Deno kills, Bun has none), while
// wrapping `kill()` gives one uniform behavior everywhere `spawn` is reachable.
const withSignal = spawn => (command, options) => {
  const sp = spawn(command, options);
  const signal = options?.signal;
  if (signal) {
    if (signal.aborted) {
      if (!sp.finished) sp.kill();
    } else {
      const onAbort = () => {
        if (!sp.finished) sp.kill();
      };
      signal.addEventListener('abort', onAbort, {once: true});
      const off = () => signal.removeEventListener('abort', onAbort);
      sp.exited.then(off, off);
    }
  }
  return sp;
};

// Both entries flow through buildApi, so these accept Web and Node streams alike.
const readAll = async stream => {
  if (!stream) return '';
  const decoder = new TextDecoder();
  let result = '';
  for await (const chunk of stream) result += decoder.decode(chunk, {stream: true});
  return result + decoder.decode();
};

const writeAll = (stream, text) => {
  if (typeof stream.getWriter === 'function') {
    const writer = stream.getWriter();
    return writer.write(new TextEncoder().encode(text)).then(() => writer.close());
  }
  return new Promise((resolve, reject) => {
    stream.once('error', reject);
    stream.end(text, () => resolve(undefined));
  });
};

export const buildApi = async ({spawn: rawSpawn, cwd, currentExecPath, runFileArgs}) => {
  const spawn = withSignal(rawSpawn);
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

  const capture = bqSpawn(async (command, options) => {
    const {input, ...spawnOptions} = options ?? {};
    const sp = spawn(command, {
      ...spawnOptions,
      stdin: input != null ? 'pipe' : spawnOptions.stdin,
      stdout: 'pipe',
      stderr: 'pipe'
    });
    const [, stdout, stderr] = await Promise.all([
      sp.exited,
      readAll(sp.stdout),
      readAll(sp.stderr),
      input != null ? writeAll(sp.stdin, input) : undefined
    ]);
    return {code: sp.exitCode, signal: sp.signalCode, killed: sp.killed, stdout, stderr};
  });

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
    capture,
    shell,
    sh: shell,
    $sh
  };
};
