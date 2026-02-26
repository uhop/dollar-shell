import test from 'tape-six';

import {shellEscape, currentShellPath, buildShellCommand, isWindows} from '../src/index.js';

test('shellEscape (Unix)', {skip: isWindows}, t => {
  t.equal(shellEscape('hello'), "'hello'", 'simple string');
  t.equal(shellEscape('hello world'), "'hello world'", 'string with space');
  t.equal(shellEscape("it's"), "'it'\\''s'", 'string with single quote');
  t.equal(shellEscape(''), "''", 'empty string');
  t.equal(shellEscape(123), "'123'", 'number coerced to string');
  t.equal(shellEscape('a"b'), "'a\"b'", 'double quotes preserved inside single quotes');
  t.equal(shellEscape('$HOME'), "'$HOME'", 'dollar sign escaped');
  t.equal(shellEscape('a\nb'), "'a\nb'", 'newline preserved inside single quotes');
});

test('currentShellPath', {skip: isWindows}, t => {
  const shell = currentShellPath();
  t.equal(typeof shell, 'string', 'returns a string');
  t.ok(shell.length > 0, 'non-empty');
});

test('buildShellCommand (Unix)', {skip: isWindows}, t => {
  const cmd = buildShellCommand(undefined, undefined, 'echo hello');
  t.ok(Array.isArray(cmd), 'returns an array');
  t.equal(cmd.length, 3, 'has 3 elements');
  t.equal(cmd[1], '-c', 'default arg is -c');
  t.equal(cmd[2], 'echo hello', 'command is last');

  const custom = buildShellCommand('/bin/zsh', ['-ic'], 'ls');
  t.equal(custom[0], '/bin/zsh', 'custom shell path');
  t.equal(custom[1], '-ic', 'custom shell args');
  t.equal(custom[2], 'ls', 'command preserved');
});
