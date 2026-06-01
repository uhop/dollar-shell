import test from 'tape-six';

import {spawn, isWindows} from '../src/node/index.js';

const echoCmd = text =>
  isWindows ? ['node', '-e', `process.stdout.write(${JSON.stringify(text)})`] : ['echo', text];

test('dollar-shell/node exposes Node streams, not Web streams', async t => {
  const sp = spawn(echoCmd('hi'), {stdin: 'pipe', stdout: 'pipe', stderr: 'pipe'});

  // Node streams expose .pipe / .write; Web streams expose .getReader / .getWriter.
  t.equal(typeof sp.stdout.pipe, 'function', 'stdout is a Node Readable (.pipe)');
  t.equal(sp.stdout.getReader, undefined, 'stdout is not a Web ReadableStream');
  t.equal(typeof sp.stderr.pipe, 'function', 'stderr is a Node Readable (.pipe)');
  t.equal(typeof sp.stdin.write, 'function', 'stdin is a Node Writable (.write)');
  t.equal(sp.stdin.getWriter, undefined, 'stdin is not a Web WritableStream');

  // asDuplex pairs the same Node streams.
  t.equal(sp.asDuplex.readable, sp.stdout, 'asDuplex.readable is stdout');
  t.equal(sp.asDuplex.writable, sp.stdin, 'asDuplex.writable is stdin');

  const code = await sp.exited;
  t.equal(code, 0, 'process runs to completion under the Node backend');
});
