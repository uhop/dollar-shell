import test from 'tape-six';

import {$, spawn, isWindows} from '../src/index.js';

const sleepCmd = isWindows ? ['ping', '-n', '10', '127.0.0.1'] : ['sleep', '10'];
const echoCmd = text =>
  isWindows ? ['node', '-e', `process.stdout.write(${JSON.stringify(text)})`] : ['echo', text];

test('signal: abort kills a running process', async t => {
  const controller = new AbortController();
  const sp = spawn(sleepCmd, {signal: controller.signal});

  t.equal(sp.killed, false, 'not killed initially');
  setTimeout(() => controller.abort(), 20);

  await sp.exited;
  t.equal(sp.killed, true, 'killed is true after abort');
  t.equal(sp.finished, true, 'finished is true after abort');
});

test('signal: already-aborted signal kills immediately', async t => {
  const controller = new AbortController();
  controller.abort();

  const sp = spawn(sleepCmd, {signal: controller.signal});
  await sp.exited;
  t.equal(sp.killed, true, 'killed is true');
  t.equal(sp.finished, true, 'finished is true');
});

test('signal: $ result carries killed', async t => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);

  const result = await (isWindows
    ? $({signal: controller.signal})`ping -n 10 127.0.0.1`
    : $({signal: controller.signal})`sleep 10`);
  t.equal(result.killed, true, 'killed is true');
});

test('signal: normal exit leaves killed false', async t => {
  const controller = new AbortController();
  const sp = spawn(echoCmd('done'), {signal: controller.signal});

  const code = await sp.exited;
  t.equal(code, 0, 'exit code is 0');
  t.equal(sp.killed, false, 'killed is false');

  controller.abort();
  t.equal(sp.killed, false, 'abort after exit is a no-op');
});
