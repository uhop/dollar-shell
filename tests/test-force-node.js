import test from 'tape-six';

import {isWindows} from '../src/index.js';

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

test('DSH_FORCE_NODE selects the Node backend on every runtime', async t => {
  const forced = await loadForced();

  // The Node backend ships an empty `runFileArgs`; the Deno and Bun natives use ['run'].
  // So this is `[]` on every runtime precisely because the Node backend was forced.
  t.deepEqual(forced.runFileArgs, [], 'forced backend reports the Node runFileArgs');

  // And the forced backend actually spawns (Bun/Deno via their node:child_process compat).
  const sp = forced.spawn(echoCmd('hi'), {stdout: 'pipe'});
  const code = await sp.exited;
  t.equal(code, 0, 'a process runs under the forced Node backend');
});
