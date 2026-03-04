---
description: Pre-release verification checklist for dollar-shell
---

# Release Check

Run through this checklist before publishing a new version.

## Steps

1. Check that `AGENTS.md` is up to date with any rule or workflow changes.
2. Check that `wiki/Home.md` links to all relevant wiki pages.
3. Check that `llms.txt` and `llms-full.txt` are up to date with any API changes.
4. Verify `package.json`:
   - `files` array includes all necessary entries (`/src`, `LICENSE`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `llms.txt`, `llms-full.txt`).
   - `exports` map is correct.
5. Check that `src/index.js` and `src/index.d.ts` are in sync (all exports, all types).
6. Bump `version` in `package.json`.
7. Update release history in `README.md`.
8. Run `npm install` to regenerate `package-lock.json`.
   // turbo
9. Run the full test suite with Node: `npm test`
   // turbo
10. Run tests with Bun: `npm run test:bun`
    // turbo
11. Run tests with Deno: `npm run test:deno`
    // turbo
12. Run sequential tests with Node: `npm run test:seq`
    // turbo
13. Run sequential tests with Bun: `npm run test:seq:bun`
    // turbo
14. Run sequential tests with Deno: `npm run test:seq:deno`
    // turbo
15. Run TypeScript check: `npm run ts-check`
    // turbo
16. Run lint: `npm run lint`
    // turbo
17. Dry-run publish to verify package contents: `npm pack --dry-run`
