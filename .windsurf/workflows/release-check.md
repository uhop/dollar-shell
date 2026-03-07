---
description: Pre-release verification checklist for dollar-shell
---

# Release Check

Run through this checklist before publishing a new version.

## Steps

1. Check that `AGENTS.md` is up to date with any rule or workflow changes.
2. Check that `.windsurfrules`, `.clinerules`, `.cursorrules` are in sync with `AGENTS.md`.
3. Check that `wiki/Home.md` links to all relevant wiki pages.
4. Check that `llms.txt` and `llms-full.txt` are up to date with any API changes.
5. Verify `package.json`:
   - `files` array includes all necessary entries (`/src`, `LICENSE`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `llms.txt`, `llms-full.txt`).
   - `exports` map is correct.
6. Check that `src/index.js` and `src/index.d.ts` are in sync (all exports, all types).
7. Bump `version` in `package.json`.
8. Update release history in `README.md`.
9. Run `npm install` to regenerate `package-lock.json`.
   // turbo
10. Run the full test suite with Node: `npm test`
    // turbo
11. Run tests with Bun: `npm run test:bun`
    // turbo
12. Run tests with Deno: `npm run test:deno`
    // turbo
13. Run sequential tests with Node: `npm run test:seq`
    // turbo
14. Run sequential tests with Bun: `npm run test:seq:bun`
    // turbo
15. Run sequential tests with Deno: `npm run test:seq:deno`
    // turbo
16. Run TypeScript check: `npm run ts-check`
    // turbo
17. Run lint: `npm run lint`
    // turbo
18. Dry-run publish to verify package contents: `npm pack --dry-run`
