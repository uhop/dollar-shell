---
description: Pre-release verification checklist for dollar-shell
---

# Release Check

Run through this checklist before publishing a new version.

## Steps

1. Check that `ARCHITECTURE.md` reflects any structural changes.
2. Check that `AGENTS.md` is up to date with any rule or workflow changes.
3. Check that `.windsurfrules`, `.clinerules`, `.cursorrules` are in sync with
   `AGENTS.md` (run `/sync-ai-rules` if not).
4. Check that `llms.txt` and `llms-full.txt` are up to date with any API changes
   (run `/ai-docs-update` if not).
5. Check that `src/index.js` and `src/index.d.ts` are in sync (all exports, all types).
6. Check that `wiki/Home.md` links to all relevant wiki pages, including any
   new ones added this cycle.
7. Verify `package.json`:
   - `files` array includes all necessary entries (`/src`, `LICENSE`, `README.md`,
     `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `llms.txt`, `llms-full.txt`).
   - `exports` map is correct.
   - `description` and `keywords` are current.
8. Check that the copyright year in `LICENSE` includes the current year.
9. **Sweep dependencies for staleness.** Run `npm outdated` and bump anything
   with a newer major or minor available. For libraries this is non-negotiable —
   stale ranges generate user complaints when consumers run a different version
   of the same dep.
10. Run `npm install` (or `npm install --package-lock-only`) to regenerate
    `package-lock.json` after any bumps from step 9.
11. Bump `version` in `package.json` (semver based on the nature of changes
    since the last tag — `git log <last-tag>..HEAD`).
12. Update release history. Check **both** locations and update each one that
    exists. They serve different audiences and carry different densities.
    - `README.md` — **cliff-notes**: the 1–2–3 most memorable items for users,
      comma-separated. Optional `Thx [Contributor](https://github.com/handle)`
      credit when the release responds to a specific issue or PR. No internal
      changes, no devDep bumps, no test counts, no CI moves. **One footer line
      at the bottom of the section, after the bullet list** (separated by a
      blank line, once per section, not per release). Wording is flexible
      (`The full release notes are in the wiki: [Release notes](...)`,
      `For more info consult full [release notes](...)`, etc.); the placement
      is the rule.
    - `wiki/Release-notes.md` — the canonical longer-form history. A paragraph
      per substantive release with **bold** feature names; cover internal
      changes, calibration notes, related wiki / repo updates, and credits.
      Per-release date in the heading (use `git for-each-ref --sort=-creatordate
      --format='%(refname:short) %(creatordate:short)' refs/tags`).
      The wiki is a git submodule — it gets its own commit + parent-pointer bump.
    Don't update only the README — readers who follow the "for more info"
    link land on a stale page if you do.
13. **Cross-runtime test sweep:**
    - `npm test` (Node, parallel)
    - `npm run test:bun` (Bun, parallel)
    - `npm run test:deno` (Deno, parallel)
    - `npm run test:seq` (Node, sequential)
    - `npm run test:seq:bun` (Bun, sequential)
    - `npm run test:seq:deno` (Deno, sequential)
14. Run TypeScript check: `npm run ts-check`.
15. Run JavaScript check: `npm run js-check`.
16. Run TypeScript tests: `npm run ts-test`.
17. Run lint: `npm run lint`.
18. Dry-run publish to verify package contents: `npm pack --dry-run`.
19. Stop and report — do **not** commit, tag, or publish without explicit
    confirmation from the user.
