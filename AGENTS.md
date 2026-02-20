# Agent Instructions for dollar-shell

This file provides guidance for AI coding agents working with or on the `dollar-shell` package.

## What This Package Does

`dollar-shell` runs OS and shell commands from JavaScript/TypeScript using template tag functions. It works on Node, Deno, and Bun with the same API. All streams are web streams.

## Quick Reference

```js
import $, {$$, $sh, shell, sh, spawn} from 'dollar-shell';

// Run a command, get exit info
const result = await $`echo hello`;
// result: {code: 0, signal: null, killed: false}

// Run a command, get full Subprocess
const sp = $$`sleep 5`;
sp.kill();
await sp.exited;

// Shell command (supports pipes, aliases)
await $sh`ls -l . | grep LICENSE | wc`;

// Stream pipelines
$.from`ls -l .`
  .pipeThrough($.io`grep LIC`)
  .pipeTo($.to({stdout: 'inherit'})`wc`);

// Custom options (returns new tag function with updated defaults)
const $verbose = $({stdout: 'inherit', stderr: 'inherit'});
await $verbose`ls -l .`;
```

## Architecture

- `src/index.js` — Main entry point, wires everything together
- `src/index.d.ts` — TypeScript declarations for the full public API
- `src/bq-spawn.js` — Template tag factory for spawn-based functions (`$`, `$$`)
- `src/bq-shell.js` — Template tag factory for shell-based functions (`$sh`, `shell`)
- `src/utils.js` — Shared utilities (`raw`, `isWindows`, `winCmdEscape`, etc.)
- `src/spawn/node.js`, `src/spawn/deno.js`, `src/spawn/bun.js` — Runtime-specific Subprocess implementations
- `src/shell/unix.js`, `src/shell/windows.js` — Platform-specific shell escaping and command building

## Key Patterns

- **Tag function + options pattern**: All tag functions (`$`, `$$`, `$sh`, `shell`) can be called with an options object to produce a new tag function with updated defaults. The new function retains all properties (`.from`, `.to`, `.io`, `.through`).
- **raw()**: Wraps a value to bypass escaping (shell) or argument splitting (spawn).
- **Platform detection**: `isWindows` boolean is exported. Runtime detection (Node/Deno/Bun) happens at import via dynamic imports.

## When Using This Package

- Import `$` as the default export for simple command execution.
- Use `$sh` when you need shell features (pipes, aliases, globbing).
- Use `$$` or `shell` when you need the full `Subprocess` object (kill, streams, exit code).
- Use `.from`, `.to`, `.io`/`.through` for stream pipelines with web streams.
- Always `await` the result of `$` and `$sh` (they return promises).
- `$$` and `shell` return `Subprocess` synchronously — use `await sp.exited` to wait.

## When Modifying This Package

- Run `npm test` to execute tests (uses tape-six).
- Run `npm run ts-check` to verify TypeScript declarations (`tsc --noEmit`).
- Keep `src/index.d.ts` in sync with any API changes in `src/index.js`.
- The wiki (in the `wiki/` submodule) documents the public API — update it alongside code changes.
- Tests are in `tests/` (automated) and `tests/manual/` (manual verification).
- TypeScript usage examples are in `ts-check/` — they are compiled but not executed during `npm run ts-check`.
