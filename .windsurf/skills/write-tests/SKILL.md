---
name: write-tests
description: Write or update dollar-shell tests for a module or feature. Use when asked to write tests, add test coverage, or create test files.
---

# Write Tests

Write or update tests using the tape-six testing library.

## Notes

- `tape-six` supports ES modules (`.js`, `.mjs`, `.ts`, `.mts`) and CommonJS (`.cjs`, `.cts`).
- TypeScript is supported natively — no transpilation needed (Node 22+, Deno, Bun run `.ts` files directly).
- The default `tape6` runner uses worker threads for parallel execution. `tape6-seq` runs sequentially in-process — useful for debugging or when tests share state.
- dollar-shell tests run OS commands, so they may behave differently on different platforms.

## Steps

1. Read `node_modules/tape-six/TESTING.md` for the tape-six API reference and patterns.
2. Read the existing test files in `tests/` to understand patterns and conventions used in this project.
3. Identify the module or feature to test. Read its source code to understand the public API.
4. Create or update the test file in `tests/test-<name>.js`:
   - Import `test` from `tape-six` (`import test from 'tape-six'`).
   - Import the module under test from `dollar-shell` or its source files.
   - Write one top-level `test()` per logical group.
   - Use embedded `await t.test()` for sub-cases.
   - Use `t.beforeEach`/`t.afterEach` for shared setup/teardown.
   - Cover: normal operation, edge cases, error conditions.
   - Use `t.equal` for primitives, `t.deepEqual` for objects/arrays, `t.throws` for errors, `await t.rejects` for async errors.
   - All `msg` arguments are optional but recommended for clarity.
5. Run the new test file directly to verify: `node tests/test-<name>.js`
6. Run the full test suite to check for regressions: `npm test`
   - If debugging, use `npm run test:seq` (runs sequentially, easier to trace issues).
7. Report results and any failures.
