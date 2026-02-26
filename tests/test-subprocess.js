import test from 'tape-six';

import {$$, $, spawn, isWindows} from '../src/index.js';

test('spawn: basic lifecycle', async t => {
  const sp = spawn(['echo', 'hello'], {stdout: 'pipe'});

  t.ok(Array.isArray(sp.command), 'command is an array');
  t.equal(sp.killed, false, 'not killed initially');

  const code = await sp.exited;
  t.equal(code, 0, 'exit code is 0');
  t.equal(sp.exitCode, 0, 'exitCode is 0');
  t.equal(sp.signalCode, null, 'signalCode is null');
  t.equal(sp.finished, true, 'finished is true after exit');
  t.equal(sp.killed, false, 'killed is still false');
});

test('spawn: finished state after normal exit (#3)', async t => {
  const sp = spawn(['echo', 'test'], {});
  await sp.exited;
  t.equal(sp.finished, true, 'finished is true after normal exit');
  t.equal(sp.killed, false, 'killed is false for normal exit');
});

test('spawn: kill sets killed and finished', async t => {
  const cmd = isWindows ? ['ping', '-n', '10', '127.0.0.1'] : ['sleep', '10'];
  const sp = spawn(cmd, {});

  t.equal(sp.killed, false, 'not killed initially');
  t.equal(sp.finished, false, 'not finished initially');

  sp.kill();
  t.equal(sp.killed, true, 'killed is true after kill()');

  await sp.exited;
  t.equal(sp.finished, true, 'finished is true after kill completes');
});

test('spawn: stdout stream', async t => {
  const sp = spawn(['echo', 'hello world'], {stdout: 'pipe'});

  const reader = sp.stdout.getReader();
  const chunks = [];
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  await sp.exited;

  const text = new TextDecoder().decode(chunks[0]).trim();
  t.equal(text, 'hello world', 'stdout contains output');
});

test('spawn: stderr stream', async t => {
  const cmd = isWindows ? ['cmd', '/c', 'echo error 1>&2'] : ['sh', '-c', 'echo error >&2'];
  const sp = spawn(cmd, {stderr: 'pipe'});

  const reader = sp.stderr.getReader();
  const chunks = [];
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  await sp.exited;

  const text = new TextDecoder().decode(chunks[0]).trim();
  t.equal(text, 'error', 'stderr contains error output');
});

test('spawn: stdin stream', async t => {
  const sp = spawn(['cat'], {stdin: 'pipe', stdout: 'pipe'});

  const writer = sp.stdin.getWriter();
  await writer.write(new TextEncoder().encode('hello from stdin'));
  await writer.close();

  const reader = sp.stdout.getReader();
  const chunks = [];
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  await sp.exited;

  const text = chunks
    .map(c => new TextDecoder().decode(c))
    .join('')
    .trim();
  t.equal(text, 'hello from stdin', 'stdin piped to stdout via cat');
});

test('spawn: asDuplex', async t => {
  const sp = spawn(['cat'], {stdin: 'pipe', stdout: 'pipe'});
  const {readable, writable} = sp.asDuplex;

  t.ok(readable instanceof ReadableStream, 'readable is a ReadableStream');
  t.ok(writable instanceof WritableStream, 'writable is a WritableStream');

  const writer = writable.getWriter();
  await writer.write(new TextEncoder().encode('duplex test'));
  await writer.close();

  const reader = readable.getReader();
  const chunks = [];
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  await sp.exited;

  const text = chunks
    .map(c => new TextDecoder().decode(c))
    .join('')
    .trim();
  t.equal(text, 'duplex test', 'data round-trips through asDuplex');
});

test('spawn: non-zero exit code', async t => {
  const sp = spawn(['sh', '-c', 'exit 42'], {});
  const code = await sp.exited;
  t.equal(code, 42, 'exited resolves with exit code');
  t.equal(sp.exitCode, 42, 'exitCode is 42');
  t.equal(sp.finished, true, 'finished is true');
});

test('$$: returns Subprocess', async t => {
  const sp = $$`echo hello`;
  t.ok(sp.exited instanceof Promise, 'has exited promise');
  t.equal(sp.killed, false, 'not killed');
  await sp.exited;
  t.equal(sp.exitCode, 0, 'exitCode is 0');
  t.equal(sp.finished, true, 'finished is true');
});

test('$: returns DollarResult', async t => {
  const result = await $`echo hello`;
  t.equal(result.code, 0, 'code is 0');
  t.equal(result.signal, null, 'signal is null');
  t.equal(result.killed, false, 'killed is false');
});

test('$: non-zero exit code', async t => {
  const result = await $`sh -c ${'exit 1'}`;
  t.equal(result.code, 1, 'code is 1');
  t.equal(result.killed, false, 'killed is false');
});

test('spawn: error on invalid command (#1 #2)', async t => {
  try {
    const sp = spawn(['__nonexistent_command_12345__'], {});
    await t.rejects(sp.exited, 'exited rejects for invalid command');
    t.equal(sp.finished, true, 'finished is true after error');
  } catch (e) {
    t.ok(e instanceof Error, 'sync throw for invalid command (Bun behavior)');
  }
});
