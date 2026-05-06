# AGENTS.md — dollar-shell

> `dollar-shell` is a micro-library for running OS and shell commands from JavaScript/TypeScript using template tag functions. It works on Node, Deno, and Bun with the same API. All streams are web streams. Zero dependencies.

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
│   ├── index.js      # Main entry point, wires everything together
│   ├── index.d.ts    # TypeScript declarations for the full public API
│   ├── bq-spawn.js   # Template tag factory for spawn-based functions ($, $$)
│   ├── bq-shell.js   # Template tag factory for shell-based functions ($sh, shell)
│   ├── utils.js      # Shared utilities (raw, isWindows, winCmdEscape, etc.)
│   ├── spawn/        # Runtime-specific Subprocess implementations
│   │   ├── node.js   # Node.js: uses child_process + stream.Writable/Readable
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

## Architecture

- `src/index.js` is the main entry point. It dynamically imports the correct `spawn` implementation (Node/Deno/Bun) and the correct `shell` implementation (Unix/Windows) at import time.
- All tag functions (`$`, `$$`, `$sh`, `shell`) are built by factory functions in `bq-spawn.js` and `bq-shell.js`.
- **Tag function + options pattern**: calling a tag function with an options object returns a new tag function with updated defaults while preserving `.from`, `.to`, `.io`, `.through` properties.
- **raw()**: wraps a value to bypass escaping (shell) or argument splitting (spawn).
- **Platform detection**: `isWindows` boolean is exported. Runtime detection (Node/Deno/Bun) happens at import via dynamic imports.

## Key conventions

- Do not add runtime dependencies — the library is intentionally zero-dependency. DevDeps for tooling (`@types/node`, `@types/bun`, `@types/deno`, `prettier`, `tape-six`, `typescript`) are fine.
- All public API is exported from `src/index.js` and typed in `src/index.d.ts`. Keep them in sync.
- Wiki documentation lives in the `wiki/` submodule — update it alongside code changes. Cross-runtime behavior asymmetries (e.g. BYOB readers — only Deno supports them) are documented at `wiki/Cross-runtime-notes.md`.
- Tests are in `tests/` (automated, tape-six) and `tests/manual/` (manual verification scripts).
- TypeScript typing tests (`.ts`) are in `tests/` and checked by `npm run ts-check`. They can also be run as tests via `npm run ts-test`.
