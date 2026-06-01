# Architecture

`dollar-shell` is a micro-library for running OS and shell commands from JavaScript / TypeScript using template tag functions. It runs the same API on Node, Deno, and Bun, exposing process I/O as web streams. **Zero runtime dependencies** — devDeps only for type-checking, formatting, and the test runner.

## Project layout

```
dollar-shell/
├── package.json          # Package config; "type": "module"
├── tsconfig.json         # Strict TS — checks the .d.ts sidecars
├── tsconfig.check.json   # Lint TS — checkJs on .js sources, with @types/{node,bun,deno}
├── src/                  # Source code
│   ├── index.js          # Main (web-streams) entry: selects the runtime backend (with the DSH_FORCE_NODE gate), calls buildApi
│   ├── index.d.ts        # TypeScript declarations for the full public API (web streams)
│   ├── build.js          # Shared buildApi(backend): platform shell selection + tag-function wiring; used by both entries
│   ├── node/             # Node-streams entry: `dollar-shell/node`
│   │   ├── index.js      # Same API built on the Node backend's raw-streams variant
│   │   └── index.d.ts    # Node-stream types (reuses the stream-free half of index.d.ts)
│   ├── bq-spawn.js       # Template tag factory for spawn-based functions ($, $$)
│   ├── bq-shell.js       # Template tag factory for shell-based functions ($sh, shell)
│   ├── utils.js          # Shared utilities (raw, isWindows, winCmdEscape, getEnv, etc.)
│   ├── spawn/            # Runtime-specific Subprocess implementations
│   │   ├── node.js       # Node.js: child_process; Web streams by default, raw Node streams (+ Duplex) for dollar-shell/node
│   │   ├── deno.js       # Deno: Deno.Command
│   │   └── bun.js        # Bun: Bun.spawn (with FileSink → UnderlyingSink adapter)
│   └── shell/            # Platform-specific shell escaping and command building
│       ├── unix.js       # Unix: single-quote escaping, $SHELL detection
│       └── windows.js    # Windows: cmd.exe / PowerShell escaping
├── tests/                # Automated tests (tape-six): .js, .cjs, .ts
│   └── manual/           # Manual verification scripts (not run by CI)
├── wiki/                 # GitHub wiki documentation (git submodule)
├── llms.txt              # Concise LLM reference
├── llms-full.txt         # Detailed LLM reference (full surface)
├── AGENTS.md             # AI agent rules and project conventions
├── CLAUDE.md             # Pointer to AGENTS.md
├── CONTRIBUTING.md       # Contribution guidelines
├── .windsurf/workflows/  # Windsurf multi-step workflows
├── .claude/commands/     # Claude Code slash-command equivalents
└── .github/
    ├── workflows/        # CI: tests.yml runs Node/Bun/Deno × ubuntu/windows/macOS
    ├── COPILOT-INSTRUCTIONS.md  # Pointer to AGENTS.md
    ├── FUNDING.yml
    └── dependabot.yml
```

## Core concepts

### Tag function + options pattern

Every public tag function (`$`, `$$`, `$sh`, `shell`, `sh`) supports two call shapes:

```js
$`ls -l ${dir}`; // run with default options
$(options)`ls -l ${dir}`; // run with custom options
const $verbose = $({stdout: 'inherit'}); // returns a new tag function
```

Calling a tag function with an options object returns a new tag function with updated defaults while preserving its `.from` / `.to` / `.io` / `.through` properties. The factories live in `src/bq-spawn.js` (for `$` / `$$`) and `src/bq-shell.js` (for `$sh` / `shell`).

### Runtime detection and the shared builder

`src/index.js` runs once at import time. It selects a backend, then hands it to `buildApi()` (`src/build.js`), which does the platform shell selection and wires up every tag function (`$`, `$$`, `$sh`, `shell`, with `.from` / `.to` / `.through` / `.io`). Backend selection:

1. force-Node flag set (`globalThis.DSH_FORCE_NODE` or the `DSH_FORCE_NODE` env var) → `await import('./spawn/node.js')` — forces the Node backend on every runtime, so Bun/Deno run on their `node:child_process` compat.
2. `typeof Deno !== 'undefined'` → `await import('./spawn/deno.js')`.
3. `typeof Bun !== 'undefined'` → `await import('./spawn/bun.js')`.
4. Otherwise → `await import('./spawn/node.js')`.

Each runtime module exposes the same `Subprocess` shape, typed in `src/index.d.ts`. Runtime quirks are absorbed inside `src/spawn/<runtime>.js` so consumers see a uniform API. Because the tag-function wiring lives in `buildApi`, the `dollar-shell/node` entry (`src/node/index.js`) reuses it verbatim — it just passes the Node backend's raw-streams variant.

### Platform detection

`isWindows` (from `src/utils.js`) selects between `src/shell/unix.js` and `src/shell/windows.js` for shell escaping and command building.

### Streams: web by default, Node on demand

The main entry (`dollar-shell`) exposes `Subprocess.stdin` as a `WritableStream`, `stdout` / `stderr` as `ReadableStream`, and `asDuplex` as a `{readable, writable}` pair. The `dollar-shell/node` entry exposes the identical API with **Node** streams instead — `stdin` a `Writable`, `stdout` / `stderr` `Readable`, and `asDuplex` / `.io` / `.through` a Node `Duplex` (so a process drops straight into a `.pipe()` chain or `stream.pipeline()`). It always uses the Node backend's raw-streams variant, which skips `Readable/Writable.toWeb`. Cross-runtime parity for the default-reader web API is verified; the only documented divergence is BYOB readers (Deno-only). See `wiki/Cross-runtime-notes.md`.

### `raw()`

`raw()` wraps a value to bypass escaping (shell) or argument splitting (spawn). It's the documented escape hatch when a template-string substitution should be passed through verbatim.

## Module dependency graph

```
src/index.js ────── src/utils.js (getEnv — the DSH_FORCE_NODE flag)
                 ├─ src/spawn/{node,deno,bun}.js   (one chosen at import)
                 └─ src/build.js ─── src/utils.js (isWindows, raw, winCmdEscape)
                                  ├─ src/bq-spawn.js
                                  ├─ src/bq-shell.js
                                  └─ src/shell/{unix,windows}.js   (one chosen at build)

src/node/index.js ─ src/build.js + src/spawn/node.js (raw-streams variant)
```

`src/index.js` dynamic-imports the runtime backend; `src/build.js` dynamic-imports the platform shell module. `src/node/index.js` reuses `buildApi` with the Node backend statically imported.

## Cross-runtime testing

Three runners, three configurations — all run the same `tests/test-*.js` files:

- `npm test` — Node, parallel (`tape6 --flags FO`)
- `npm run test:bun` — Bun, parallel
- `npm run test:deno` — Deno, parallel
- `npm run test:seq[:bun|:deno]` — sequential variants for debugging

The cross-runtime test matrix is the truth for any change to `src/spawn/*.js`, `src/build.js`, `src/index.js`, or `src/node/`. Type checks (`ts-check`, `js-check`) catch type-level issues but do not substitute for the runtime matrix because Bun- and Deno-specific code paths are gated behind the dynamic `import()` and only run on the matching runtime.

## TypeScript: dual config

- **`tsconfig.json`** — strict, validates the `.d.ts` sidecars (`strict: true`, `skipLibCheck: false`, `types: ["node"]`).
- **`tsconfig.check.json`** — JS lint, `checkJs` + `noUnusedLocals` + `noUnusedParameters` + `noImplicitReturns` + `allowUnreachableCode: false` + `allowUnusedLabels: false`. `types: ["node", "bun", "deno"]` so ambient `Bun` / `Deno` references resolve. `strict: false` so untyped JS doesn't flood the report.

Pattern: dual-tsconfig js-check (cross-project rule). The `.d.ts` sidecars are the public contract; `js-check` catches unused vars, undeclared refs, missing returns, and dead code in the `.js` sources without bringing ESLint's transitive-dep tail.

## CI

`.github/workflows/tests.yml` runs three parallel jobs (`test-node`, `test-bun`, `test-deno`) with `fail-fast: false` on each. Node matrix is `[22, 24, 26]` × `[ubuntu, windows, macOS]`; Bun and Deno are tested on the latest stable on every OS. Process-spawning code is platform-sensitive enough to justify the full OS matrix.

`.github/workflows/windows.yml` is a `workflow_dispatch` for ad-hoc Windows-only Node version probes.
