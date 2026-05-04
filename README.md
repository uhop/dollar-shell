# dollar-shell [![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/dollar-shell.svg
[npm-url]: https://npmjs.org/package/dollar-shell

`dollar-shell` is a micro-library for running OS and shell commands from JavaScript/TypeScript using template tag functions. It works in [Node](https://nodejs.org/), [Deno](https://deno.land/), [Bun](https://bun.sh/) with the same API. **Web streams, TypeScript typings, zero dependencies.**

The idea is to run OS/shell commands and/or use them in stream pipelines as sources, sinks,
and transformation steps using [web streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).
It can be used together with [stream-chain](https://npmjs.org/package/stream-chain) and
[stream-json](https://npmjs.org/package/stream-json) to create efficient pipelines.
It helps using shell commands in utilities written in JavaScript/TypeScript running with
Node, Deno, or Bun.

Available components:

- `$` &mdash; spawn a process using a template string.
  - `$.from` &mdash; spawn a process and use its `stdout` as a source stream.
  - `$.to` &mdash; spawn a process and use its `stdin` as a sink stream.
  - `$.io` AKA `$.through` &mdash; spawn a process and use it as
    a transformation step in our pipeline.
- `$sh` &mdash; run a shell command using a template string.
  - `$sh.from` &mdash; run a shell command and use its `stdout` as a source stream.
  - `$sh.to` &mdash; run a shell command and use its `stdin` as a sink stream.
  - `$sh.io` AKA `$sh.through` &mdash; run a shell command and use it as
    a transformation step in our pipeline.
- Advanced components:
  - `spawn()` &mdash; spawn a process with advanced ways to configure and control it.
  - `$$` &mdash; spawn a process using a template string based on `spawn()`.
  - `shell()` &mdash; a helper to spawn a shell command using a template string based on `spawn()`.
  - Various helpers for them.

## Introduction

Run a command:

```js
import $ from 'dollar-shell';

const result = await $`echo hello`;
console.log(result.code, result.signal, result.killed);
```

Run a shell command:

```js
import {$sh} from 'dollar-shell';

const result = await $sh`ls .`;
console.log(result.code, result.signal, result.killed);
```

Run a shell command (an alias or a function) and show its result:

```js
import {$sh} from 'dollar-shell';

// custom alias that prints `stdout` and runs an interactive shell
const $p = $sh({shellArgs: ['-ic'], stdout: 'inherit'});

const result = await $p`nvm ls`;
// prints to the console the result of the command
```

Run a pipeline:

```js
import $ from 'dollar-shell';
import chain from 'stream-chain';
import lines from 'stream-chain/utils/lines.js';

chain([
  $.from`ls -l .`,
  $.io`grep LICENSE`,
  $.io`wc`,
  new TextDecoderStream(),
  lines(),
  line => console.log(line)
]);
```

## Installation

```bash
npm i --save dollar-shell
```

## Project structure

```
dollar-shell/
├── src/              # Source code
│   ├── index.js      # Main entry point, wires everything together
│   ├── index.d.ts    # TypeScript declarations for the full public API
│   ├── bq-spawn.js   # Template tag factory for spawn-based functions ($, $$)
│   ├── bq-shell.js   # Template tag factory for shell-based functions ($sh, shell)
│   ├── utils.js      # Shared utilities (raw, isWindows, winCmdEscape, etc.)
│   ├── spawn/        # Runtime-specific Subprocess implementations
│   └── shell/        # Platform-specific shell escaping and command building
├── tests/            # Automated tests (tape-six): .js, .cjs, .ts
├── tests/manual/     # Manual verification scripts
└── wiki/             # GitHub wiki documentation (git submodule)
```

## Documentation

The documentation can be found in the [wiki](https://github.com/uhop/dollar-shell/wiki).
See how it can be used in [tests/](https://github.com/uhop/dollar-shell/tree/main/tests).

For AI assistants: see [llms.txt](https://github.com/uhop/dollar-shell/blob/main/llms.txt) and [llms-full.txt](https://github.com/uhop/dollar-shell/blob/main/llms-full.txt) for LLM-optimized documentation.

Below is the documentation for the main components: `spawn()`, `$$`, `$` and `$sh`.

### `spawn()`

Spawn a process with advanced ways to configure and control it.

The signature: `spawn(command, options)`

Arguments:

- `command` &mdash; an array of strings. The first element is the command to run. The rest are its arguments.
- `options` &mdash; an optional object with options to configure the process:
  - `cwd` &mdash; the optional current working directory as a string. Defaults to `process.cwd()`.
  - `env` &mdash; the optional environment variables as an object (key-value pairs). Defaults to `process.env`.
  - `stdin` &mdash; the optional source stream. Defaults to `null`.
  - `stdout` &mdash; the optional destination stream. Defaults to `null`.
  - `stderr` &mdash; the optional destination stream. Defaults to `null`.

`stdin`, `stdout` and `stderr` can be a string (one of `'inherit'`, `'ignore'`, `'pipe'` or `'piped'`)
or `null`. The latter is equivalent to `'ignore'`. `'piped'` is an alias of `'pipe'`:

- `'inherit'` &mdash; inherit streams from the parent process. For output steams (`stdout` and `stderr`),
  it means that they will be piped to the same target, e.g., the console.
- `'ignore'` &mdash; the stream is ignored.
- `'pipe'` &mdash; the stream is available for reading or writing.

Returns a sub-process object with the following properties:

- `command` &mdash; the command that was run as an array of strings.
- `options` &mdash; the options that were passed to `spawn()`.
- `exited` &mdash; a promise that resolves to the exit code of the process. It is used to wait for the process to exit.
- `finished` &mdash; a boolean. It is `true` when the process has finished and `false` otherwise.
- `killed` &mdash; a boolean. It is `true` when the process has been killed and `false` otherwise.
- `exitCode` &mdash; the exit code of the process as a number. It is `null` if the process hasn't exited yet.
- `signalCode` &mdash; the signal code of the process as a string. It is `null` if the process hasn't exited yet.
- `stdin` &mdash; the source stream of the process if `options.stdin` was `'pipe'`. It is `null` otherwise.
- `stdout` &mdash; the destination stream of the process if `options.stdout` was `'pipe'`. It is `null` otherwise.
- `stderr` &mdash; the destination stream of the process if `options.stderr` was `'pipe'`. It is `null` otherwise.
- `kill()` &mdash; kills the process. `killed` will be `true` as soon as the process has been killed. It can be used to pipe the input and output. See `spawn()`'s `stdin` and `stdout` above for more details.

**Important:** all streams are exposed as [web streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).

#### Examples

```js
import {spawn} from 'dollar-shell';

const sp = spawn(['sleep', '5']);
await new Promise(resolve => setTimeout(resolve, 1000));
sp.kill();
await sp.exited;

sp.finished === true;
sp.killed === true;
```

### `$$`

The same as `spawn()`, but it returns a tag function that can be used as a template string.

The signatures:

```js
const sp1 = $$`ls -l ${myFile}`; // runs a command the defaults

const sp2 = $$(options)`ls -l .`; // runs a command with custom spawn options

const $tag = $$(options); // returns a tag function
const sp3 = $tag`ls -l .`; // runs a command with custom spawn options
```

This function is effectively a helper for `spawn()`. It parses the template string
into an array of string arguments. Each inserted value is included
as a separate argument if it was surrounded by whitespaces.

The second signature is used to run a command with custom spawn options. See `spawn()` above for more details.

The first signature returns a sub-process object. See `spawn()` for more details. The second signature
returns a tag function that can be used as a template string.

### `$`

This function is similar to `$$` but it uses different default spawn options related to streams and
different (simpler) return values:

- `$` &mdash; all streams are ignored. It returns a promise that resolves to an object with the following properties:
  - `code` &mdash; the exit code of the process. See `spawn()`'s `exitCode` above for more details.
  - `signal` &mdash; the signal code of the process. See `spawn()`'s `signalCode` above for more details.
  - `killed` &mdash; a boolean. It is `true` when the process has been killed and `false` otherwise. See `spawn()`'s `killed` above for more details.
- `$.from` &mdash; sets `stdout` to `pipe` and returns `stdout` of the process. It can be used to process the output. See `spawn()`'s `stdout` above for more details.
- `$.to` &mdash; sets `stdin` to `pipe` and returns `stdin` of the process. It can be used to pipe the input. See `spawn()`'s `stdin` above for more details.
- `$.io` AKA `$.through` &mdash; sets `stdin` and `stdout` to `pipe` and returns `stdin` and `stdout` of the process as a `{readable, writable}` pair. It can be used to create a pipeline where an external process can be used as a transform step.

### `$sh`

This function mirrors `$` but runs the command with the shell. It takes an options object that extends
the spawn options with the following properties:

- `shellPath` &mdash; the path to the shell.
  - On Unix-like systems it defaults to the value of
    the `SHELL` environment variable if specified. Otherwise it is `'/bin/sh'` or `'/system/bin/sh'` on Android.
  - On Windows it defaults to the value of the `ComSpec` environment variable if specified.
    Otherwise it is `cmd.exe`.
- `shellArgs` &mdash; an array of strings that are passed to the shell as arguments.
  - On Unix-like systems it defaults to `['-c']`.
  - On Windows it defaults to `['/d', '/s', '/c']` for `cmd.exe`
    or `['-c']` for `pwsh.exe` or `powershell.exe`.

The rest is identical to `$`: `$sh`, `$sh.from`, `$sh.to` and `$sh.io`/`$sh.through`.

## For AI Agents

This package ships with files to help AI coding agents and LLMs find, understand, and use it:

- **[AGENTS.md](./AGENTS.md)** — Project conventions, architecture, commands, and coding guidelines for AI agents.
- **[CLAUDE.md](./CLAUDE.md)** — Claude Code specific instructions (redirects to AGENTS.md).
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contribution guidelines for humans and AI agents.
- **[llms.txt](./llms.txt)** — Concise project overview following the [llms.txt standard](https://llmstxt.org/).
- **[llms-full.txt](./llms-full.txt)** — Self-contained complete API reference (no external links needed).

All files are included in the npm package.

## License

BSD-3-Clause

## Release History

- 1.1.14 _Fixed Bun stdin abort path, added js-check, Bun + Deno wired into CI._
- 1.1.13 _Updated dev dependencies._
- 1.1.12 _Consolidated TypeScript tests into `tests/`, removed `ts-check/`, added CJS test, improved test coverage and documentation._
- 1.1.11 _Updated dev dependencies._
- 1.1.10 _Fixed a bug with options chaining for attached functions, fixed Bun spawn on invalid commands, Windows-compatible tests, updated dev dependencies._
- 1.1.9 _Updated dev dependencies, cleaned up docs, added info for AI agents._
- 1.1.8 _Updated dev dependencies._
- 1.1.7 _Updated dev dependencies._
- 1.1.6 _Updated dev dependencies._
- 1.1.5 _Updated dev dependencies._
- 1.1.4 _Updated dev dependencies._
- 1.1.3 _Updated dev dependencies._
- 1.1.2 _Updated dev dependencies._
- 1.1.1 _Updated dev dependencies._
- 1.1.0 _Added `asDuplex` to the sub-process object._
- 1.0.5 _Updated dev dependencies._
- 1.0.4 _Fixed `raw()` for spawn commands._
- 1.0.3 _Added TSDoc comments, improved docs, fixed typos, added the missing copying of properties._
- 1.0.2 _Technical release: fixed references in the package file._
- 1.0.1 _Technical release: more tests, better documentation._
- 1.0.0 _The initial release._

The full release notes are in the wiki: [Release notes](https://github.com/uhop/dollar-shell/wiki/Release-notes).
