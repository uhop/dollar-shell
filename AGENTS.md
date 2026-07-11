# AGENTS.md — dollar-shell

> `dollar-shell` is a micro-library for running OS and shell commands from JavaScript/TypeScript using template tag functions. It works on Node, Deno, and Bun with the same API. Streams are web streams by default; the `dollar-shell/node` entry offers the same API with Node streams. Zero dependencies.

For detailed usage docs and API references see the [wiki](https://github.com/uhop/dollar-shell/wiki).

## Setup

```bash
git clone --recursive https://github.com/uhop/dollar-shell.git
cd dollar-shell
npm install
```

The wiki is a git submodule in `wiki/`.

## Commands

- **Test (Node):** `npm test` (runs `tape6 --flags FO`)
- **Test (Bun):** `npm run test:bun`
- **Test (Deno):** `npm run test:deno`
- **TypeScript check:** `npm run ts-check` (`tsc --noEmit`, validates the `.d.ts` sidecars)
- **JavaScript check:** `npm run js-check` (`tsc --project tsconfig.check.json`, lints the `.js` sources for unused vars / undeclared refs)
- **TypeScript tests:** `npm run ts-test` (run `.ts` test files with tape6)
- **Lint:** `npm run lint` (Prettier check)
- **Lint fix:** `npm run lint:fix` (Prettier write)

## Project structure

```
dollar-shell/
├── package.json          # Package config
├── tsconfig.json         # Strict TS config — checks the .d.ts sidecars
├── tsconfig.check.json   # Lint config — checkJs on .js sources, with @types/{node,bun,deno} for cross-runtime globals
├── src/                  # Source code
│   ├── index.js      # Main (web-streams) entry: backend selection (+ DSH_FORCE_NODE gate) → buildApi
│   ├── index.d.ts    # TypeScript declarations for the full public API
│   ├── build.js      # Shared buildApi(backend): shell selection + tag-function wiring (both entries use it)
│   ├── node/         # `dollar-shell/node` entry — same API, Node streams instead of web streams
│   ├── bq-spawn.js   # Template tag factory for spawn-based functions ($, $$)
│   ├── bq-shell.js   # Template tag factory for shell-based functions ($sh, shell)
│   ├── temp-dir.js   # withTempDir(): scoped temporary directory (node:fs/promises, all runtimes)
│   ├── utils.js      # Shared utilities (raw, isWindows, winCmdEscape, getEnv, etc.)
│   ├── spawn/        # Runtime-specific Subprocess implementations
│   │   ├── node.js   # Node.js: child_process; web streams by default, raw Node streams for dollar-shell/node
│   │   ├── deno.js   # Deno: uses Deno.Command
│   │   └── bun.js    # Bun: uses Bun.spawn
│   └── shell/        # Platform-specific shell escaping and command building
│       ├── unix.js   # Unix: single-quote escaping, $SHELL detection
│       └── windows.js # Windows: cmd.exe and PowerShell escaping
├── tests/            # Automated tests (tape-six): .js, .cjs, .ts
├── tests/manual/     # Manual verification scripts
└── wiki/             # GitHub wiki documentation (git submodule)
```

## Quick reference

```js
import {$, $$, $sh, shell, sh, spawn} from 'dollar-shell';

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
$.from`ls -l .`.pipeThrough($.io`grep LIC`).pipeTo($.to({stdout: 'inherit'})`wc`);

// Custom options (returns new tag function with updated defaults)
const $verbose = $({stdout: 'inherit', stderr: 'inherit'});
await $verbose`ls -l .`;
```

## Code style

- **ES modules** throughout (`"type": "module"` in package.json).
- **No transpilation** — code runs directly in all target runtimes.
- **Prettier** for formatting — run `npm run lint:fix` before committing.
- Imports at the top of files, using `import` syntax.
- **No comments that narrate the code.** Don't write a comment that restates _what_ the code does. Allowed, each as the shortest possible marker: JSDoc when requested or required; a reference for a non-trivial algorithm; a non-trivial _decision_ or constraint — _why_ it's this way, including footgun/ordering caveats that have a real reason. The bar is _why_, never _what_. Strip narrating comments opportunistically in files you're already editing.

## Architecture

- `src/index.js` is the main entry point. At import time it selects the runtime-native backend, then calls `buildApi()` (`src/build.js`), which picks the platform shell module and wires up the tag functions. Setting `globalThis.DSH_FORCE_NODE` or the `DSH_FORCE_NODE` env var swaps **only the spawn implementation** to the Node backend (`node:child_process`, run through Bun/Deno's Node compat); the runtime target and its launch parameters (`currentExecPath` / `runFileArgs` / `cwd`) stay native, so a forced child of Bun/Deno is still `bun run …` / `deno run …`, never a bare `node`.
- `dollar-shell/node` (`src/node/index.js`) is a second entry: the identical API built by the same `buildApi`, but spawning through the Node backend's raw-streams variant (runtime launch stays native), so `stdin`/`stdout`/`stderr` are Node streams (and `asDuplex`/`.io`/`.through` a Node `Duplex`) instead of web streams.
- All tag functions (`$`, `$$`, `$sh`, `shell`) are built by factory functions in `bq-spawn.js` and `bq-shell.js`.
- **Tag function + options pattern**: calling a tag function with an options object returns a new tag function with updated defaults while preserving `.from`, `.to`, `.io`, `.through` properties.
- **raw()**: wraps a value to bypass escaping (shell) or argument splitting (spawn).
- **Platform detection**: `isWindows` boolean is exported. Runtime detection (Node/Deno/Bun) happens at import via dynamic imports.

## Key conventions

- Do not add runtime dependencies — the library is intentionally zero-dependency. DevDeps for tooling (`@types/node`, `@types/bun`, `@types/deno`, `prettier`, `tape-six`, `typescript`) are fine.
- The public API is exported from `src/index.js` (typed in `src/index.d.ts`) and the parallel `dollar-shell/node` entry from `src/node/index.js` (typed in `src/node/index.d.ts`, which reuses the stream-free half of `index.d.ts`). Keep each `.js` and its `.d.ts` in sync.
- Wiki documentation lives in the `wiki/` submodule — update it alongside code changes. Cross-runtime behavior asymmetries (e.g. BYOB readers — only Deno supports them) are documented at `wiki/Cross-runtime-notes.md`.
- Tests are in `tests/` (automated, tape-six) and `tests/manual/` (manual verification scripts).
- TypeScript typing tests (`.ts`) are in `tests/` and checked by `npm run ts-check`. They can also be run as tests via `npm run ts-test`.
