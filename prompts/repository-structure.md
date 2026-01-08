# Valibot Repository Structure

## Monorepo Layout

```
valibot/
├── library/          # Core valibot package (zero dependencies)
├── packages/
│   ├── i18n/         # Translated error messages (25+ languages)
│   └── to-json-schema/  # JSON Schema converter
├── codemod/
│   ├── migrate-to-v0.31.0/  # Version migration
│   └── zod-to-valibot/      # Zod converter
├── website/          # valibot.dev (Qwik + Vite)
├── brand/            # Brand assets
└── prompts/          # AI agent guides
```

## Core Library (`/library/src/`)

### Directory Structure

| Directory   | Purpose                         | Examples                                      |
| ----------- | ------------------------------- | --------------------------------------------- |
| `schemas/`  | Data type validators            | `string/`, `object/`, `array/`, `union/`      |
| `actions/`  | Validation & transformation     | `email/`, `minLength/`, `trim/`, `transform/` |
| `methods/`  | High-level API                  | `parse/`, `safeParse/`, `pipe/`, `partial/`   |
| `types/`    | TypeScript definitions          | `schema.ts`, `issue.ts`, `dataset.ts`         |
| `utils/`    | Internal helpers (prefixed `_`) | `_addIssue/`, `_stringify/`, `ValiError/`     |
| `storages/` | Global state                    | Config, message storage                       |

### Schema Categories

- **Primitives**: `string`, `number`, `boolean`, `bigint`, `date`, `symbol`, `blob`, `file`
- **Objects**: `object`, `strictObject`, `looseObject`, `objectWithRest`
- **Arrays**: `array`, `tuple`, `strictTuple`, `looseTuple`, `tupleWithRest`
- **Advanced**: `union`, `variant`, `intersect`, `record`, `map`, `set`, `lazy`, `custom`
- **Modifiers**: `optional`, `nullable`, `nullish`, `nonNullable`, `nonNullish`, `nonOptional`

### Action Types

**Validation** (return issues): `email`, `url`, `uuid`, `regex`, `minLength`, `maxValue`, `check`

**Transformation** (modify data): `trim`, `toLowerCase`, `toUpperCase`, `mapItems`, `transform`

**Metadata**: `brand`, `flavor`, `metadata`, `description`, `title`

### File Naming Convention

Each schema/action/method has its own directory:

```
schemas/string/
├── string.ts        # Implementation
├── string.test.ts   # Runtime tests
├── string.test-d.ts # Type tests
└── index.ts         # Re-export
```

### Core Patterns

**Schemas** define data types:

```typescript
export interface StringSchema<TMessage> extends BaseSchema<...> {
  readonly kind: 'schema';
  readonly type: 'string';
  // ...
}
```

**Actions** validate/transform in pipelines:

```typescript
export interface EmailAction<TInput, TMessage> extends BaseValidation<...> {
  readonly kind: 'validation';
  readonly type: 'email';
  // ...
}
```

**Methods** provide API functions:

```typescript
export function parse<TSchema>(
  schema: TSchema,
  input: unknown
): InferOutput<TSchema>;
```

### Key Types

- `BaseSchema`, `BaseValidation`, `BaseTransformation` - Base interfaces
- `InferOutput<T>`, `InferInput<T>`, `InferIssue<T>` - Type inference
- `Config`, `ErrorMessage<T>`, `BaseIssue<T>` - Configuration and errors
- `'~standard'` property - [Standard Schema](https://github.com/standard-schema/standard-schema) compatibility

## Website (`/website/src/routes/`)

### API Documentation

```
routes/api/
├── (schemas)/string/     # Schema docs
│   ├── index.mdx         # MDX content
│   └── properties.ts     # Type definitions
├── (actions)/email/      # Action docs
├── (methods)/parse/      # Method docs
├── (types)/StringSchema/ # Type docs
└── menu.md               # Navigation
```

### Guides

```
routes/guides/
├── (get-started)/       # Intro, installation
├── (main-concepts)/     # Schemas, pipelines, parsing
├── (schemas)/           # Objects, arrays, unions
├── (advanced)/          # Async, i18n, JSON Schema
├── (migration)/         # Version upgrades
└── menu.md              # Navigation
```

## Development

### Playground

Use `library/playground.ts` for quick experimentation.

### Adding a Schema/Action

1. Create directory: `library/src/schemas/yourSchema/`
2. Create files: `yourSchema.ts`, `yourSchema.test.ts`, `yourSchema.test-d.ts`, `index.ts`
3. Follow existing patterns (copy similar implementation)
4. Export from category `index.ts`
5. Run `pnpm -C library test`

### Modifying Core Types

⚠️ Changes to `library/src/types/` affect the entire library. Always run full test suite.

## Quick Lookups

| Looking for...        | Location                                       |
| --------------------- | ---------------------------------------------- |
| Schema implementation | `library/src/schemas/[name]/[name].ts`         |
| Action implementation | `library/src/actions/[name]/[name].ts`         |
| Method implementation | `library/src/methods/[name]/[name].ts`         |
| Type definitions      | `library/src/types/`                           |
| Internal utilities    | `library/src/utils/`                           |
| Error messages (i18n) | `packages/i18n/[lang]/`                        |
| API docs page         | `website/src/routes/api/(category)/[name]/`    |
| Guide page            | `website/src/routes/guides/(category)/[name]/` |
| Tests                 | Same directory as source, `.test.ts` suffix    |
| Type tests            | Same directory as source, `.test-d.ts` suffix  |

## Commands

```bash
# Library
pnpm -C library build      # Build
pnpm -C library test       # Run tests
pnpm -C library lint       # Lint
pnpm -C library format     # Format

# Website
pnpm -C website dev        # Dev server
pnpm -C website build      # Production build

# Root
pnpm install               # Install all
pnpm format                # Format all
```

## Key Principles

1. **Modularity** - Small, focused functions; one per file
2. **Zero dependencies** - Core library has no runtime deps
3. **100% test coverage** - Required for library
4. **Tree-shakable** - Use `// @__NO_SIDE_EFFECTS__` annotation
5. **Type-safe** - Full TypeScript with strict mode
6. **ESM only** - Imports include `.ts` extensions

## Do's and Don'ts

**Do:**

- Follow existing code patterns
- Write runtime and type tests
- Add JSDoc documentation
- Keep functions small and focused
- Check bundle size impact

**Don't:**

- Add external dependencies
- Modify core types without full test run
- Skip tests
- Create large multi-purpose functions
- Modify generated files (`dist/`, `coverage/`)
