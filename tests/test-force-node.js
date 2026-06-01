import test from 'tape-six';

import {isWindows, runFileArgs as nativeRunFileArgs} from '../src/index.js';

const echoCmd = text =>
  isWindows ? ['node', '-e', `process.stdout.write(${JSON.stringify(text)})`] : ['echo', text];

// Load a fresh module instance with the Node backend forced via the global flag.
// The query string makes the dynamic import re-evaluate index.js (re-running the
// load-time backend selection) instead of returning the cached instance.
const loadForced = async () => {
  const g = /** @type {any} */ (globalThis);
  g.DSH_FORCE_NODE = true;
  try {
    return await import('../src/index.js?dsh-force-node');
  } finally {
    delete g.DSH_FORCE_NODE;
  }
};

test('DSH_FORCE_NODE forces the Node spawn backend only — the launcher stays runtime-native', async t => {
  const forced = await loadForced();

  // DSH_FORCE_NODE forces only the spawn *implementation* (node:child_process); it must
  // NOT change how this runtime is launched. So currentExecPath / runFileArgs stay
  // runtime-native — a forced child of Bun/Deno is still `bun run …` / `deno run …`, not
  // a bare `node`. (Forcing node's `[]` here broke Deno: `deno -A file` sends -A to V8.)
  t.deepEqual(
    forced.runFileArgs,
    nativeRunFileArgs,
    'forced backend keeps the runtime-native runFileArgs'
  );

  // And the forced backend actually spawns (Bun/Deno via their node:child_process compat).
  const sp = forced.spawn(echoCmd('hi'), {stdout: 'pipe'});
  const code = await sp.exited;
  t.equal(code, 0, 'a process runs under the forced Node spawn backend');
});
