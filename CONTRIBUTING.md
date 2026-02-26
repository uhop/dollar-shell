# Contributing to dollar-shell

Thank you for your interest in contributing!

## Getting started

This project uses git submodules. Clone and set up:

```bash
git clone --recursive git@github.com:uhop/dollar-shell.git
cd dollar-shell
npm install
```

See the [wiki](https://github.com/uhop/dollar-shell/wiki) for API documentation.

## Development workflow

1. Make your changes.
2. Format: `npm run lint:fix`
3. Test: `npm test`
4. Type-check: `npm run ts-check`

## Code style

- ES modules (`import`/`export`), no CommonJS in source.
- Formatted with Prettier — run `npm run lint:fix` before committing.
- No dependencies — the library is intentionally zero-dependency.
- Keep `src/index.js` and `src/index.d.ts` in sync.
- Update wiki documentation alongside code changes.

## AI agents

If you are an AI coding agent, see [AGENTS.md](./AGENTS.md) for detailed project conventions, commands, and architecture.
