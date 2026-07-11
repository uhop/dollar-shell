import test from 'tape-six';

import {capture, isWindows} from '../src/index.js';
import {capture as captureNode} from '../src/node/index.js';

test('capture: collects stdout', async t => {
  const result = isWindows
    ? await capture`node -e ${'console.log("hello")'}`
    : await capture`echo hello`;
  t.equal(result.code, 0, 'code is 0');
  t.equal(result.signal, null, 'signal is null');
  t.equal(result.killed, false, 'killed is false');
  t.equal(result.stdout.trim(), 'hello', 'stdout is collected');
  t.equal(result.stderr, '', 'stderr is empty');
});

test('capture: collects stderr', async t => {
  const result = isWindows
    ? await capture`cmd /c ${'echo error 1>&2'}`
    : await capture`sh -c ${'echo error >&2'}`;
  t.equal(result.code, 0, 'code is 0');
  t.equal(result.stdout, '', 'stdout is empty');
  t.equal(result.stderr.trim(), 'error', 'stderr is collected');
});

test('capture: string input goes to stdin', async t => {
  const result = isWindows
    ? await capture({input: 'hello from stdin'})`findstr /r .*`
    : await capture({input: 'hello from stdin'})`cat`;
  t.equal(result.code, 0, 'code is 0');
  t.equal(result.stdout.trim(), 'hello from stdin', 'stdin round-trips to stdout');
});

test('capture: non-zero exit code', async t => {
  const result = isWindows ? await capture`cmd /c ${'exit 3'}` : await capture`sh -c ${'exit 3'}`;
  t.equal(result.code, 3, 'code is 3');
  t.equal(result.killed, false, 'killed is false');
});

test('capture: derived tag with defaults', async t => {
  const withInput = capture({input: 'derived'});
  const result = isWindows ? await withInput`findstr /r .*` : await withInput`cat`;
  t.equal(result.stdout.trim(), 'derived', 'derived tag keeps its defaults');
});

test('capture: abort surfaces killed', async t => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);

  const result = isWindows
    ? await capture({signal: controller.signal})`ping -n 10 127.0.0.1`
    : await capture({signal: controller.signal})`sleep 10`;
  t.equal(result.killed, true, 'killed is true');
});

test('capture: rejects on invalid command', async t => {
  await t.rejects(capture`__nonexistent_command_12345__`, 'rejects for invalid command');
});

test('capture (node entry): collects stdout', async t => {
  const result = isWindows
    ? await captureNode`node -e ${'console.log("hello")'}`
    : await captureNode`echo hello`;
  t.equal(result.code, 0, 'code is 0');
  t.equal(result.stdout.trim(), 'hello', 'stdout is collected');
});

test('capture (node entry): string input goes to stdin', async t => {
  const result = isWindows
    ? await captureNode({input: 'node streams'})`findstr /r .*`
    : await captureNode({input: 'node streams'})`cat`;
  t.equal(result.stdout.trim(), 'node streams', 'stdin round-trips to stdout');
});
