import test from 'tape-six';

import type {
  SpawnStreamState,
  SpawnOptions,
  Subprocess,
  DollarResult,
  ShellOptions,
  ShellEscapeOptions
} from '../src/index.js';

import $, {
  $$,
  $sh,
  shell,
  sh,
  spawn,
  cwd,
  currentExecPath,
  runFileArgs,
  isWindows,
  raw,
  winCmdEscape,
  shellEscape,
  currentShellPath,
  buildShellCommand
} from '../src/index.js';

test('types: SpawnStreamState values', t => {
  const states: SpawnStreamState[] = ['pipe', 'ignore', 'inherit', 'piped', null];
  t.equal(states.length, 5);
});

test('types: SpawnOptions', t => {
  const opts: SpawnOptions = {};
  const full: SpawnOptions = {
    cwd: '/tmp',
    env: {HOME: '/home', EMPTY: undefined},
    stdin: 'pipe',
    stdout: 'inherit',
    stderr: 'ignore'
  };
  t.ok(opts);
  t.ok(full);
});

test('types: ShellOptions extends SpawnOptions', t => {
  const opts: ShellOptions = {
    cwd: '/tmp',
    stdout: 'inherit',
    shellPath: '/bin/zsh',
    shellArgs: ['-ic']
  };
  const asSpawn: SpawnOptions = opts;
  t.ok(asSpawn);
});

test('types: ShellEscapeOptions', t => {
  const opts: ShellEscapeOptions = {};
  const full: ShellEscapeOptions = {shellPath: '/bin/bash'};
  t.ok(opts);
  t.ok(full);
});

test('types: spawn() returns Subprocess', t => {
  const sp: Subprocess = spawn(['echo', 'hello']);
  const _cmd: string[] = sp.command;
  const _opts: SpawnOptions | undefined = sp.options;
  const _exited: Promise<number> = sp.exited;
  const _finished: boolean = sp.finished;
  const _killed: boolean = sp.killed;
  const _exitCode: number | null = sp.exitCode;
  const _signalCode: string | null = sp.signalCode;
  const _stdin: WritableStream | null = sp.stdin;
  const _stdout: ReadableStream | null = sp.stdout;
  const _stderr: ReadableStream | null = sp.stderr;
  const _duplex: {readable: ReadableStream; writable: WritableStream} = sp.asDuplex;
  sp.kill();
  t.pass();
});

test('types: $$ returns Subprocess', t => {
  const sp: Subprocess = $$`echo hello`;
  t.ok(sp.exited instanceof Promise);
  sp.kill();
});

test('types: $$ accepts options', t => {
  const $custom = $$({stdout: 'pipe'});
  const sp: Subprocess = $custom`echo hello`;
  sp.kill();
  t.pass();
});

test('types: $ returns Promise<DollarResult>', async t => {
  const result: DollarResult = await $`echo hello`;
  const _code: number | null = result.code;
  const _signal: string | null = result.signal;
  const _killed: boolean = result.killed;
  t.pass();
});

test('types: $ accepts options', async t => {
  const $custom = $({stdout: 'inherit'});
  const result: DollarResult = await $custom`echo hello`;
  t.ok(result);
});

test('types: $.from returns ReadableStream', t => {
  const stream: ReadableStream = $.from`echo hello`;
  t.ok(stream instanceof ReadableStream);
});

test('types: $.to returns WritableStream', t => {
  const catCmd = isWindows ? 'findstr /r .*' : 'cat';
  const stream: WritableStream = $.to`${catCmd}`;
  t.ok(stream instanceof WritableStream);
  stream.getWriter().close();
});

test('types: $.io returns DuplexPair', t => {
  const catCmd = isWindows ? 'findstr /r .*' : 'cat';
  const duplex: {readable: ReadableStream; writable: WritableStream} = $.io`${catCmd}`;
  t.ok(duplex.readable instanceof ReadableStream);
  t.ok(duplex.writable instanceof WritableStream);
  duplex.writable.getWriter().close();
});

test('types: $.through is $.io', t => {
  t.equal($.through, $.io);
});

test('types: $ with options returns Dollar', async t => {
  const $v = $({stderr: 'inherit'});
  const result: DollarResult = await $v`echo hello`;
  t.ok(result);
});

test('types: DollarImpl has from/to/io/through', t => {
  const _from: (strings: TemplateStringsArray, ...args: unknown[]) => ReadableStream = $.from;
  const _to: (strings: TemplateStringsArray, ...args: unknown[]) => WritableStream = $.to;
  const _io: (
    strings: TemplateStringsArray,
    ...args: unknown[]
  ) => {readable: ReadableStream; writable: WritableStream} = $.io;
  const _through: typeof _io = $.through;
  t.pass();
});

test('types: shell returns Subprocess', {skip: isWindows}, t => {
  const sp: Subprocess = shell`echo hello`;
  sp.kill();
  t.pass();
});

test('types: shell accepts ShellOptions', {skip: isWindows}, t => {
  const $custom = shell({shellPath: '/bin/sh', stdout: 'pipe'});
  const sp: Subprocess = $custom`echo hello`;
  sp.kill();
  t.pass();
});

test('types: sh is typeof shell', t => {
  const _sh: typeof shell = sh;
  t.equal(sh, shell);
});

test('types: $sh returns Promise<DollarResult>', {skip: isWindows}, async t => {
  const result: DollarResult = await $sh`echo hello`;
  t.ok(result);
});

test('types: $sh accepts ShellOptions', {skip: isWindows}, async t => {
  const $custom = $sh({shellPath: '/bin/sh'});
  const result: DollarResult = await $custom`echo hello`;
  t.ok(result);
});

test('types: $sh.from returns ReadableStream', {skip: isWindows}, t => {
  const stream: ReadableStream = $sh.from`echo hello`;
  t.ok(stream instanceof ReadableStream);
});

test('types: $sh.to returns WritableStream', {skip: isWindows}, t => {
  const stream: WritableStream = $sh.to`cat`;
  t.ok(stream instanceof WritableStream);
  stream.getWriter().close();
});

test('types: $sh.io returns DuplexPair', {skip: isWindows}, t => {
  const duplex: {readable: ReadableStream; writable: WritableStream} = $sh.io`cat`;
  t.ok(duplex.readable instanceof ReadableStream);
  t.ok(duplex.writable instanceof WritableStream);
  duplex.writable.getWriter().close();
});

test('types: $sh.through is $sh.io', t => {
  t.equal($sh.through, $sh.io);
});

test('types: utility functions', t => {
  const _cwd: string = cwd();
  const _exec: string = currentExecPath();
  const _args: string[] = runFileArgs;
  const _win: boolean = isWindows;
  const _raw: object = raw('hello');
  const _escape: string = shellEscape('hello');
  const _shellPath: string = currentShellPath();
  const _cmd: string[] = buildShellCommand(undefined, undefined, 'echo hello');
  t.pass();
});

test('types: winCmdEscape', t => {
  const result: object | string = winCmdEscape('hello');
  t.ok(result);
});

test('types: $$.asDuplex returns DuplexPair', t => {
  const catCmd = isWindows ? 'findstr /r .*' : 'cat';
  const sp = $$({stdin: 'pipe', stdout: 'pipe'})`${catCmd}`;
  const duplex: {readable: ReadableStream; writable: WritableStream} = sp.asDuplex;
  t.ok(duplex.readable instanceof ReadableStream, 'readable is ReadableStream');
  t.ok(duplex.writable instanceof WritableStream, 'writable is WritableStream');
  duplex.writable.getWriter().close();
});

test('types: $sh double option chaining', {skip: isWindows}, async t => {
  const $custom = $sh({stdout: 'inherit'});
  const $custom2 = $custom({shellPath: '/bin/sh'});
  const result: DollarResult = await $custom2`echo chain`;
  t.ok(result);
});
