import test from 'tape-six';

import bqSpawn from '../src/bq-spawn.js';
import {raw} from '../src/utils.js';

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

test('bqSpawn: raw values', t => {
  let result = $`ls ${raw('-l -a')} .`;
  t.deepEqual(
    result,
    {command: ['ls', '-l', '-a', '.'], options: {}},
    'raw value is split like a string'
  );

  result = $`ls${raw(' -l')} .`;
  t.deepEqual(
    result,
    {command: ['ls', '-l', '.'], options: {}},
    'raw value concatenated with previous'
  );

  result = $`echo ${raw('')} hello`;
  t.deepEqual(result, {command: ['echo', 'hello'], options: {}}, 'empty raw value is skipped');
});

test('bqSpawn: options chaining', t => {
  const $a = $({stdout: 'inherit'});
  const resultA = $a`ls .`;
  t.deepEqual(resultA, {command: ['ls', '.'], options: {stdout: 'inherit'}});

  const $b = $a({stderr: 'inherit'});
  const resultB = $b`ls .`;
  t.deepEqual(
    resultB,
    {
      command: ['ls', '.'],
      options: {stdout: 'inherit', stderr: 'inherit'}
    },
    'options merge across chaining levels'
  );

  const $c = $b({stdout: 'ignore'});
  const resultC = $c`ls .`;
  t.equal(resultC.options.stdout, 'ignore', 'later options override earlier ones');
  t.equal(resultC.options.stderr, 'inherit', 'non-overridden options preserved');
});

test('bqSpawn: options chaining propagates properties (#7)', t => {
  const $withFrom = bqSpawn((command, options) => ({command, options}));
  $withFrom.from = bqSpawn((command, options) => ({from: true, command, options}));
  $withFrom.to = bqSpawn((command, options) => ({to: true, command, options}));

  const derived = $withFrom({stderr: 'inherit'});
  t.equal(typeof derived.from, 'function', 'derived has .from');
  t.equal(typeof derived.to, 'function', 'derived has .to');

  const fromResult = derived.from`echo hello`;
  t.deepEqual(
    fromResult,
    {
      from: true,
      command: ['echo', 'hello'],
      options: {stderr: 'inherit'}
    },
    '.from receives the derived options'
  );

  const toResult = derived.to`cat`;
  t.deepEqual(
    toResult,
    {
      to: true,
      command: ['cat'],
      options: {stderr: 'inherit'}
    },
    '.to receives the derived options'
  );
});

test('bqSpawn: non-bq attached values are copied unchanged across configurator', t => {
  const $custom = bqSpawn((command, options) => ({command, options}));
  const plainFn = data => ({plain: true, data});
  $custom.helper = plainFn;
  $custom.label = 'tag-v1';
  $custom.config = {retries: 3};

  const derived = $custom({stderr: 'inherit'});
  t.equal(derived.helper, plainFn, 'plain function copied by reference, not invoked');
  t.equal(derived.label, 'tag-v1', 'string value copied');
  t.equal(derived.config, $custom.config, 'object reference copied');
  t.deepEqual(
    derived.helper('payload'),
    {plain: true, data: 'payload'},
    'copied function still callable with its real signature'
  );
});
