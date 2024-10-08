'use strict';

import test from 'tape-six';

import bqSpawn from '../src/bq-spawn.js';

const $ = bqSpawn((command, options) => ({command, options}));

test('bqSpawn', t => {
  let result = $`ls -l ${'.'}`;
  t.deepEqual(result, {command: ['ls', '-l', '.'], options: {}});

  result = $`${'ls'} -l ${'.'}`;
  t.deepEqual(result, {command: ['ls', '-l', '.'], options: {}});

  result = $` ${'ls'} -l ${'.'} `;
  t.deepEqual(result, {command: ['ls', '-l', '.'], options: {}});

  result = $`${'l'}s -l a${'.'}b `;
  t.deepEqual(result, {command: ['ls', '-l', 'a.b'], options: {}});

  result = $({stdout: 'inherit'})`ls ${'x y'} ${"y'z"}`;
  t.deepEqual(result, {command: ['ls', 'x y', "y'z"], options: {stdout: 'inherit'}});
});
