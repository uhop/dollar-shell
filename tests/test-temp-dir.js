import test from 'tape-six';

import {stat, writeFile} from 'node:fs/promises';
import {join, basename} from 'node:path';

import {withTempDir} from '../src/index.js';

test('withTempDir: usable directory, result propagates, cleanup', async t => {
  let seen;
  const result = await withTempDir(async dir => {
    seen = dir;
    t.ok(basename(dir).startsWith('dsh-'), 'default prefix');
    const info = await stat(dir);
    t.ok(info.isDirectory(), 'directory exists');
    await writeFile(join(dir, 'probe.txt'), 'data');
    return 42;
  });
  t.equal(result, 42, 'fn result propagates');
  await t.rejects(stat(seen), 'directory removed after success');
});

test('withTempDir: cleanup on throw, original error propagates', async t => {
  const error = new Error('boom');
  let seen, caught;
  try {
    await withTempDir(dir => {
      seen = dir;
      throw error;
    });
  } catch (e) {
    caught = e;
  }
  t.equal(caught, error, 'original error propagates');
  await t.rejects(stat(seen), 'directory removed after failure');
});

test('withTempDir: honors prefix', async t => {
  await withTempDir(
    dir => {
      t.ok(basename(dir).startsWith('dsh-test-'), 'prefix honored');
    },
    {prefix: 'dsh-test-'}
  );
});
