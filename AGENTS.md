# AI Instructions

Valibot is a modular, type-safe schema validation library with zero runtime dependencies.

## Monorepo Layout

| Directory                  | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `library/`                 | Core `valibot` package — most work happens here |
| `packages/to-json-schema/` | JSON Schema converter                           |
| `packages/i18n/`           | Translated error messages                       |
| `website/`                 | valibot.dev (Qwik + Vite)                       |
| `codemod/`                 | Migration and conversion tools                  |

## Essential Commands

```bash
pnpm install                    # Install dependencies
pnpm test                       # Run tests (all packages)
pnpm lint                       # ESLint + tsc + deno check (all packages)
pnpm format                     # Format code with Prettier (all packages)
pnpm build                      # Build for publishing (all packages)
```

## Code Conventions

- **ESM with `.ts` extensions** in imports (enforced by ESLint)
- **`interface` over `type`** for object shapes
- **JSDoc required** on exported functions (first overload only for overload sets)
- **`// @__NO_SIDE_EFFECTS__`** before pure factory functions for tree-shaking

## Other Rules

- **Source code is the single source of truth.** All documentation must match `/library/src/`.
- **Lint and format after modifying code.** Run `pnpm lint` and `pnpm format` so CI passes.
- **Use the GitHub CLI for GitHub-related tasks.** Prefer `gh` for pull requests, issues, checks, and other GitHub operations.

## Library Architecture

Schemas, actions, and methods are plain objects with a `'~run'` method:

```
library/src/
├── schemas/   → Data types (string, object, array...)
├── actions/   → Validations & transforms (email, minLength, trim...)
├── methods/   → API functions (parse, pipe, partial...)
├── types/     → TypeScript definitions
└── utils/     → Internal helpers (prefixed with _)
```

Each has its own folder: `name.ts`, `name.test.ts`, `name.test-d.ts`, `index.ts`.

## Agent Skills

This repository includes agent skills in `/skills/` following the [Agent Skills](https://agentskills.io) open standard.

**Naming:** Skills prefixed with `repo-` are local repository skills
