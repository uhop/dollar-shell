import test from 'tape-six';

import bqShell from '../src/bq-shell.js';
import {raw} from '../src/utils.js';

const escape = s => `[${s}]`;
const $sh = bqShell(escape, (command, options) => ({command, options}));

test('bqShell: basic template parsing', t => {
  let result = $sh`echo hello`;
  t.deepEqual(result, {command: 'echo hello', options: {}});

  result = $sh`echo ${'world'}`;
  t.deepEqual(result, {command: 'echo [world]', options: {}});

  result = $sh`echo ${'a'} ${'b'}`;
  t.deepEqual(result, {command: 'echo [a] [b]', options: {}});
});

test('bqShell: raw values bypass escaping', t => {
  let result = $sh`echo ${raw('world')}`;
  t.deepEqual(result, {command: 'echo world', options: {}});

  result = $sh`echo ${raw('a | b')}`;
  t.deepEqual(result, {command: 'echo a | b', options: {}});
});

test('bqShell: empty args are skipped', t => {
  const result = $sh`echo ${''} hello`;
  t.deepEqual(result, {command: 'echo  hello', options: {}});
});

test('bqShell: options chaining', t => {
  const $custom = $sh({stdout: 'inherit'});
  const result = $custom`echo hello`;
  t.deepEqual(result, {command: 'echo hello', options: {stdout: 'inherit'}});

  const $custom2 = $custom({stderr: 'inherit'});
  const result2 = $custom2`echo hello`;
  t.deepEqual(result2, {
    command: 'echo hello',
    options: {stdout: 'inherit', stderr: 'inherit'}
  });
});

test('bqShell: options chaining propagates properties (#8)', t => {
  const $withProps = bqShell(escape, (command, options) => ({command, options}));
  $withProps.from = bqShell(escape, (command, options) => ({from: true, command, options}));

  const derived = $withProps({stderr: 'inherit'});
  t.equal(typeof derived.from, 'function', 'derived has .from');

  const result = derived.from`echo hello`;
  t.deepEqual(result, {from: true, command: 'echo hello', options: {stderr: 'inherit'}});
});
