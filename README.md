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

- [`$`](https://github.com/uhop/dollar-shell/wiki/$) &mdash; spawn a process using a template string.
  - `$.from` &mdash; spawn a process and use its `stdout` as a source stream.
  - `$.to` &mdash; spawn a process and use its `stdin` as a sink stream.
  - `$.io` AKA `$.through` &mdash; spawn a process and use it as
    a transformation step in our pipeline.
- [`$sh`](https://github.com/uhop/dollar-shell/wiki/$sh) &mdash; run a shell command using a template string.
  - `$sh.from` &mdash; run a shell command and use its `stdout` as a source stream.
  - `$sh.to` &mdash; run a shell command and use its `stdin` as a sink stream.
  - `$sh.io` AKA `$sh.through` &mdash; run a shell command and use it as
    a transformation step in our pipeline.
- [`capture`](https://github.com/uhop/dollar-shell/wiki/capture) &mdash; run a command and collect its `stdout`/`stderr` as strings.
- Advanced components:
  - [`spawn()`](https://github.com/uhop/dollar-shell/wiki/spawn) &mdash; spawn a process with advanced ways to configure and control it.
  - [`$$`](https://github.com/uhop/dollar-shell/wiki/$$) &mdash; spawn a process using a template string based on `spawn()`.
  - [`shell()`](https://github.com/uhop/dollar-shell/wiki/shell) &mdash; a helper to spawn a shell command using a template string based on `spawn()`.
  - Various [helpers](https://github.com/uhop/dollar-shell/wiki/Utilities) for them.

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

Capture the output of a command:

```js
import {capture} from 'dollar-shell';

const {code, stdout, stderr} = await capture`git rev-parse HEAD`;

// feed a string to stdin
const result = await capture({input: 'some text'})`cat`;
result.stdout === 'some text';
```

## Installation

```bash
npm i --save dollar-shell
```

## Documentation

Full documentation is in the **[wiki](https://github.com/uhop/dollar-shell/wiki)** &mdash; browse the [index](https://github.com/uhop/dollar-shell/wiki/Home), or [search it](https://uhop.github.io/wiki-search/app/?wiki=uhop/dollar-shell) by name.
See how it can be used in [tests/](https://github.com/uhop/dollar-shell/tree/main/tests).

For AI assistants: see [llms.txt](https://github.com/uhop/dollar-shell/blob/main/llms.txt) and [llms-full.txt](https://github.com/uhop/dollar-shell/blob/main/llms-full.txt) for LLM-optimized documentation.

## Forcing the Node backend

Each runtime uses its own backend by default (`node:child_process` on Node, `Bun.spawn` on Bun,
`Deno.Command` on Deno). Set the **`DSH_FORCE_NODE` environment variable** (e.g. `DSH_FORCE_NODE=1`) to
make every runtime spawn through the Node backend &mdash; it swaps **only the spawn mechanism**, the
runtime launch stays native. Handy for sidestepping runtime-specific quirks. Details and scoping (the
whole process tree vs the current process only) are in the
[Cross-runtime notes](https://github.com/uhop/dollar-shell/wiki/Cross-runtime-notes).

## Node streams (`dollar-shell/node`)

The default entry exposes [web streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) on
`stdin`/`stdout`/`stderr`. If you'd rather work with Node streams &mdash; to pipe straight into
`fs`/`zlib`/etc. with no adapter &mdash; import the identical API from `dollar-shell/node` instead:

```js
import {spawn} from 'dollar-shell/node';

const sp = spawn(['cat', 'file.txt'], {stdout: 'pipe'});
sp.stdout.pipe(process.stdout); // sp.stdout is a Node Readable
```

Only the stream types differ (`stdin` is a Node `Writable`, `stdout`/`stderr` are Node `Readable`s,
`asDuplex`/`.io`/`.through` return a Node `Duplex`). See
[Node streams](https://github.com/uhop/dollar-shell/wiki/Node-streams) for details.

## For AI Agents

This package ships with files to help AI coding agents and LLMs find, understand, and use it:

- **[AGENTS.md](./AGENTS.md)** — Project conventions, architecture, commands, and coding guidelines for AI agents.
- **[CLAUDE.md](./CLAUDE.md)** — Claude Code specific instructions (redirects to AGENTS.md).
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contribution guidelines for humans and AI agents.
- **[llms.txt](./llms.txt)** — Concise project overview following the [llms.txt standard](https://llmstxt.org/).
- **[llms-full.txt](./llms-full.txt)** — Self-contained complete API reference (no external links needed).

The machine-readable `llms.txt` and `llms-full.txt` ship inside the npm package, so AI tools can read them straight from `node_modules`. `AGENTS.md` and `CLAUDE.md` are authoring-side docs kept in the repository.

## License

BSD-3-Clause

## Release History

- 1.3.0 _Added `capture` (run a command, collect stdout/stderr as strings) and the `signal` option (an `AbortSignal` kills the subprocess)._
- 1.2.1 _Bugfix: `DSH_FORCE_NODE` and `dollar-shell/node` now switch only the spawn mechanism — spawned children stay native (`bun run …` / `deno run …`)._
- 1.2.0 _Added `dollar-shell/node` with Node streams and a `DSH_FORCE_NODE` flag to force the Node backend on any runtime._
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
