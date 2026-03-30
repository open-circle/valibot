# TypeScript Type Performance Investigation

Issue: https://github.com/open-circle/valibot/issues/1374

## Problem

Users report extremely slow TypeScript autocompletion when using Valibot schemas with many entries and `v.pipe()`. Zod v4 is near-instant for equivalent schemas.

Reporter measurements at `[30, 10, 4, 3]` scale:

- Without pipe: ~1.5s per completion
- With pipe (no actions): ~5s per completion
- With pipe + one action (e.g. `v.title`): ~7s per completion

At `[100, 10, 4, 3]` scale:

- `v.object`: 13-15s per completion
- `v.tuple`: 1.5-1.8s per completion

## Methodology

### Benchmarking setup

1. Build the library with `pnpm build` (produces `dist/index.d.mts`)
2. Generate large test schemas using script from the issue (see "Schema generation" below)
3. Create copies of `dist/index.d.mts` with targeted type modifications
4. Create debug `.ts` files that import from each copy
5. Measure with `npx tsc --noEmit --extendedDiagnostics -p tsconfig-variant.json`
6. For deeper analysis: `npx tsc --noEmit --generateTrace traceDir -p tsconfig.json` then inspect `trace.json` and `types.json`

### Schema generation script

```js
// generate.mjs — creates debug-object-pipe.ts etc.
function createRandomObject(
  list,
  metadataCount,
  useObject = true,
  usePipe = true
) {
  function createObject(depth, maxDepth) {
    if (depth >= maxDepth) return null;
    const result = {};
    const keyCount = list[depth] || 1;
    for (let i = 0; i < keyCount; i++) {
      let key;
      const nestedObject = createObject(depth + 1, maxDepth);
      if (nestedObject !== null) {
        let data;
        if (useObject) {
          data = Object.keys(nestedObject)
            .map((item) => `${item}:${nestedObject[item]}`)
            .join(',\n');
          key = `object_${i}`;
          result[key] = `v.object({${data}})`;
        } else {
          data = Object.keys(nestedObject)
            .map((k) => `${nestedObject[k]}`)
            .join(',');
          key = `tuple_${i}`;
          result[key] = `v.tuple([${data}])`;
        }
      } else {
        key = `string_${i}`;
        result[key] = 'v.string()';
      }
      if (usePipe) {
        let count = metadataCount;
        while (count) {
          result[key] = `v.pipe(${result[key]},v.title('test'))`;
          count--;
        }
      }
    }
    return result;
  }
  return createObject(0, list.length);
}

// Example: [20, 5, 4, 3] with metadataCount=1, useObject=true, usePipe=true
const randomObject = createRandomObject([20, 5, 4, 3], 1, true, true);
let data = Object.keys(randomObject)
  .map((item) => `${item}:${randomObject[item]}`)
  .join(',');
let output = `import * as v from '../dist/index.mjs';\nlet Define = v.object({${data}});\nlet value = v.parse(Define, undefined);\n`;
```

### tsconfig for debug files

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["debug-file.ts"]
}
```

## Architecture: How object output types are inferred

When you write `v.parse(v.object({...}), input)`, TypeScript resolves the return type through this chain:

```
InferOutput<ObjectSchema<TEntries>>
  → ObjectSchema extends BaseSchema<_, InferObjectOutput<TEntries>, _>
    → NonNullable<ObjectSchema['~types']>['output']
      → InferObjectOutput<TEntries>
```

`InferObjectOutput` (in `library/src/types/object.ts`) is the critical type:

```
InferObjectOutput<TEntries>
  = Prettify<
      OutputWithReadonly<
        TEntries,
        OutputWithQuestionMarks<TEntries, InferEntriesOutput<TEntries>>
      >
    >
```

This decomposes into 6+ layers:

| Layer | Type                                       | What it does                                        | Cost                                 |
| ----- | ------------------------------------------ | --------------------------------------------------- | ------------------------------------ |
| 1     | `InferEntriesOutput<TEntries>`             | Maps each key through `InferOutput`                 | O(N)                                 |
| 2     | `OptionalOutputKeys<TEntries>`             | Checks each key against `OptionalEntrySchema` union | O(N)                                 |
| 3     | `OutputWithQuestionMarks` → `MarkOptional` | Marks optional keys with `?`                        | Creates 3-way intersection           |
| 4     | `ReadonlyOutputKeys<TEntries>`             | Checks each key for `ReadonlyAction` in pipe        | **O(N) expensive**                   |
| 5     | `OutputWithReadonly`                       | Applies `readonly` to selected keys                 | Creates `Readonly<T> & Pick<T, ...>` |
| 6     | `Prettify`                                 | Flattens intersections for tooltip display          | Forces eager expansion               |

For comparison, `InferTupleOutput` (in `library/src/types/tuple.ts`) is trivial:

```typescript
type InferTupleOutput<TItems> = {
  -readonly [TKey in keyof TItems]: InferOutput<TItems[TKey]>;
};
```

No optional detection, no readonly detection, no multi-layer processing.

### Why `ReadonlyOutputKeys` was the primary bottleneck

The original implementation:

```typescript
type ReadonlyOutputKeys<TEntries> = {
  [TKey in keyof TEntries]: TEntries[TKey] extends
    | SchemaWithPipe<infer TPipe> // <-- expensive infer
    | SchemaWithPipeAsync<infer TPipe> // <-- expensive infer
    ? ReadonlyAction<any> extends TPipe[number]
      ? TKey
      : never
    : never;
}[keyof TEntries];
```

`SchemaWithPipe<infer TPipe>` forces TypeScript to structurally decompose the full `Omit<FirstTupleItem<TPipe>, 'pipe' | '~standard' | '~run' | '~types'> & { ... }` intersection type to extract `TPipe` for **every single entry**. This happens even when no entry uses `readonly()` — which is the overwhelmingly common case.

### `SchemaWithPipe` type structure

Defined in `library/src/methods/pipe/pipe.ts`:

```typescript
type SchemaWithPipe<TPipe extends readonly [BaseSchema<...>, ...PipeItem<...>[]]> =
  Omit<FirstTupleItem<TPipe>, 'pipe' | '~standard' | '~run' | '~types'> & {
    readonly pipe: TPipe;
    readonly '~standard': StandardProps<InferInput<FirstTupleItem<TPipe>>, InferOutput<LastTupleItem<TPipe>>>;
    readonly '~run': (...) => OutputDataset<InferOutput<LastTupleItem<TPipe>>, InferIssue<TPipe[number]>>;
    readonly '~types'?: { input: ...; output: ...; issue: ... } | undefined;
  };
```

The `Omit + &` pattern preserves base schema properties (like `type`, `kind`, `entries`) while overriding `pipe`, `~standard`, `~run`, `~types`. This is necessary for runtime assignability but creates an expensive intersection type.

### `MarkOptional` creates a 3-way intersection

```typescript
type MarkOptional<TObject, TKeys extends keyof TObject> = {
  [TKey in keyof TObject]?: unknown;
} & Omit<TObject, TKeys> &
  Partial<Pick<TObject, TKeys>>;
```

The `{ [TKey]?: unknown }` is a trick to preserve key ordering in IDE tooltips. Applied in both `InputWithQuestionMarks` and `OutputWithQuestionMarks`.

### Pipe function overloads

`pipe()` has 21 overloads (1 per arity from 1-19 items, plus a catch-all with rest params). Each overload chains `InferOutput<TItemN-1>` into the constraint for `TItemN`. `pipeAsync()` has a similar count.

## Benchmark Results

All measurements on schema `[20, 5, 4, 3]` with `metadataCount=1` (object + pipe), ~1200 entries.
TypeScript 5.9.3 on macOS.

### Phase 1: Isolating bottlenecks

Each variant modifies one type in a copy of `dist/index.d.mts`.

| #   | Variant                                                  | Check time | Instantiations | vs Baseline |
| --- | -------------------------------------------------------- | ---------- | -------------- | ----------- |
| —   | **Baseline (original)**                                  | **3.46s**  | **1,094,451**  | —           |
| —   | object no pipe (reference)                               | 0.83s      | 195,816        | ref         |
| v2  | `ReadonlyOutputKeys` = `never`                           | 1.58s      | 385,649        | **-54%**    |
| v3  | `OutputWithReadonly` = passthrough `TObject`             | 1.46s      | 347,563        | **-58%**    |
| v4  | Simplified `MarkOptional` (2-way intersection)           | 3.22s      | 1,041,301      | -7%         |
| v5  | Remove `Prettify` from `InferObjectOutput`               | 3.27s      | 1,069,852      | -5%         |
| v6  | Direct property access in `ReadonlyOutputKeys`           | 1.63s      | 428,700        | **-53%**    |
| v7  | Short-circuit `OutputWithReadonly` when no readonly keys | 3.23s      | 1,000,389      | -7%         |
| v8  | v6 + v7 + v4 combined                                    | 1.53s      | 337,070        | **-56%**    |

**Key insight**: `ReadonlyOutputKeys` with `SchemaWithPipe<infer TPipe>` accounts for ~50% of total check time. Replacing `infer` with a direct structural check (`{ readonly pipe: readonly unknown[] }` + indexed access) nearly eliminates this cost.

### Phase 2: Deeper investigation

Starting from v8 (all object type optimizations combined).

| #   | Variant                                | Check time | Instantiations | Notes            |
| --- | -------------------------------------- | ---------- | -------------- | ---------------- |
| v8  | All object type opts                   | 1.53s      | 337,070        | Base for Phase 2 |
| v9  | v8 + `OptionalOutputKeys` = `never`    | 1.55s      | 313,454        | Marginal         |
| v10 | v8 + simplified `SchemaWithPipe` type  | 1.52s      | 337,070        | No change        |
| v11 | v9 + direct mapped `InferObjectOutput` | 1.35s      | 222,905        | Moderate         |
| —   | object no pipe (reference)             | 0.83s      | 195,816        | —                |

**Insight**: Optional key detection (`OptionalOutputKeys`, `OptionalInputKeys`) is cheap. The remaining gap after v8 is inherent to `SchemaWithPipe` entries being structurally more complex than plain schemas.

### Phase 3: Pipe infrastructure

| #   | Variant                                                                     | Check time | Instantiations | Notes       |
| --- | --------------------------------------------------------------------------- | ---------- | -------------- | ----------- |
| v8  | All object type opts                                                        | 1.63s      | 337,070        | —           |
| v12 | v8 + reduced pipe overloads (21 → 2)                                        | 1.79s      | 336,504        | **Slower!** |
| v13 | v8 + `InferIssue<TPipe[number]>` → `BaseIssue<unknown>` in `SchemaWithPipe` | 1.65s      | 332,898        | Negligible  |
| v14 | v12 + v13                                                                   | 1.51s      | 332,332        | Marginal    |

**Insight**: Reducing pipe overloads actually makes things slower. The catch-all overload `(...items: TItems[])` loses per-item type information, forcing TS to work harder. The specific overloads resolve faster because TS can match early. `InferIssue<TPipe[number]>` distribution is cheap for small pipes (2 items).

### Phase 4: SchemaWithPipe structure

| #   | Variant                                               | Check time | Instantiations | Notes          |
| --- | ----------------------------------------------------- | ---------- | -------------- | -------------- |
| v8  | All object type opts                                  | 1.51s      | 337,070        | —              |
| v15 | v8 + no `Omit` (just `FirstTupleItem & props`)        | 1.32s      | 330,050        | -13%           |
| v16 | v8 + `TPipe[0] & props`                               | 1.37s      | 330,048        | Similar to v15 |
| v17 | v8 + mapped type `SchemaWithPipe` (no `Omit`, no `&`) | **1.28s**  | 356,019        | **-15%**       |

**Insight**: The `Omit<FirstTupleItem<TPipe>, ...> & { ... }` pattern in `SchemaWithPipe` adds ~15-20% overhead. Replacing with a mapped type `{ [K in keyof FirstTupleItem<TPipe> | 'pipe']: K extends ... }` is faster. However, **the mapped type approach breaks the runtime implementation** — TypeScript cannot verify that `{ ...pipe[0], pipe, ... }` satisfies a conditional mapped type. This would require changes to the runtime `pipe()`/`pipeAsync()` function bodies.

v15 (removing `Omit` but keeping `&`) is also unsafe for transforms: the intersection of base schema `~types` and pipe `~types` produces wrong output types when a transform changes the type.

### Phase 5: Trace analysis

Using `tsc --generateTrace`, the top-level `v.object({...})` call accounts for ~1.7s of 1.6s check time. The most expensive events:

- `checkVariableDeclaration` (the `let Define = ...` assignment): 1.7s
- `checkExpression` (the `v.object({...})` call): 1.7s
- Individual nested `v.pipe(v.object({...}), ...)` calls: 80-240ms each

Type instantiation breakdown (42,101 total types):

- 1,200 `~types` property instantiations (one per entry)
- 1,043 `~run` method type instantiations
- 800 `entries` property type instantiations

## Changes Implemented

### Fix 1: Direct property access in `ReadonlyOutputKeys` (~53% improvement)

**File**: `library/src/types/object.ts`

```typescript
// BEFORE
type ReadonlyOutputKeys<TEntries> = {
  [TKey in keyof TEntries]: TEntries[TKey] extends
    | SchemaWithPipe<infer TPipe>
    | SchemaWithPipeAsync<infer TPipe>
    ? ReadonlyAction<any> extends TPipe[number] ? TKey : never
    : never;
}[keyof TEntries];

// AFTER
type ReadonlyOutputKeys<TEntries> = {
  [TKey in keyof TEntries]: TEntries[TKey] extends {
    readonly pipe: readonly unknown[];
  }
    ? ReadonlyAction<any> extends TEntries[TKey]['pipe'][number] ? TKey : never
    : never;
}[keyof TEntries];
```

**Why**: `SchemaWithPipe<infer TPipe>` forces TS to structurally decompose the full `Omit + &` intersection to infer `TPipe` for every entry. The replacement checks for a simple structural property (cheap) and uses indexed access (cached by TS). Entries without `pipe` short-circuit immediately.

### Fix 2: Short-circuit `OutputWithReadonly` (~7% additional)

**File**: `library/src/types/object.ts`

```typescript
// BEFORE
type OutputWithReadonly<TEntries, TObject> =
  Readonly<TObject> & Pick<TObject, Exclude<keyof TObject, ReadonlyOutputKeys<TEntries>>>;

// AFTER
type OutputWithReadonly<TEntries, TObject> =
  ReadonlyOutputKeys<TEntries> extends never
    ? TObject
    : Readonly<TObject> & Pick<TObject, Exclude<keyof TObject, ReadonlyOutputKeys<TEntries>>>;
```

**Why**: In the common case (no `readonly()` actions), returns `TObject` directly, skipping the `Readonly<T> & Pick<T, ...>` intersection.

### Fix 3: Same pattern for record's `WithReadonly`

**File**: `library/src/schemas/record/types.ts`

Same `SchemaWithPipe<infer TPipe>` → `{ readonly pipe: readonly unknown[] }` replacement.

### Final measured results

| Metric         | Before    | After   | Improvement    |
| -------------- | --------- | ------- | -------------- |
| Check time     | 3.6s      | 1.6s    | **56% faster** |
| Instantiations | 1,094,451 | 388,351 | **65% fewer**  |
| Memory         | 454MB     | 230MB   | **49% less**   |

## Comparison with Zod v4

Tested Zod v4.3.6 with equivalent schemas (same nesting structure `[20,5,4,3]`).

| Variant                           | Check time | Instantiations | Types      |
| --------------------------------- | ---------- | -------------- | ---------- |
| **Valibot + pipe** (after fixes)  | **1.65s**  | **388,351**    | **45,900** |
| **Valibot no pipe** (after fixes) | **0.52s**  | **125,140**    | **24,995** |
| Zod + `.describe()`               | 0.24s      | 13,834         | 9,172      |
| Zod plain                         | 0.23s      | 12,812         | 8,664      |

Valibot is still ~2x slower than Zod without pipe and ~7x slower with pipe. The remaining gap comes from fundamental architectural differences.

### Why Zod is faster (architectural analysis)

**Zod's approach** (from `node_modules/zod/v4/core/`):

1. **Single `_zod` property**: Zod schemas store all internals in one `_zod` property, not 8+ separate properties like Valibot's `kind`, `type`, `reference`, `expects`, `async`, `~standard`, `~run`, `~types`.

2. **Direct property access for output**: `output<T>` = `T extends { _zod: { output: any } } ? T["_zod"]["output"] : unknown` — trivially cheap. Valibot's `InferOutput<T>` checks a 7-member union constraint first.

3. **Inline key remapping for optional keys**: Zod computes optional/required keys in a single mapped type:

   ```typescript
   type $InferObjectOutput<T, Extra> = Prettify<
     {
       [k in keyof T as T[k] extends OptionalOutSchema
         ? never
         : k]: T[k]['_zod']['output'];
     } & {
       [k in keyof T as T[k] extends OptionalOutSchema
         ? k
         : never]?: T[k]['_zod']['output'];
     } & Extra
   >;
   ```

   No intermediate `OptionalOutputKeys` → `MarkOptional` → `OutputWithQuestionMarks` chain.

4. **Simple optional detection**: `OptionalOutSchema = { _zod: { optout: "optional" } }` — a single property check. Valibot checks against a 3-member union (`ExactOptionalSchema | NullishSchema | OptionalSchema`) with their async variants.

5. **No readonly key tracking in object output**: Zod handles `.readonly()` at the wrapper level, not by scanning each entry's pipe for a `ReadonlyAction`.

6. **No `Omit + &` in schema wrappers**: Zod doesn't use `Omit<FirstTupleItem<...>, ...> & { ... }` patterns that are expensive to instantiate.

7. **Fewer properties per schema**: Zod's `_zod` internals have ~5 properties. Valibot's `BaseSchema` has 8 top-level readonly properties, each parameterized by generics.

### Zod-style `InferObjectOutput` experiment

Tested replacing `InferObjectOutput` with Zod-style inline key remapping (skip `MarkOptional`, `OptionalOutputKeys`, `OutputWithQuestionMarks`):

| Variant (no pipe)             | Check time | Instantiations |
| ----------------------------- | ---------- | -------------- |
| Current Valibot               | 0.55s      | 125,140        |
| + Zod-style InferObjectOutput | 0.42s      | 67,846         |
| + also remove Prettify        | 0.46s      | 65,438         |
| Zod reference                 | 0.24s      | 12,812         |

**Result**: 24% faster, 46% fewer instantiations for the no-pipe case.

**Blocker**: The key remapping approach produces structurally different types than `MarkOptional` for TypeScript's assignability checks. Specifically, `variant()` schemas with optional discriminator entries fail type-checking because the remapped type isn't assignable where the `MarkOptional` type was. This would require updating the `VariantOption`/`VariantObjectEntries` types to work with the new structural shape.

## Remaining Opportunities

Sorted by expected impact, with feasibility notes.

### 1. Zod-style inline `InferObjectOutput`/`InferObjectInput` (~24% for no-pipe, ~19% for pipe)

Replace the `MarkOptional` + `OptionalOutputKeys` + `OutputWithQuestionMarks` chain with Zod-style inline key remapping. **Blocked by** variant schema assignability — needs changes to `VariantOption`/`VariantObjectEntries` types to accept the new structural shape. This is the highest-impact achievable change.

### 2. Replace `Omit + &` in `SchemaWithPipe` with mapped type (~15-20% additional)

The mapped type approach (v17) benchmarked at 1.28s vs 1.6s. However, it breaks runtime assignability because TS can't verify `{ ...pipe[0], pipe, ... }` satisfies a conditional mapped type. Solutions:

- Change the runtime to construct objects differently (type assertion may be needed)
- Use a hybrid approach: mapped type for the type definition, `as` cast in the implementation
- Investigate if `satisfies` or a helper function can bridge the gap

### 3. Simplify `MarkOptional` (~7%)

Replace the 3-way intersection with a 2-way using key remapping:

```typescript
type MarkOptional<TObject, TKeys extends keyof TObject> = {
  [TKey in keyof TObject as TKey extends TKeys ? never : TKey]: TObject[TKey];
} & {
  [TKey in TKeys]?: TObject[TKey];
};
```

Risk: May change key ordering in IDE tooltips and break variant assignability (same issue as #1).

### 4. Remove or lazy-evaluate `Prettify` (~5%)

`Prettify` forces TS to eagerly expand the full type. Removing it would make IDE tooltips show nested utility types instead of the final shape, which is a DX tradeoff.

### 5. Reduce per-schema type complexity (architectural, for v2)

Valibot's `BaseSchema<TInput, TOutput, TIssue>` has 8 properties, several parameterized by generics (`~standard: StandardProps<TInput, TOutput>`, `~run: (...) => OutputDataset<TOutput, TIssue>`). Each creates additional type instantiations. Zod uses a single `_zod` property. A v2 could consolidate schema properties to reduce per-entry type overhead.

### 6. Investigate TypeScript-side improvements

The reporter filed https://github.com/microsoft/typescript-go/issues/2384. TypeScript 5.9 included optimizations specifically for Zod. Similar optimizations for Valibot's patterns (especially `infer` in `extends` clauses of mapped types) could help.

### Things that DON'T help

- **Reducing pipe overloads**: Actually makes things slower (catch-all is less efficient)
- **Simplifying `InferIssue<TPipe[number]>`**: Negligible for small pipes
- **Removing `OptionalOutputKeys`/`OptionalInputKeys`**: Already cheap
- **Simplifying `InferOutput`/`InferInput` constraint union**: Not measurable
- **Using `T['~types']['output']` instead of `InferOutput<T>`**: No measurable difference
