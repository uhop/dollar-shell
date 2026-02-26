import test from 'tape-six';

import {
  raw,
  isRawValue,
  getRawValue,
  verifyStrings,
  winCmdEscape,
  isWindows
} from '../src/utils.js';
import {toBase64} from '../src/utils.js';

test('raw / isRawValue / getRawValue', t => {
  const wrapped = raw(42);
  t.ok(isRawValue(wrapped), 'raw() creates a raw value');
  t.equal(getRawValue(wrapped), 42, 'getRawValue() unwraps it');

  const wrappedStr = raw('hello');
  t.ok(isRawValue(wrappedStr), 'raw() works with strings');
  t.equal(getRawValue(wrappedStr), 'hello', 'getRawValue() returns the string');

  t.notOk(isRawValue(null), 'null is not a raw value');
  t.notOk(isRawValue(undefined), 'undefined is not a raw value');
  t.notOk(isRawValue(42), 'number is not a raw value');
  t.notOk(isRawValue('hello'), 'string is not a raw value');
  t.notOk(isRawValue({}), 'plain object is not a raw value');
  t.notOk(isRawValue([]), 'array is not a raw value');
});

test('verifyStrings', t => {
  const tag = (strings, ...args) => strings;

  t.ok(verifyStrings(tag`hello`), 'template strings array passes');
  t.ok(verifyStrings(tag`hello ${'world'} !`), 'template strings with args passes');

  t.notOk(verifyStrings(['hello', 'world']), 'plain array fails (no .raw)');
  t.notOk(verifyStrings({}), 'object fails');
  t.notOk(verifyStrings(null), 'null fails');
  t.notOk(verifyStrings(undefined), 'undefined fails');
  t.notOk(verifyStrings('hello'), 'string fails');
  t.notOk(verifyStrings({stdout: 'inherit'}), 'options object fails');
});

test('winCmdEscape', t => {
  if (isWindows) {
    const escaped = winCmdEscape('hello');
    t.ok(isRawValue(escaped), 'on Windows returns a raw value');
    t.equal(typeof getRawValue(escaped), 'string', 'raw value contains a string');
  } else {
    const result = winCmdEscape('hello');
    t.equal(result, 'hello', 'on non-Windows returns the string as-is');
    t.notOk(isRawValue(result), 'on non-Windows does not return a raw value');
  }
});

test('toBase64', t => {
  t.equal(typeof toBase64('hello'), 'string', 'returns a string');
  t.equal(toBase64(''), btoa(''), 'empty string');

  const result = toBase64('A');
  const decoded = atob(result);
  t.equal(decoded.charCodeAt(0), 0x41, 'first byte is low byte of "A"');
  t.equal(decoded.charCodeAt(1), 0x00, 'second byte is high byte of "A" (0)');
});
