'use strict';

import tests from 'tape-six';

import backQuote from 'dollar-shell/back-quote.js';

const $ = backQuote((command, options) => ({command, options}));

tests('backQuote', t => {
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
