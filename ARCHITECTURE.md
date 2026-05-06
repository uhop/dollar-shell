# Architecture

`dollar-shell` is a micro-library for running OS and shell commands from JavaScript / TypeScript using template tag functions. It runs the same API on Node, Deno, and Bun, exposing process I/O as web streams. **Zero runtime dependencies** — devDeps only for type-checking, formatting, and the test runner.

## Project layout

```
dollar-shell/
├── package.json          # Package config; "type": "module"
├── tsconfig.json         # Strict TS — checks the .d.ts sidecars
├── tsconfig.check.json   # Lint TS — checkJs on .js sources, with @types/{node,bun,deno}
├── src/                  # Source code
│   ├── index.js          # Main entry: dynamic-imports the runtime/platform modules and wires the tag functions
│   ├── index.d.ts        # TypeScript declarations for the full public API
│   ├── bq-spawn.js       # Template tag factory for spawn-based functions ($, $$)
│   ├── bq-shell.js       # Template tag factory for shell-based functions ($sh, shell)
│   ├── utils.js          # Shared utilities (raw, isWindows, winCmdEscape, etc.)
│   ├── spawn/            # Runtime-specific Subprocess implementations
│   │   ├── node.js       # Node.js: child_process + Readable/Writable.toWeb
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
$`ls -l ${dir}`                    // run with default options
$(options)`ls -l ${dir}`           // run with custom options
const $verbose = $({stdout: 'inherit'})  // returns a new tag function
```

Calling a tag function with an options object returns a new tag function with updated defaults while preserving its `.from` / `.to` / `.io` / `.through` properties. The factories live in `src/bq-spawn.js` (for `$` / `$$`) and `src/bq-shell.js` (for `$sh` / `shell`).

### Runtime detection

`src/index.js` runs once at import time:

1. `typeof Deno !== 'undefined'` → `await import('./spawn/deno.js')`.
2. `typeof Bun !== 'undefined'` → `await import('./spawn/bun.js')`.
3. Otherwise → `await import('./spawn/node.js')`.

Each runtime module exposes the same `Subprocess` shape, typed in `src/index.d.ts`. Runtime quirks are absorbed inside `src/spawn/<runtime>.js` so consumers see a uniform API.

### Platform detection

`isWindows` (from `src/utils.js`) selects between `src/shell/unix.js` and `src/shell/windows.js` for shell escaping and command building.

### Web streams everywhere

`Subprocess.stdin` is a `WritableStream`, `stdout` and `stderr` are `ReadableStream`. Cross-runtime parity for the default-reader API is verified; the only documented divergence is BYOB readers (Deno-only). See `wiki/Cross-runtime-notes.md`.

### `raw()`

`raw()` wraps a value to bypass escaping (shell) or argument splitting (spawn). It's the documented escape hatch when a template-string substitution should be passed through verbatim.

## Module dependency graph

```
src/index.js ─── src/utils.js
              ├─ src/bq-spawn.js
              ├─ src/bq-shell.js
              ├─ src/spawn/{node,deno,bun}.js   (one chosen at import)
              └─ src/shell/{unix,windows}.js    (one chosen at import)
```

`src/index.js` is the only file that does the dynamic `import()` — every other module is statically imported.

## Cross-runtime testing

Three runners, three configurations — all run the same `tests/test-*.js` files:

- `npm test` — Node, parallel (`tape6 --flags FO`)
- `npm run test:bun` — Bun, parallel
- `npm run test:deno` — Deno, parallel
- `npm run test:seq[:bun|:deno]` — sequential variants for debugging

The cross-runtime test matrix is the truth for any change to `src/spawn/*.js` or `src/index.js`. Type checks (`ts-check`, `js-check`) catch type-level issues but do not substitute for the runtime matrix because Bun- and Deno-specific code paths are gated behind the dynamic `import()` and only run on the matching runtime.

## TypeScript: dual config

- **`tsconfig.json`** — strict, validates the `.d.ts` sidecars (`strict: true`, `skipLibCheck: false`, `types: ["node"]`).
- **`tsconfig.check.json`** — JS lint, `checkJs` + `noUnusedLocals` + `noUnusedParameters` + `noImplicitReturns` + `allowUnreachableCode: false` + `allowUnusedLabels: false`. `types: ["node", "bun", "deno"]` so ambient `Bun` / `Deno` references resolve. `strict: false` so untyped JS doesn't flood the report.

Pattern: dual-tsconfig js-check (cross-project rule). The `.d.ts` sidecars are the public contract; `js-check` catches unused vars, undeclared refs, missing returns, and dead code in the `.js` sources without bringing ESLint's transitive-dep tail.

## CI

`.github/workflows/tests.yml` runs three parallel jobs (`test-node`, `test-bun`, `test-deno`) with `fail-fast: false` on each. Node matrix is `[22, 24, 26]` × `[ubuntu, windows, macOS]`; Bun and Deno are tested on the latest stable on every OS. Process-spawning code is platform-sensitive enough to justify the full OS matrix.

`.github/workflows/windows.yml` is a `workflow_dispatch` for ad-hoc Windows-only Node version probes.
