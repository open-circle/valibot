# Contributing to @valibot/compiler

This guide explains how the compiler works and how to add support for new schemas and actions.

## How it works

The compiler runs at build time as a bundler plugin. It finds `compiled(...)` calls in user code, statically analyzes the schema tree inside, and replaces the call with an optimized schema object where the `~run` method contains inlined validation logic — no loops, no recursive calls.

### Pipeline

```
Source code → Analyze (AST → IR) → Codegen (IR → JS) → Replace (magic-string)
```

1. **Analyze** — Parses the source with `oxc-parser`, walks the AST with `oxc-walker`, finds `compiled(...)` calls, and builds an intermediate representation (IR) of the schema tree.
2. **Codegen** — Takes the IR and generates an optimized schema object literal as a JS string. Uses `v._addIssue` from Valibot for issue creation to preserve custom messages and i18n.
3. **Transform** — Orchestrates analyze + codegen and uses `magic-string` to replace the original `compiled(...)` call expression with the generated code.

### Schema IR

Every schema and action is represented as a plain object node:

```typescript
// Schema nodes (types/nodes.ts)
{ kind: 'schema', type: 'string' }
{ kind: 'schema', type: 'object', entries: { email: ..., password: ... } }
{ kind: 'pipe', schema: SchemaNode, actions: ActionNode[] }

// Action nodes
{ kind: 'action', type: 'email' }
{ kind: 'action', type: 'minLength', requirement: 8 }
```

The analyzer builds this IR from the AST. The codegen consumes it to produce JS.

## Source structure

```
plugin/
├── types/                  IR type definitions
│   ├── nodes.ts            SchemaNode, ActionNode unions
│   └── analysis.ts         AnalyzedCall (per-call metadata)
├── analyze/                AST → IR
│   ├── analyzeCode.ts      Entry point + dispatch (switch on function name)
│   ├── schemas/            One file per schema (analyzeObjectSchema.ts, ...)
│   ├── actions/            One file per action (analyzeEmailAction.ts, ...)
│   ├── methods/            One file per method (analyzePipe.ts, ...)
│   └── utils/              Helpers (getValibotFunctionName, extractStringMessage)
├── codegen/                IR → JS
│   ├── generateCompiledSchema.ts   Entry point + dispatch
│   ├── schemas/            One file per schema (generateObjectCode.ts, ...)
│   ├── actions/            One file per action (generateEmailCode.ts, ...)
│   └── utils/              Helpers (indent)
└── transform/              Orchestrator (analyze + codegen + magic-string)
```

## Adding a new action

Use `minLength` as a reference. You need 4 changes:

### 1. Add the IR node type in `types/nodes.ts`

```typescript
export interface MaxLengthActionNode {
  readonly kind: 'action';
  readonly type: 'maxLength';
  readonly requirement: number;
  readonly message?: string | undefined;
}

// Add to the union:
export type ActionNode = EmailActionNode | MinLengthActionNode | MaxLengthActionNode;
```

### 2. Create the analyzer in `analyze/actions/analyzeMaxLengthAction.ts`

The analyzer receives the `CallExpression` AST node for `v.maxLength(...)` and extracts the arguments into an IR node. Return `null` if the call is not statically analyzable.

```typescript
import type { CallExpression } from 'oxc-parser';
import type { ActionNode } from '../../types/index.ts';
import { extractStringMessage } from '../utils/index.ts';

export function analyzeMaxLengthAction(call: CallExpression): ActionNode | null {
  if (call.arguments.length < 1 || call.arguments.length > 2) return null;
  const reqArg = call.arguments[0];
  if (!reqArg || reqArg.type === 'SpreadElement') return null;
  const literal = reqArg as { type: string; value: unknown };
  if (literal.type !== 'Literal' || typeof literal.value !== 'number') return null;

  return {
    kind: 'action',
    type: 'maxLength',
    requirement: literal.value,
    message: extractStringMessage(call, 1),
  };
}
```

Register it in `analyze/methods/analyzePipe.ts` inside the `analyzeAction` switch:

```typescript
case 'maxLength':
  return analyzeMaxLengthAction(call);
```

### 3. Create the code generator in `codegen/actions/generateMaxLengthCode.ts`

The generator produces the JS validation code that will run at parse time. Study the original action's `~run` method in `library/src/actions/` to understand what code to generate.

For `maxLength`, the original `~run` checks `dataset.value.length > this.requirement`, so:

```typescript
import type { MaxLengthActionNode } from '../../types/index.ts';

export function generateMaxLengthCode(
  action: MaxLengthActionNode,
  varName: string,
  pathItem: string,
  v: string
): string {
  const req = action.requirement;
  const lines: string[] = [];
  lines.push(`if (${varName}.length > ${req}) {`);
  lines.push(
    `  ${v}._addIssue({ kind: 'validation', type: 'max_length', reference: ${v}.maxLength, expects: '<=${req}', requirement: ${req} }, 'length', dataset, config, { input: ${varName}, received: \`\${${varName}.length}\`, path: [${pathItem}] });`
  );
  lines.push(`  if (config.abortEarly || config.abortPipeEarly) return dataset;`);
  lines.push(`}`);
  return lines.join('\n');
}
```

Register it in `codegen/schemas/generateObjectCode.ts` inside the `generateActionCode` switch:

```typescript
case 'maxLength':
  return generateMaxLengthCode(action as MaxLengthActionNode, varName, pathItem, v);
```

### 4. Add tests

Add test cases to `transform/transform.test.ts` that verify:

- The analyzer extracts the correct IR from source containing the new action
- The transformed code produces correct validation results (valid input passes, invalid input returns the right issue type and path)

## Adding a new schema

Same pattern, but in the `schemas/` subdirectories instead of `actions/`. Use `string` as a reference for simple schemas, `object` for complex ones.

1. Add the IR node to `types/nodes.ts` and the `SchemaNode` union
2. Create `analyze/schemas/analyzeNumberSchema.ts` — register in `analyzeCode.ts` switch
3. Create `codegen/schemas/generateNumberCode.ts` — register in `generateCompiledSchema.ts` switch
4. Add tests

## Key conventions

- **Read the original `~run` method** in `library/src/` before writing the codegen — the generated code must produce identical behavior
- **The `_addIssue` context object** must include `kind`, `type`, `reference`, `expects`, and `requirement` (if applicable) to preserve custom messages and i18n
- **Return `null`** from analyzers when the AST is not statically analyzable — the compiler will silently skip that `compiled()` call
- **Run `pnpm test --filter @valibot/compiler`** to verify, **`pnpm lint`** and **`pnpm format`** before submitting
