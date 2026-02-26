import test from 'tape-six';

import $, {$sh, isWindows} from '../src/index.js';

const readStream = async stream => {
  const reader = stream.getReader();
  const chunks = [];
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return chunks
    .map(c => new TextDecoder().decode(c))
    .join('')
    .trim();
};

test('$.from: returns ReadableStream', async t => {
  const stream = $.from`echo from-test`;
  t.ok(stream instanceof ReadableStream, 'is a ReadableStream');
  const text = await readStream(stream);
  t.equal(text, 'from-test', 'contains command output');
});

test('$.to: returns WritableStream', async t => {
  const stream = $.to`cat`;
  t.ok(stream instanceof WritableStream, 'is a WritableStream');
  const writer = stream.getWriter();
  await writer.close();
});

test('$.io: returns DuplexPair', async t => {
  const duplex = $.io`cat`;
  t.ok(duplex.readable instanceof ReadableStream, 'has readable');
  t.ok(duplex.writable instanceof WritableStream, 'has writable');

  const writer = duplex.writable.getWriter();
  await writer.write(new TextEncoder().encode('io-test'));
  await writer.close();

  const text = await readStream(duplex.readable);
  t.equal(text, 'io-test', 'data round-trips through $.io');
});

test('$.through: alias of $.io', t => {
  t.equal($.through, $.io, '$.through === $.io');
});

test('$.from with options', async t => {
  const stream = $.from({stderr: 'inherit'})`echo options-test`;
  t.ok(stream instanceof ReadableStream, 'is a ReadableStream');
  const text = await readStream(stream);
  t.equal(text, 'options-test', 'contains command output');
});

test('$sh.from: returns ReadableStream', {skip: isWindows}, async t => {
  const stream = $sh.from`echo sh-from-test`;
  t.ok(stream instanceof ReadableStream, 'is a ReadableStream');
  const text = await readStream(stream);
  t.equal(text, 'sh-from-test', 'contains shell command output');
});

test('$sh.to: returns WritableStream', {skip: isWindows}, async t => {
  const stream = $sh.to`cat`;
  t.ok(stream instanceof WritableStream, 'is a WritableStream');
  const writer = stream.getWriter();
  await writer.close();
});

test('$sh.io: returns DuplexPair', {skip: isWindows}, async t => {
  const duplex = $sh.io`cat`;
  t.ok(duplex.readable instanceof ReadableStream, 'has readable');
  t.ok(duplex.writable instanceof WritableStream, 'has writable');

  const writer = duplex.writable.getWriter();
  await writer.write(new TextEncoder().encode('sh-io-test'));
  await writer.close();

  const text = await readStream(duplex.readable);
  t.equal(text, 'sh-io-test', 'data round-trips through $sh.io');
});

test('$sh.through: alias of $sh.io', t => {
  t.equal($sh.through, $sh.io, '$sh.through === $sh.io');
});

test('derived $ propagates .from/.to/.io (#7)', async t => {
  const $v = $({stderr: 'inherit'});
  t.equal(typeof $v.from, 'function', 'derived has .from');
  t.equal(typeof $v.to, 'function', 'derived has .to');
  t.equal(typeof $v.io, 'function', 'derived has .io');
  t.equal(typeof $v.through, 'function', 'derived has .through');

  const stream = $v.from`echo derived-test`;
  t.ok(stream instanceof ReadableStream, '.from returns ReadableStream');
  const text = await readStream(stream);
  t.equal(text, 'derived-test', '.from output is correct');
});

test('derived $sh propagates .from/.to/.io (#8)', {skip: isWindows}, async t => {
  const $v = $sh({stderr: 'inherit'});
  t.equal(typeof $v.from, 'function', 'derived has .from');
  t.equal(typeof $v.to, 'function', 'derived has .to');
  t.equal(typeof $v.io, 'function', 'derived has .io');
  t.equal(typeof $v.through, 'function', 'derived has .through');

  const stream = $v.from`echo derived-sh-test`;
  t.ok(stream instanceof ReadableStream, '.from returns ReadableStream');
  const text = await readStream(stream);
  t.equal(text, 'derived-sh-test', '.from output is correct');
});
