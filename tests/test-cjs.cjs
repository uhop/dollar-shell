const {test} = require('tape-six');

test('CommonJS: exports', async t => {
  const mod = await import('../src/index.js');

  t.equal(typeof mod.default, 'function', 'default export is $');
  t.equal(typeof mod.spawn, 'function', 'spawn is exported');
  t.equal(typeof mod.$$, 'function', '$$ is exported');
  t.equal(typeof mod.$sh, 'function', '$sh is exported');
  t.equal(typeof mod.shell, 'function', 'shell is exported');
  t.equal(typeof mod.sh, 'function', 'sh is exported');
  t.equal(typeof mod.raw, 'function', 'raw is exported');
  t.equal(typeof mod.winCmdEscape, 'function', 'winCmdEscape is exported');
  t.equal(typeof mod.isWindows, 'boolean', 'isWindows is exported');
  t.equal(typeof mod.cwd, 'function', 'cwd is exported');
  t.equal(typeof mod.currentExecPath, 'function', 'currentExecPath is exported');
  t.ok(Array.isArray(mod.runFileArgs), 'runFileArgs is an array');
  t.equal(typeof mod.shellEscape, 'function', 'shellEscape is exported');
  t.equal(typeof mod.currentShellPath, 'function', 'currentShellPath is exported');
  t.equal(typeof mod.buildShellCommand, 'function', 'buildShellCommand is exported');
});

test('CommonJS: $ basic usage', async t => {
  const {default: $, isWindows, raw} = await import('../src/index.js');

  const result = isWindows
    ? await $`node -e ${raw('process.stdout.write("ok")')}`
    : await $`echo ok`;
  t.equal(result.code, 0, 'exit code is 0');
  t.equal(result.signal, null, 'signal is null');
  t.equal(result.killed, false, 'killed is false');
});

test('CommonJS: $.from stream', async t => {
  const {default: $, isWindows, raw} = await import('../src/index.js');

  const stream = isWindows
    ? $.from`node -e ${raw('process.stdout.write("cjs-test")')}`
    : $.from`echo cjs-test`;
  t.ok(stream instanceof ReadableStream, 'returns ReadableStream');

  const reader = stream.getReader();
  const chunks = [];
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const text = chunks
    .map(c => new TextDecoder().decode(c))
    .join('')
    .trim();
  t.equal(text, 'cjs-test', 'stream output is correct');
});
