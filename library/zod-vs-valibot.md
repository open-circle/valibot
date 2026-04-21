# Zod v4 vs Valibot: TypeScript Type Performance Comparison

Reference for ongoing work on improving Valibot's TS type performance (issue #1374).

Tested with Zod v4.3.6, Valibot v1.3.1, TypeScript 5.9.3 on macOS.

## Benchmark Numbers

Schema: nested `v.object` / `z.object` with nesting `[20, 5, 4, 3]` (~1200 entries).

| Variant                           | Check time | Instantiations | Types  |
| --------------------------------- | ---------- | -------------- | ------ |
| Valibot + pipe (after our fixes)  | 1.65s      | 388,351        | 45,900 |
| Valibot no pipe (after our fixes) | 0.52s      | 125,140        | 24,995 |
| Zod + `.describe()`               | 0.24s      | 13,834         | 9,172  |
| Zod plain                         | 0.23s      | 12,812         | 8,664  |

Before our fixes, Valibot + pipe was 3.6s / 1,094,451 instantiations.

**Current gap**: Valibot is ~2x slower than Zod without pipe (0.52s vs 0.23s) and ~7x slower with pipe (1.65s vs 0.24s). Valibot produces 10x–28x more type instantiations.

## Type Trace Analysis

Using `tsc --generateTrace`, the type trace for the no-pipe case:

| Library | Total types | Named types | Object literals (readonly) | Object literals | Function types |
| ------- | ----------- | ----------- | -------------------------- | --------------- | -------------- |
| Valibot | 24,995      | 2,767       | 1,579                      | 539             | 554            |
| Zod     | 8,664       | 1,633       | 0                          | 1,577           | 2              |

Key differences:

- Valibot has **1,579 readonly object literal types** (from `BaseSchema` properties) — Zod has zero
- Valibot has **554 function types** (`~run` methods, references) — Zod has 2
- Valibot has 3x more total types (25K vs 9K)

## Architecture Comparison

### How each library infers the output type of `.parse()`

**Zod v4** (`z.object({...}).parse(data)`):

```
parse(data: unknown): core.output<this>
  → output<T> = T extends { _zod: { output: any } } ? T["_zod"]["output"] : unknown
    → this["_zod"]["output"]
      → $ZodObjectInternals<Shape, Config>["output"]
        → $InferObjectOutput<Shape, Config["out"]>
```

**Valibot** (`v.parse(v.object({...}), data)`):

```
parse(schema: TSchema, input: unknown): InferOutput<TSchema>
  → InferOutput<T> = NonNullable<T["~types"]>["output"]
    → ObjectSchema["~types"]["output"]
      → BaseSchema<InferObjectInput<TEntries>, InferObjectOutput<TEntries>, ...>["~types"]["output"]
        → InferObjectOutput<TEntries>
          → Prettify<OutputWithReadonly<TEntries, OutputWithQuestionMarks<TEntries, InferEntriesOutput<TEntries>>>>
```

### Schema type definitions side by side

**Zod's base type** (`v4/core/schemas.d.ts`):

```typescript
// Single _zod property holds everything
interface $ZodType<
  O = unknown,
  I = unknown,
  Internals extends $ZodTypeInternals<O, I> = $ZodTypeInternals<O, I>,
> {
  _zod: Internals;
  '~standard': $ZodStandardSchema<this>;
}

// Internals store pre-computed output/input
interface $ZodTypeInternals<out O = unknown, out I = unknown>
  extends _$ZodTypeInternals {
  output: O;
  input: I;
}

// Base internals — runtime stuff
interface _$ZodTypeInternals {
  version: typeof version;
  def: $ZodTypeDef;
  deferred: util.AnyFunc[] | undefined;
  run(payload, ctx): util.MaybeAsync<ParsePayload>;
  parse(payload, ctx): util.MaybeAsync<ParsePayload>;
  traits: Set<string>;
  optin?: 'optional' | undefined;
  optout?: 'optional' | undefined;
  // ... pattern, values, bag, etc. (schema-specific)
}
```

**Valibot's base type** (`library/src/types/schema.ts`):

```typescript
// 8 top-level readonly properties, all generic-parameterized
interface BaseSchema<TInput, TOutput, TIssue extends BaseIssue<unknown>> {
  readonly kind: 'schema';
  readonly type: string;
  readonly reference: (
    ...args: any[]
  ) => BaseSchema<unknown, unknown, BaseIssue<unknown>>;
  readonly expects: string;
  readonly async: false;
  readonly '~standard': StandardProps<TInput, TOutput>; // generic
  readonly '~run': (dataset, config) => OutputDataset<TOutput, TIssue>; // generic
  readonly '~types'?:
    | {
        readonly input: TInput; // generic
        readonly output: TOutput; // generic
        readonly issue: TIssue; // generic
      }
    | undefined;
}
```

### Object schema type definitions side by side

**Zod's object internals** (`v4/core/schemas.d.ts`):

```typescript
// Shape is just Record<string, $ZodType>
type $ZodShape = Readonly<{ [k: string]: $ZodType }>;

// Config controls loose/strict/strip behavior
type $ZodObjectConfig = {
  out: Record<string, unknown>;
  in: Record<string, unknown>;
};

interface $ZodObjectInternals<
  out Shape extends $ZodShape,
  out Config extends $ZodObjectConfig,
> extends _$ZodTypeInternals {
  def: $ZodObjectDef<Shape>;
  config: Config;
  isst: $ZodIssueInvalidType | $ZodIssueUnrecognizedKeys;
  output: $InferObjectOutput<Shape, Config['out']>; // computed once
  input: $InferObjectInput<Shape, Config['in']>; // computed once
  optin?: 'optional' | undefined;
  optout?: 'optional' | undefined;
}
```

**Valibot's object schema** (`library/src/schemas/object/object.ts`):

```typescript
// Entries is an index signature with union constraint
interface ObjectEntries {
  [key: string]:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | SchemaWithFallback<
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        unknown
      >
    | OptionalEntrySchema;
}

interface ObjectSchema<
  TEntries extends ObjectEntries,
  TMessage extends ErrorMessage<ObjectIssue> | undefined,
> extends BaseSchema<
    InferObjectInput<TEntries>, // computed in generic param
    InferObjectOutput<TEntries>, // computed in generic param
    ObjectIssue | InferObjectIssue<TEntries>
  > {
  readonly type: 'object';
  readonly reference: typeof object;
  readonly expects: 'Object';
  readonly entries: TEntries;
  readonly message: TMessage;
}
```

### Output type inference side by side

**Zod** (`v4/core/schemas.d.ts:557–566`):

```typescript
type OptionalOutSchema = { _zod: { optout: 'optional' } };

type $InferObjectOutput<
  T extends $ZodLooseShape,
  Extra extends Record<string, unknown>,
> = string extends keyof T
  ? util.IsAny<T[keyof T]> extends true
    ? Record<string, unknown>
    : Record<string, core.output<T[keyof T]>>
  : keyof (T & Extra) extends never
    ? Record<string, never>
    : util.Prettify<
        {
          -readonly [k in keyof T as T[k] extends OptionalOutSchema
            ? never
            : k]: T[k]['_zod']['output'];
        } & {
          -readonly [k in keyof T as T[k] extends OptionalOutSchema
            ? k
            : never]?: T[k]['_zod']['output'];
        } & Extra
      >;
```

**Valibot** (`library/src/types/object.ts`):

```typescript
type OptionalEntrySchema =
  | ExactOptionalSchema<
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >
  | NullishSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>
  | OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>;

// Step 1: Map each entry through InferOutput
type InferEntriesOutput<TEntries> = {
  -readonly [TKey in keyof TEntries]: InferOutput<TEntries[TKey]>;
};

// Step 2: Find optional keys (iterates all entries)
type OptionalOutputKeys<TEntries> = {
  [TKey in keyof TEntries]: TEntries[TKey] extends
    | OptionalEntrySchema
    | OptionalEntrySchemaAsync
    ? undefined extends TEntries[TKey]['default']
      ? TKey
      : never
    : never;
}[keyof TEntries];

// Step 3: Apply optionality via 3-way intersection
type MarkOptional<TObject, TKeys extends keyof TObject> = {
  [TKey in keyof TObject]?: unknown;
} & Omit<TObject, TKeys> &
  Partial<Pick<TObject, TKeys>>;

type OutputWithQuestionMarks<TEntries, TObject> = MarkOptional<
  TObject,
  OptionalOutputKeys<TEntries>
>;

// Step 4: Find readonly keys (iterates all entries, checks pipe)
type ReadonlyOutputKeys<TEntries> = {
  [TKey in keyof TEntries]: TEntries[TKey] extends {
    readonly pipe: readonly unknown[];
  }
    ? ReadonlyAction<any> extends TEntries[TKey]['pipe'][number]
      ? TKey
      : never
    : never;
}[keyof TEntries];

// Step 5: Apply readonly (short-circuits when no readonly keys)
type OutputWithReadonly<TEntries, TObject> =
  ReadonlyOutputKeys<TEntries> extends never
    ? TObject
    : Readonly<TObject> &
        Pick<TObject, Exclude<keyof TObject, ReadonlyOutputKeys<TEntries>>>;

// Step 6: Flatten
type InferObjectOutput<TEntries> = Prettify<
  OutputWithReadonly<
    TEntries,
    OutputWithQuestionMarks<TEntries, InferEntriesOutput<TEntries>>
  >
>;
```

### Output type extraction side by side

**Zod** (`v4/core/core.d.ts:55–59`):

```typescript
type output<T> = T extends { _zod: { output: any } }
  ? T['_zod']['output']
  : unknown;
```

One structural check, one property access. No constraint union.

**Valibot** (`library/src/types/infer.ts`):

```typescript
type InferOutput<
  TItem extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    | BaseValidation<any, unknown, BaseIssue<unknown>>
    | BaseValidationAsync<any, unknown, BaseIssue<unknown>>
    | BaseTransformation<any, unknown, BaseIssue<unknown>>
    | BaseTransformationAsync<any, unknown, BaseIssue<unknown>>
    | BaseMetadata<any>,
> = NonNullable<TItem['~types']>['output'];
```

7-member union constraint checked before the access, plus `NonNullable<>` wrapping.

### Prettify

Both use the same pattern:

```typescript
// Zod (v4/core/util.d.ts)
type Prettify<T> = { [K in keyof T]: T[K] } & {};

// Valibot (library/src/types/utils.ts)
type Prettify<TObject> = { [TKey in keyof TObject]: TObject[TKey] } & {};
```

## Root Causes of the Performance Gap

### 1. Per-entry type overhead (biggest factor)

For each entry in an object schema, TS creates type nodes for the schema's properties.

**Valibot per-entry** (e.g. `StringSchema`):

- `readonly kind: 'schema'` — literal type
- `readonly type: 'string'` — literal type
- `readonly reference: typeof string` — function type
- `readonly expects: 'string'` — literal type
- `readonly async: false` — literal type
- `readonly '~standard': StandardProps<string, string>` — generic instantiation
- `readonly '~run': (dataset, config) => OutputDataset<string, StringIssue>` — function type with generic return
- `readonly '~types'?: { input: string; output: string; issue: StringIssue } | undefined` — object type

That's **8 properties with 3 generic instantiations** (StandardProps, OutputDataset, ~types object) per entry.

**Zod per-entry** (e.g. `ZodString`):

- `_zod: $ZodStringInternals<string>` — single property

The internals contain `output: string`, `input: string`, and some runtime stuff, but they're in a **single generic instantiation**.

With 1200 entries: Valibot creates ~3600 extra generic type instantiations (3 per entry) while Zod creates ~1200 (1 per entry). This 3x multiplier compounds with nesting depth.

### 2. Multi-step `InferObjectOutput` vs single-step `$InferObjectOutput`

**Zod**: One mapped type with inline key remapping — 2 passes over entries (required + optional), direct `T[k]["_zod"]["output"]` access.

**Valibot**: 6 steps chained through type aliases:

1. `InferEntriesOutput` — 1 pass with `InferOutput<>` (7-union constraint check per entry)
2. `OptionalOutputKeys` — 1 pass with conditional
3. `MarkOptional` — creates 3-way intersection (`{ [K]?: unknown } & Omit<T, Keys> & Partial<Pick<T, Keys>>`)
4. `ReadonlyOutputKeys` — 1 pass with structural check (after our fix; was `infer` before)
5. `OutputWithReadonly` — conditional + intersection (short-circuits after our fix)
6. `Prettify` — 1 pass to flatten

Each intermediate type alias is a separate instantiation that TS must track.

### 3. Optional entry detection

**Zod**: `OptionalOutSchema = { _zod: { optout: "optional" } }` — checks a single string literal property. Every Zod schema that is optional has `_zod.optout: "optional"` set.

**Valibot**: `OptionalEntrySchema = ExactOptionalSchema<...> | NullishSchema<...> | OptionalSchema<...>` — checks against a **3-member union** of complex generic types, each with their own structural shape. Plus an async variant with 3 more members.

### 4. Readonly tracking

**Zod**: No readonly tracking in object output at all. `.readonly()` wraps the entire schema.

**Valibot**: Scans every entry for a `pipe` property, then checks if `ReadonlyAction` is in the pipe. Even after our fix (replaced `SchemaWithPipe<infer TPipe>` with `{ readonly pipe: readonly unknown[] }`), this still iterates all entries. The `OutputWithReadonly` short-circuit skips the intersection when no readonly keys exist, but `ReadonlyOutputKeys` is still evaluated.

### 5. `SchemaWithPipe` wrapping overhead

When Valibot entries use `v.pipe()`, each entry becomes a `SchemaWithPipe<[Schema, ...Actions]>` type which is:

```typescript
Omit<FirstTupleItem<TPipe>, 'pipe' | '~standard' | '~run' | '~types'> & { pipe, ~standard, ~run, ~types }
```

This `Omit + &` intersection creates a complex structural type that's expensive to work with. Zod has no equivalent wrapping — `.describe()` returns the same schema type (just adds metadata to `_zod`).

### 6. `InferOutput` constraint width

Valibot's `InferOutput<T>` has a 7-member union constraint (`BaseSchema | BaseSchemaAsync | BaseValidation | BaseValidationAsync | BaseTransformation | BaseTransformationAsync | BaseMetadata`). TS checks assignability against all 7 members before accessing `T['~types']['output']`.

Zod's `output<T>` has a single structural constraint (`{ _zod: { output: any } }`).

## What We Tried and What Helped

See `type-perf.md` for the full benchmark matrix (17 variants tested).

### Implemented (in current codebase)

| Fix                                                                                                        | Impact              | Description                                                       |
| ---------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| Replace `SchemaWithPipe<infer TPipe>` with `{ readonly pipe: readonly unknown[] }` in `ReadonlyOutputKeys` | **-53%** check time | Avoids expensive `infer` decomposition of `Omit + &` intersection |
| Short-circuit `OutputWithReadonly` when `ReadonlyOutputKeys extends never`                                 | **-7%** additional  | Skips `Readonly<T> & Pick<T, ...>` intersection in common case    |
| Same fix for record's `WithReadonly`                                                                       | consistency         | Same pattern in `library/src/schemas/record/types.ts`             |

### Tested but not implementable yet

| Experiment                                                                    | Impact                  | Blocker                                                                                                                                                       |
| ----------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod-style inline `InferObjectOutput` (key remapping, skip MarkOptional chain) | -24% no-pipe, -19% pipe | Breaks `VariantOption` type assignability — key remapped types aren't structurally identical to `MarkOptional` types                                          |
| Mapped type `SchemaWithPipe` (no `Omit + &`)                                  | -15-20%                 | Runtime can't satisfy mapped type with conditional keys — TS can't verify `{ ...pipe[0], pipe }` matches `{ [K in keyof ...]: K extends 'pipe' ? ... : ... }` |
| Replace `MarkOptional` with key remapping                                     | -7%                     | Same assignability issue as Zod-style InferObjectOutput                                                                                                       |

### Things that DON'T help

| Experiment                                                 | Result         | Why                                                          |
| ---------------------------------------------------------- | -------------- | ------------------------------------------------------------ |
| Reducing pipe overloads (21 → 2)                           | **10% slower** | Catch-all overload loses per-item type info, TS works harder |
| Direct `T['~types']['output']` instead of `InferOutput<T>` | No change      | TS caches the constraint check effectively                   |
| Simplifying `InferIssue<TPipe[number]>` in SchemaWithPipe  | Negligible     | Cheap for small pipes (2 items)                              |
| Removing `OptionalOutputKeys`/`OptionalInputKeys`          | Marginal       | Already cheap conditionals                                   |
| Removing `Prettify` from `InferObjectOutput`               | -5%            | Minor, bad DX tradeoff                                       |

## Actionable Next Steps

### Near-term (fix variant assignability to unblock Zod-style output)

The Zod-style inline `InferObjectOutput` gives 24% improvement but breaks `VariantOption<TKey>` assignability. The issue is that `VariantObjectEntries<TKey>` is `Record<TKey, BaseSchema | OptionalEntrySchema> & ObjectEntries`, and when TS evaluates key remapping on this intersection type, it produces a structurally different result than `MarkOptional`.

**Path forward**: Change `VariantOption` to check structural compatibility differently — instead of relying on `ObjectSchema<VariantObjectEntries<TKey>>` assignability through `BaseSchema` generic parameters, check the entries shape directly. This needs careful investigation of all variant-related types.

### Medium-term (reduce per-entry type overhead)

Each Valibot schema entry creates 3+ generic instantiations (StandardProps, OutputDataset, ~types). Consider:

- Moving `~standard` and `~run` types to be non-generic (use `unknown` params at the base level)
- Consolidating schema properties into a single `_internals` object (like Zod's `_zod`)
- Storing `input`/`output`/`issue` types directly on the schema rather than in a nested optional object

### Long-term (v2 architecture)

Zod's design is fundamentally more TS-efficient because:

1. Single `_zod` property instead of 8+ top-level properties
2. `output` and `input` stored as direct properties, not through `NonNullable<T['~types']>['output']`
3. Optional detection via simple string literal (`optout: "optional"`) instead of union matching
4. No pipe wrapping overhead — transformations compose differently

A v2 API could adopt similar patterns while preserving Valibot's runtime characteristics.

## Reproducing the Benchmarks

### Setup

```bash
cd library
pnpm build                          # produces dist/index.d.mts
mkdir debug && cd debug
npm init -y && npm install zod      # install Zod for comparison
```

### Generate test schemas

Use the generation script from `type-perf.md` (supports both Valibot and Zod output). For Zod, replace `v.object({...})` with `z.object({...})` and `v.pipe(schema, v.title('test'))` with `schema.describe('test')`.

### Measure

```bash
npx tsc --noEmit --extendedDiagnostics -p tsconfig.json
# Reports: Check time, Types, Instantiations, Memory used

npx tsc --noEmit --generateTrace traceDir -p tsconfig.json
# Produces trace.json (event timing) and types.json (type instantiation details)
```

### Modifying types for experiments

1. Copy `dist/index.d.mts` to `dist-variant/index.d.mts`
2. Edit specific type definitions in the copy (use `sed` or Python scripts)
3. Create debug `.ts` files that `import * as v from './dist-variant/index.mjs'`
4. Measure each variant independently

This approach isolates type-level changes without modifying source code or rebuilding.
