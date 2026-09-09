# @valibot/compiler

A build-time compiler for [Valibot](https://valibot.dev) that rewrites schema validation into optimized inline JavaScript — eliminating runtime loops, recursive calls, and object allocations.

## Usage

### 1. Install

```bash
npm install @valibot/compiler
```

### 2. Wrap your schema

```typescript
import * as v from 'valibot';
import { compiled } from '@valibot/compiler';

const LoginSchema = compiled(
  v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.pipe(v.string(), v.minLength(8)),
  })
);

// Use as any Valibot schema
const result = v.safeParse(LoginSchema, input);
```

At dev time, `compiled()` is a zero-cost passthrough. At build time, the plugin replaces `~run` with an optimized single-function validator.

### 3. Add the plugin

```typescript
// vite.config.ts
import valibotCompiler from '@valibot/compiler/vite';

export default {
  plugins: [valibotCompiler()],
};
```

Also available as `@valibot/compiler/rollup`, `@valibot/compiler/rolldown`, `@valibot/compiler/esbuild`, `@valibot/compiler/webpack`, and `@valibot/compiler/rspack`.

## Supported schemas and actions

`object`, `string`, `pipe`, `email`, `minLength`. More coming soon.

Unsupported or dynamically constructed schemas are silently skipped — the passthrough `compiled()` wrapper remains in place.

## Source structure

```
src/
├── index.ts                    Main entry — exports compiled, compiledAsync
├── schemas/                    Wrapper schemas (dev-time passthrough)
│   ├── compiled.ts             compiled() — extends BaseSchema
│   └── compiledAsync.ts        compiledAsync() — extends BaseSchemaAsync
└── plugin/                     Build-time compiler (unplugin)
    ├── index.ts                createUnplugin factory
    ├── vite.ts, rollup.ts, …   Bundler adapters
    ├── types/                  IR type definitions
    │   ├── nodes.ts            SchemaNode, ActionNode (schema IR)
    │   └── analysis.ts         AnalyzedCall (per-call metadata)
    ├── analyze/                Source → Schema IR
    │   ├── analyzeCode.ts      Entry: parse source, find compiled() calls
    │   ├── schemas/            Per-schema analyzers (AST → IR)
    │   ├── actions/            Per-action analyzers (AST → IR)
    │   ├── methods/            Per-method analyzers (pipe, …)
    │   └── utils/              Shared helpers (getValibotFunctionName, …)
    ├── codegen/                Schema IR → Optimized JS
    │   ├── generateCompiledSchema.ts  Entry: IR → full schema object literal
    │   ├── schemas/            Per-schema code generators
    │   ├── actions/            Per-action code generators
    │   └── utils/              Shared helpers (indent, …)
    └── transform/              Orchestrator
        └── transform.ts        Ties analyze + codegen + magic-string
```

**Adding a new schema or action** requires two files: one in `analyze/` (AST → IR) and one in `codegen/` (IR → JS).
