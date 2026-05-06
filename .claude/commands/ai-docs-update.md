---
description: Update AI-facing docs (llms.txt, llms-full.txt, ARCHITECTURE.md, AGENTS.md) after API or structural changes
---

# AI Documentation Update

Refresh all AI-facing files after changes to the public API, modules, or
project structure.

## Steps

1. Read `src/index.js` and `src/index.d.ts` to identify the current public API.
2. Read `AGENTS.md` and `ARCHITECTURE.md` for current state.
3. Identify what changed (new modules, options, renamed exports, new
   utilities, etc.).
4. Update `llms.txt`:
   - Ensure the API section matches `src/index.d.ts`.
   - Update common patterns if new features were added.
   - Keep it concise — this is for quick LLM consumption.
5. Update `llms-full.txt`:
   - Full API reference with all components, options, and examples.
   - Include any new exports, options, or environment variables.
6. Update `wiki/Home.md` if the overview or structure changed.
7. Update `ARCHITECTURE.md` if project structure or module dependencies changed.
8. Update `AGENTS.md` if critical rules, commands, or architecture quick
   reference changed.
9. If `AGENTS.md` changed, run `/sync-ai-rules` to propagate to
   `.windsurfrules` / `.cursorrules` / `.clinerules`.
10. If wiki conventions or project link styles have changed, update the
    `document-wiki-page` skill so future doc generations stay aligned.
11. Provide a summary of what was updated.
