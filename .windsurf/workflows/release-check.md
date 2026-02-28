---
description: Pre-release verification checklist for dollar-shell
---

# Release Check

Run through this checklist before publishing a new version.

## Steps

1. Check that `AGENTS.md` is up to date with any rule or workflow changes.
2. Check that wiki docs in `wiki/` reflect any API or behavioral changes.
3. Check that `llms.txt` and `llms-full.txt` are up to date with any API changes.
4. Verify `package.json`:
   - `files` array includes all necessary entries.
   - `exports` map is correct.
5. Check that `src/index.js` and `src/index.d.ts` are in sync (all exports, all types).
6. Bump `version` in `package.json`.
7. Update release history in `README.md`.
8. Run `npm install` to regenerate `package-lock.json`.
   // turbo
9. Run the full test suite: `npm test`
   // turbo
10. Run TypeScript check: `npm run ts-check`
    // turbo
11. Run lint: `npm run lint`
    // turbo
12. Dry-run publish to verify package contents: `npm pack --dry-run`
