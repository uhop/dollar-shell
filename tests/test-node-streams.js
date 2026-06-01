import {Readable, Writable, Duplex} from 'node:stream';

import test from 'tape-six';

import {$, $sh, spawn, isWindows, raw} from '../src/node/index.js';

const catArgs = isWindows ? raw('/r .*') : raw('');

// Read a Node Readable to a trimmed string.
const readStream = async stream => {
  stream.setEncoding('utf8');
  let text = '';
  for await (const chunk of stream) text += chunk;
  return text.trim();
};

test('spawn: stdout is a Node Readable that yields data', async t => {
  const cmd = isWindows
    ? ['node', '-e', 'process.stdout.write("spawn-test")']
    : ['echo', 'spawn-test'];
  const sp = spawn(cmd, {stdout: 'pipe'});
  t.ok(sp.stdout instanceof Readable, 'stdout is a Node Readable');
  t.equal(sp.stdout.getReader, undefined, 'stdout is not a Web ReadableStream');
  const text = await readStream(sp.stdout);
  t.equal(text, 'spawn-test', 'stdout yields the command output');
  await sp.exited;
});

test('$.from: returns a Node Readable with the output', async t => {
  const stream = isWindows
    ? $.from`node -e ${raw('process.stdout.write("from-test")')}`
    : $.from`echo from-test`;
  t.ok(stream instanceof Readable, 'is a Node Readable');
  const text = await readStream(stream);
  t.equal(text, 'from-test', 'contains command output');
});

test('$.to: returns a Node Writable', async t => {
  const catCmd = isWindows ? 'findstr' : 'cat';
  const sink = $.to`${catCmd} ${catArgs}`;
  t.ok(sink instanceof Writable, 'is a Node Writable');
  sink.end();
});

test('$.io: returns a Node Duplex that round-trips data', async t => {
  const catCmd = isWindows ? 'findstr' : 'cat';
  const duplex = $.io`${catCmd} ${catArgs}`;
  t.ok(duplex instanceof Duplex, 'is a Node Duplex');

  // Read and write concurrently; `end()` writes the input and EOFs stdin, then
  // the readable side must stay open to deliver stdout (the half-open case).
  const output = readStream(duplex);
  duplex.end('io-test');
  t.equal(await output, 'io-test', 'data round-trips through $.io');
});

test('$.through: alias of $.io', t => {
  t.equal($.through, $.io, '$.through === $.io');
});

test('asDuplex: same Node Duplex, round-trips through the process', async t => {
  const catCmd = isWindows ? ['findstr', '/r', '.*'] : ['cat'];
  const sp = spawn(catCmd, {stdin: 'pipe', stdout: 'pipe'});

  const duplex = sp.asDuplex;
  t.ok(duplex instanceof Duplex, 'asDuplex is a Node Duplex');
  t.equal(sp.asDuplex, duplex, 'asDuplex is cached (same instance on re-read)');

  const output = readStream(duplex);
  duplex.end('duplex-test');
  t.equal(await output, 'duplex-test', 'data round-trips through asDuplex');
  await sp.exited;
});

test('$sh.io: returns a Node Duplex that round-trips data', {skip: isWindows}, async t => {
  const duplex = $sh.io`cat`;
  t.ok(duplex instanceof Duplex, 'is a Node Duplex');

  const output = readStream(duplex);
  duplex.end('sh-io-test');
  t.equal(await output, 'sh-io-test', 'data round-trips through $sh.io');
});
