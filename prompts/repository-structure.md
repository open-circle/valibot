# Valibot Repository Navigation Guide for AI Agents

## Overview

Valibot is a modular, type-safe schema library for validating structural data in TypeScript/JavaScript. It emphasizes small bundle size (starting at <700 bytes), modular design, and 100% test coverage. The library is designed around many small, independent functions rather than a few large functions with many methods.

## Repository Structure

This is a **monorepo** managed by pnpm workspaces, containing:

```
valibot/
├── library/          # Main Valibot library (the core package)
├── packages/         # Additional packages (i18n, to-json-schema)
├── codemod/          # Code transformation tools (migration scripts, Zod converter)
├── website/          # Documentation website (valibot.dev)
├── brand/            # Brand assets
├── prompts/          # AI agent prompts and guides
└── [root config files]
```

### Key Files at Root

- `pnpm-workspace.yaml` - Defines workspace packages
- `package.json` - Root package with shared dev dependencies
- `prettier.config.cjs` - Code formatting configuration
- `README.md` - Main project introduction
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` & `SECURITY.md` - Community standards

## Core Library (`/library`)

This is the **most important** directory - contains the actual Valibot library code.

### Structure

```
library/
├── src/
│   ├── actions/      # Validation & transformation actions (150+ actions)
│   ├── schemas/      # Schema types (50+ schemas)
│   ├── methods/      # High-level API methods (parse, safeParse, is, etc.)
│   ├── utils/        # Internal utilities
│   ├── types/        # TypeScript type definitions
│   ├── storages/     # Global state storage
│   ├── regex.ts      # Common regex patterns
│   ├── index.ts      # Main export file
│   └── vitest/       # Test utilities
├── dist/             # Build output (generated)
├── coverage/         # Test coverage reports
├── package.json      # Published package config
├── tsconfig.json     # TypeScript configuration
├── vitest.config.ts  # Test configuration
└── playground.ts     # Development playground
```

### Key Concepts

#### 1. **Schemas** (`src/schemas/`)

Schemas define data structures and perform type validation. Each schema is in its own directory with:

- Main implementation file (e.g., `string.ts`)
- Type definitions
- Test files (`.test.ts`, `.test-d.ts`)

Common schemas:

- Primitives: `string/`, `number/`, `boolean/`, `bigint/`, `date/`, etc.
- Objects: `object/`, `strictObject/`, `looseObject/`, `objectWithRest/`
- Arrays: `array/`, `tuple/`, `strictTuple/`, `looseTuple/`, `tupleWithRest/`
- Advanced: `union/`, `variant/`, `intersect/`, `record/`, `lazy/`, `custom/`
- Modifiers: `optional/`, `nullable/`, `nullish/`, `nonNullable/`, `nonNullish/`

#### 2. **Actions** (`src/actions/`)

Actions are validation and transformation functions that can be piped together. Two main types:

**Validation Actions** (return validation issues):

- String validators: `email/`, `url/`, `uuid/`, `regex/`, `length/`, `minLength/`, etc.
- Number validators: `minValue/`, `maxValue/`, `integer/`, `finite/`, etc.
- Generic: `check/`, `value/`, `notValue/`, etc.

**Transformation Actions** (transform data):

- String transforms: `trim/`, `toLowerCase/`, `toUpperCase/`, `normalize/`
- Array transforms: `mapItems/`, `filterItems/`, `sortItems/`, `reduceItems/`
- Generic: `transform/`, `rawTransform/`

**Special Actions**:

- `brand/`, `flavor/` - Type branding
- `metadata/`, `description/`, `title/` - Metadata annotations
- `partialCheck/`, `rawCheck/` - Custom validation logic

#### 3. **Methods** (`src/methods/`)

High-level API methods that users interact with:

- `parse/` - Parse with exceptions
- `safeParse/` - Parse without exceptions
- `is/` - Type guard function
- `parser/`, `safeParser/` - Create reusable parsers
- `assert/` - Assertion function
- `pipe/` - Pipe schemas and actions
- Schema transformers: `partial/`, `required/`, `pick/`, `omit/`, `keyof/`, `unwrap/`
- Utilities: `fallback/`, `getDefault/`, `getDefaults/`, `flatten/`, `forward/`

#### 4. **Types** (`src/types/`)

Core TypeScript type definitions:

- `schema.ts` - Base schema types
- `validation.ts` - Validation action types
- `transformation.ts` - Transformation action types
- `issue.ts` - Error/issue types
- `dataset.ts` - Internal dataset types
- `infer.ts` - Type inference utilities
- `pipe.ts` - Pipe types
- `config.ts` - Configuration types
- `standard.ts` - Standard Schema specification types

#### 5. **Utils** (`src/utils/`)

Internal utility functions (prefixed with `_` to indicate internal use):

- `_addIssue/` - Add validation issues
- `_getStandardProps/` - Standard Schema properties
- `ValiError/` - Error class
- `isOfKind/`, `isOfType/` - Type checking
- Various helpers for byte counting, grapheme counting, etc.

### Development Workflow

1. **Entry Point**: `src/index.ts` - Exports everything from actions, methods, schemas, utils
2. **Build**: Uses `tsdown` (see `tsdown.config.ts`)
3. **Testing**: Vitest with 100% coverage requirement
4. **Type Testing**: Separate `.test-d.ts` files for type tests
5. **Playground**: `playground.ts` for quick experimentation

## Packages (`/packages`)

### `i18n/`

Internationalization package providing translated error messages in 25+ languages.

Structure:

```
i18n/
├── src/           # Source code
├── [language codes]/  # ar/, de/, es/, fr/, ja/, zh-CN/, etc.
│   └── index.ts   # Translations for each language
├── index.ts       # Main export
└── package.json   # Package configuration
```

### `to-json-schema/`

Converts Valibot schemas to JSON Schema format.

## Codemod (`/codemod`)

Tools for code transformations:

### `migrate-to-v0.31.0/`

Migration script for upgrading from older Valibot versions.

### `zod-to-valibot/`

Converter that transforms Zod schemas to Valibot schemas. Used by the website's converter tool.

## Website (`/website`)

Documentation website built with Qwik (valibot.dev).

### Structure

```
website/
├── src/
│   ├── routes/        # Page routes (file-based routing)
│   ├── components/    # Reusable UI components
│   ├── hooks/         # React-style hooks
│   ├── icons/         # SVG icons
│   ├── images/        # Image assets
│   ├── logos/         # Logo assets
│   ├── json/          # JSON data files
│   ├── utils/         # Utility functions
│   └── root.tsx       # Root component
├── scripts/           # Build scripts
│   ├── contributors.ts
│   ├── sitemap.ts
│   ├── llms.ts        # Generate LLM-friendly docs
│   └── sources.ts
├── public/            # Static files
├── adapters/          # Deployment adapters
└── vite.config.ts     # Vite configuration
```

Key scripts:

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm llms` - Generate LLM documentation
- `pnpm sources` - Generate source files

## Common Tasks for AI Agents

### 1. Adding a New Validation Action

Navigate to: `library/src/actions/`

1. Create new directory: `actions/yourAction/`
2. Create files:
   - `yourAction.ts` - Implementation
   - `yourAction.test.ts` - Runtime tests
   - `yourAction.test-d.ts` - Type tests
   - `index.ts` - Export
3. Follow pattern from similar actions (e.g., `email/`, `minLength/`)
4. Export from `actions/index.ts`
5. Run tests: `pnpm test` in library directory

### 2. Adding a New Schema

Navigate to: `library/src/schemas/`

1. Create new directory: `schemas/yourSchema/`
2. Create files following same pattern as actions
3. Implement BaseSchema interface
4. Include `'~run'` method for validation logic
5. Export from `schemas/index.ts`
6. Run tests and type checks

### 3. Modifying Core Types

Navigate to: `library/src/types/`

**Be careful**: These are core types affecting the entire library.

- Changes here likely affect multiple schemas/actions
- Always run full test suite after modifications
- Check type tests with `pnpm test:types`

### 4. Working on Documentation

Navigate to: `website/src/routes/`

- Documentation uses `.mdx` files (Markdown + JSX)
- API reference pages are generated from source code
- Test locally: `pnpm dev` in website directory
- Build: `pnpm build`

### 5. Adding Translations

Navigate to: `packages/i18n/[language-code]/`

1. Copy existing language structure (e.g., `en/`)
2. Translate all error messages
3. Export from `index.ts`
4. Add to main `packages/i18n/index.ts`

## Code Patterns & Conventions

### Naming Conventions

- Schemas: Lowercase function names (e.g., `string()`, `object()`, `array()`)
- Actions: Descriptive lowercase names (e.g., `email()`, `minLength()`, `trim()`)
- Methods: Descriptive names (e.g., `parse()`, `safeParse()`, `is()`)
- Internal utilities: Prefix with `_` (e.g., `_addIssue()`, `_getStandardProps()`)
- Types/Interfaces: PascalCase with descriptive suffixes (e.g., `StringSchema`, `EmailAction`, `BaseIssue`)

### File Organization

- One main export per directory
- Include `index.ts` for re-exports
- Co-locate tests with implementation
- Separate type tests (`.test-d.ts`) from runtime tests (`.test.ts`)

### Type System

- Extensive use of generics for type safety
- `InferOutput<T>` and `InferInput<T>` for type inference
- Issue types define error structures
- All schemas implement `BaseSchema`
- All validations implement `BaseValidation`
- All transformations implement `BaseTransformation`

### Testing

- 100% code coverage required
- Use Vitest for testing
- Separate type tests using `expectTypeOf`
- Test both success and failure cases
- Test edge cases and boundary conditions

### Documentation

- JSDoc comments for all public APIs
- Include usage examples
- Link to relevant documentation
- Describe parameters and return values

## Build & Development

### Library Development

```bash
cd library
pnpm install
pnpm test          # Run tests
pnpm coverage      # Generate coverage report
pnpm lint          # Lint code
pnpm format        # Format code
pnpm play          # Run playground
```

### Website Development

```bash
cd website
pnpm install
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm llms          # Generate LLM docs
```

### Root Level

```bash
pnpm install       # Install all workspace dependencies
pnpm format        # Format entire codebase
```

## Important Notes

### Do's

✅ Follow existing code patterns strictly
✅ Write comprehensive tests (aim for 100% coverage)
✅ Include both runtime and type tests
✅ Add JSDoc documentation
✅ Keep functions small and focused (modular design principle)
✅ Use TypeScript strict mode features
✅ Validate with existing linting rules
✅ Check that changes don't increase bundle size significantly

### Don'ts

❌ Don't modify core types without understanding full impact
❌ Don't add external dependencies (library is zero-dependency)
❌ Don't skip tests
❌ Don't create large, multi-purpose functions
❌ Don't ignore TypeScript errors
❌ Don't modify generated files (`dist/`, `coverage/`)

## Key Principles

1. **Modularity**: Each function does one thing well
2. **Tree-shakability**: Import only what you need
3. **Type Safety**: Fully typed with inference
4. **Bundle Size**: Keep additions minimal
5. **Zero Dependencies**: No external runtime dependencies
6. **Test Coverage**: 100% coverage required
7. **Developer Experience**: Clear, readable API

## Finding Things

### Looking for a specific schema?

→ `library/src/schemas/[schema-name]/`

### Looking for a validation/transformation?

→ `library/src/actions/[action-name]/`

### Looking for parse/safeParse/is?

→ `library/src/methods/[method-name]/`

### Looking for type definitions?

→ `library/src/types/`

### Looking for error messages in other languages?

→ `packages/i18n/[language-code]/`

### Looking for documentation source?

→ `website/src/routes/`

### Looking for examples?

→ README files, test files (`.test.ts`), and `library/playground.ts`

## Standard Schema Specification

Valibot implements the [Standard Schema](https://github.com/standard-schema/standard-schema) specification. The `'~standard'` property on schemas provides compatibility with this spec. See `library/src/types/standard.ts` for implementation details.

## Getting Help

- **Discord**: Join the Valibot Discord community
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Documentation**: https://valibot.dev
- **Contributing Guide**: Read `CONTRIBUTING.md`

## Final Tips for AI Agents

1. **Always check existing implementations** before creating new ones
2. **Run tests frequently** during development
3. **Understand the modular philosophy** - don't create monolithic functions
4. **Check bundle size impact** for any additions
5. **Read test files** to understand expected behavior
6. **Follow TypeScript best practices** - the codebase is a good example
7. **When in doubt, ask for clarification** rather than making assumptions

This repository represents high-quality TypeScript/JavaScript library design with emphasis on developer experience, performance, and maintainability. Respect these principles when making contributions.
