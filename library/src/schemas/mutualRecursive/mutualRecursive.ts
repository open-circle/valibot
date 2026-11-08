import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferIssue,
  InferOutput,
  IsAny,
  UnknownDataset,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';

/**
 * The recursive owner currently running.
 *
 * @internal
 */
export const OwnerSymbol: unique symbol = Symbol('recursive owner');

/**
 * Configuration that carries the recursive owner.
 *
 * @internal
 */
export interface ConfigWithOwner extends Config<BaseIssue<unknown>> {
  /**
   * The authorized recursive owner.
   */
  readonly [OwnerSymbol]?: RecursiveOwner;
}

// Named interfaces keep recursive array output from collapsing into circular
// type aliases while preserving normal array behavior.
/* eslint-disable @typescript-eslint/no-empty-object-type -- These interfaces provide named recursive array indirection for TypeScript. */

/**
 * Recursive array interface.
 */
export interface RecursiveArray<TItem, TRoot>
  extends Array<ResolveRecursiveValue<TItem, TRoot>> {}

/**
 * Recursive readonly array interface.
 */
export interface RecursiveReadonlyArray<TItem, TRoot>
  extends ReadonlyArray<ResolveRecursiveValue<TItem, TRoot>> {}

/* eslint-enable @typescript-eslint/no-empty-object-type */

// Maps each element of a tuple through the resolver, preserving the tuple's
// positional structure (fixed slots, labels, optionality, readonly).
type ResolveRecursiveTuple<TValue extends readonly unknown[], TRoot> = {
  [TKey in keyof TValue]: ResolveRecursiveValue<TValue[TKey], TRoot>;
};

// Literal tuple branches defer recursive elements without a spread or mapped
// tuple. Optional, readonly, and longer tuples retain the existing resolver.
type ResolveRecursiveFixedTuple<
  TValue extends readonly unknown[],
  TRoot,
> = TValue extends [infer A]
  ? [ResolveRecursiveValue<A, TRoot>]
  : TValue extends [infer A, infer B]
    ? [ResolveRecursiveValue<A, TRoot>, ResolveRecursiveValue<B, TRoot>]
    : TValue extends [infer A, infer B, infer C]
      ? [
          ResolveRecursiveValue<A, TRoot>,
          ResolveRecursiveValue<B, TRoot>,
          ResolveRecursiveValue<C, TRoot>,
        ]
      : TValue extends [infer A, infer B, infer C, infer D]
        ? [
            ResolveRecursiveValue<A, TRoot>,
            ResolveRecursiveValue<B, TRoot>,
            ResolveRecursiveValue<C, TRoot>,
            ResolveRecursiveValue<D, TRoot>,
          ]
        : TValue extends [infer A, infer B, infer C, infer D, infer E]
          ? [
              ResolveRecursiveValue<A, TRoot>,
              ResolveRecursiveValue<B, TRoot>,
              ResolveRecursiveValue<C, TRoot>,
              ResolveRecursiveValue<D, TRoot>,
              ResolveRecursiveValue<E, TRoot>,
            ]
          : TValue extends [
                infer A,
                infer B,
                infer C,
                infer D,
                infer E,
                infer F,
              ]
            ? [
                ResolveRecursiveValue<A, TRoot>,
                ResolveRecursiveValue<B, TRoot>,
                ResolveRecursiveValue<C, TRoot>,
                ResolveRecursiveValue<D, TRoot>,
                ResolveRecursiveValue<E, TRoot>,
                ResolveRecursiveValue<F, TRoot>,
              ]
            : TValue extends [
                  infer A,
                  infer B,
                  infer C,
                  infer D,
                  infer E,
                  infer F,
                  infer G,
                ]
              ? [
                  ResolveRecursiveValue<A, TRoot>,
                  ResolveRecursiveValue<B, TRoot>,
                  ResolveRecursiveValue<C, TRoot>,
                  ResolveRecursiveValue<D, TRoot>,
                  ResolveRecursiveValue<E, TRoot>,
                  ResolveRecursiveValue<F, TRoot>,
                  ResolveRecursiveValue<G, TRoot>,
                ]
              : TValue extends [
                    infer A,
                    infer B,
                    infer C,
                    infer D,
                    infer E,
                    infer F,
                    infer G,
                    infer H,
                  ]
                ? [
                    ResolveRecursiveValue<A, TRoot>,
                    ResolveRecursiveValue<B, TRoot>,
                    ResolveRecursiveValue<C, TRoot>,
                    ResolveRecursiveValue<D, TRoot>,
                    ResolveRecursiveValue<E, TRoot>,
                    ResolveRecursiveValue<F, TRoot>,
                    ResolveRecursiveValue<G, TRoot>,
                    ResolveRecursiveValue<H, TRoot>,
                  ]
                : ResolveRecursiveTuple<TValue, TRoot>;

type ResolveRecursiveArray<
  TValue extends readonly unknown[],
  TRoot,
> = number extends TValue['length']
  ? // Variadic tuples (e.g. `[string, ...self[]]`) also have a `number` length,
    // but unlike plain arrays carry fixed leading or trailing elements, so map
    // element-wise to keep those slots intact.
    TValue extends
      | readonly [unknown, ...unknown[]]
      | readonly [...unknown[], unknown]
    ? ResolveRecursiveTuple<TValue, TRoot>
    : TValue extends (infer TItem)[]
      ? true extends (
          TItem extends RecursiveMarker<string | undefined> ? true : false
        )
        ? RecursiveArray<TItem, TRoot>
        : ResolveRecursiveValue<TItem, TRoot>[]
      : TValue extends readonly (infer TItem)[]
        ? true extends (
            TItem extends RecursiveMarker<string | undefined> ? true : false
          )
          ? RecursiveReadonlyArray<TItem, TRoot>
          : readonly ResolveRecursiveValue<TItem, TRoot>[]
        : never
  : ResolveRecursiveFixedTuple<TValue, TRoot>;

// Rebuilds a container with its type arguments resolved. TypeScript cannot
// reconstruct an arbitrary generic with substituted type arguments, so each
// container kind must be enumerated explicitly. This list must cover every
// container a Valibot schema can infer; an unlisted generic (e.g. `WeakMap`)
// falls through to the object branch, which maps over its methods and leaves
// the marker in its type arguments unresolved.
type ResolveRecursiveContainer<TValue, TRoot> =
  TValue extends Map<infer TKey, infer TItem>
    ? Map<
        ResolveRecursiveValue<TKey, TRoot>,
        ResolveRecursiveValue<TItem, TRoot>
      >
    : TValue extends ReadonlyMap<infer TKey, infer TItem>
      ? ReadonlyMap<
          ResolveRecursiveValue<TKey, TRoot>,
          ResolveRecursiveValue<TItem, TRoot>
        >
      : TValue extends Set<infer TItem>
        ? Set<ResolveRecursiveValue<TItem, TRoot>>
        : TValue extends ReadonlySet<infer TItem>
          ? ReadonlySet<ResolveRecursiveValue<TItem, TRoot>>
          : TValue extends Promise<infer TItem>
            ? Promise<ResolveRecursiveValue<TItem, TRoot>>
            : TValue extends readonly unknown[]
              ? ResolveRecursiveArray<TValue, TRoot>
              : TValue extends object
                ? {
                    [TKey in keyof TValue]: ResolveRecursiveValue<
                      TValue[TKey],
                      TRoot
                    >;
                  }
                : TValue;

type MergeReference<TValue, TExtra> = {
  [TKey in keyof (TValue & TExtra)]: (TValue & TExtra)[TKey];
};

type ResolveRecursiveValue<TValue, TRoot> =
  IsAny<TValue> extends true
    ? TValue
    : TValue extends RecursiveMarker<infer TKey>
      ? TKey extends undefined
        ? ResolveRecursiveValue<TRoot, TRoot>
        : TKey extends keyof TRoot
          ? Exclude<keyof TValue, typeof RecursiveMarkerSymbol> extends never
            ? ResolveRecursiveValue<TRoot[TKey], TRoot>
            : MergeReference<
                ResolveRecursiveValue<TRoot[TKey], TRoot>,
                ResolveRecursiveContainer<
                  Omit<TValue, typeof RecursiveMarkerSymbol>,
                  TRoot
                >
              >
          : never
      : [RecursiveReferences<TValue>] extends [never]
        ? TValue
        : ResolveRecursiveContainer<TValue, TRoot>;

/**
 * Resolve recursive input type.
 *
 * @internal
 */
export type ResolveRecursiveInput<
  TValue,
  TRoot = TValue,
> = ResolveRecursiveValue<TValue, TRoot>;

/**
 * Resolve recursive output type.
 *
 * @internal
 */
export type ResolveRecursiveOutput<
  TValue,
  TRoot = TValue,
> = ResolveRecursiveValue<TValue, TRoot>;

/**
 * Recursive schema interface.
 */
export interface MutualRecursiveSchema<
  TWrapped extends GenericSchema = GenericSchema,
  TInput = unknown,
  TOutput = unknown,
  TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseSchema<TInput, TOutput, TIssue> {
  /**
   * The schema type.
   */
  readonly type: 'mutualRecursive';
  /**
   * The schema reference.
   */
  readonly reference: typeof createRecursiveSchema;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
}

type SyncOrAsyncSchema = GenericSchema | GenericSchemaAsync;

/**
 * Common runtime contract for recursive reference owners.
 *
 * @internal
 */
export interface RecursiveOwner {
  /**
   * The callback result that references resolve against.
   */
  readonly definition: SyncOrAsyncSchema | Record<string, SyncOrAsyncSchema>;
  /**
   * Whether references execute asynchronously.
   */
  readonly async: boolean;
  /**
   * The owner schema factory.
   */
  readonly reference: SyncOrAsyncSchema['reference'];
}

type Entries = Record<string, GenericSchema>;

type DefinitionInputs<TEntries extends Entries> = {
  [TKey in keyof TEntries]: InferInput<TEntries[TKey]>;
};
type DefinitionOutputs<TEntries extends Entries> = {
  [TKey in keyof TEntries]: InferOutput<TEntries[TKey]>;
};

/**
 * Collects recursive references from a value.
 */
export type RecursiveReferences<TValue, TSeen = never> =
  IsAny<TValue> extends true
    ? never
    : TValue extends RecursiveMarker<string | undefined>
      ? TValue
      : [TValue] extends [TSeen]
        ? never
        : TValue extends
              | Map<infer TKey, infer TItem>
              | ReadonlyMap<infer TKey, infer TItem>
          ? RecursiveReferences<TKey | TItem, TSeen | TValue>
          : TValue extends
                | Set<infer TItem>
                | ReadonlySet<infer TItem>
                | Promise<infer TItem>
            ? RecursiveReferences<TItem, TSeen | TValue>
            : TValue extends readonly (infer TItem)[]
              ? RecursiveReferences<TItem, TSeen | TValue>
              : TValue extends object
                ? {
                    [TKey in keyof TValue]-?: RecursiveReferences<
                      TValue[TKey],
                      TSeen | TValue
                    >;
                  }[keyof TValue]
                : never;

type ReferenceNames<TReference> =
  TReference extends RecursiveMarker<infer TName> ? TName : never;

type UnmatchedReferences<TEntries extends Entries> = Exclude<
  ReferenceNames<
    RecursiveReferences<
      DefinitionInputs<TEntries> | DefinitionOutputs<TEntries>
    >
  >,
  keyof TEntries
>;

interface Error<TReason extends string> {
  readonly reason: TReason;
  readonly impossible: never;
}

type CheckReferences<TEntries extends Entries> = [
  UnmatchedReferences<TEntries>,
] extends [never]
  ? unknown
  : Error<`Unmatched recursive reference: '${Extract<UnmatchedReferences<TEntries>, string>}'`>;

/**
 * Resolved recursive schema interface.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- A named interface defers recursive type resolution.
export interface ResolvedRecursiveSchema<
  TWrapped extends GenericSchema,
  TInputRoot = InferInput<TWrapped>,
  TOutputRoot = InferOutput<TWrapped>,
  TIssue extends BaseIssue<unknown> = InferIssue<TWrapped>,
> extends MutualRecursiveSchema<
    TWrapped,
    ResolveRecursiveInput<InferInput<TWrapped>, TInputRoot>,
    ResolveRecursiveOutput<InferOutput<TWrapped>, TOutputRoot>,
    TIssue
  > {}

type RecursiveSchemas<TEntries extends Entries> = {
  [TName in keyof TEntries]: ResolvedRecursiveSchema<
    TEntries[TName],
    DefinitionInputs<TEntries>,
    DefinitionOutputs<TEntries>,
    InferIssue<TEntries[keyof TEntries]>
  >;
};

/**
 * Creates a map of mutually recursive schemas.
 *
 * @param build The callback that builds the schema entries. It runs once during construction.
 *
 * @returns A map of recursive schemas.
 */
export function mutualRecursive<
  const TEntries extends Record<string, GenericSchema>,
>(
  build: (ref: RefFactory) => TEntries & CheckReferences<TEntries>
): RecursiveSchemas<TEntries>;
export function mutualRecursive(build: (ref: RefFactory) => Entries): unknown {
  const owner = {
    async: false,
    reference: createRecursiveSchema,
    get definition(): Entries {
      return definitions;
    },
  } satisfies RecursiveOwner;
  const definitions = build(createRefFactory(owner));
  const seen = new Set<object>();
  const entries: Record<string, GenericSchema> = Object.create(null);
  for (const key of Object.keys(definitions)) {
    checkRecursiveReferences(definitions[key], owner, seen);
    entries[key] = createRecursiveSchema(definitions[key], owner);
  }
  return entries;
}

function createRecursiveSchema(
  root: GenericSchema,
  owner: RecursiveOwner
): MutualRecursiveSchema {
  return _standardSchema<MutualRecursiveSchema>({
    kind: 'schema',
    type: 'mutualRecursive',
    reference: createRecursiveSchema,
    expects: 'unknown',
    async: false,
    wrapped: root,
    '~run'(dataset, config) {
      const executionConfig: ConfigWithOwner = {
        ...config,
        [OwnerSymbol]: owner,
      };
      return root['~run'](dataset, executionConfig);
    },
  });
}

/**
 * Rejects references with a foreign owner or an unmatched definition name.
 *
 * @param value The schema.
 * @param owner The owner of the refs.
 * @param seen The schemas already visited.
 */
export function checkRecursiveReferences(
  value: unknown,
  owner: Pick<RecursiveOwner, 'definition'>,
  seen: Set<object> = new Set<object>()
): void {
  if (
    !value ||
    (typeof value !== 'object' && typeof value !== 'function') ||
    seen.has(value)
  ) {
    return;
  }
  seen.add(value);
  const schema = value as Record<string, unknown>;
  if (schema.kind === 'schema' || schema.kind === 'transformation') {
    if (schema.owner !== undefined && schema.owner !== owner) {
      throw Error('Recursive reference used outside its recursive schema');
    }
    if (schema.owner === owner) {
      const name = schema.name as string | undefined;
      if (name === undefined) {
        if (owner.definition.kind !== 'schema') {
          throw Error(
            'Recursive reference in a definitions object must be named'
          );
        }
      } else if (
        owner.definition.kind === 'schema' ||
        !Object.hasOwn(owner.definition, name)
      ) {
        throw Error(`Unmatched recursive reference: '${name}'`);
      }
    }
  }
  for (const key in schema) {
    if (
      key !== 'owner' &&
      key !== 'reference' &&
      key !== '~standard' &&
      key !== '~types' &&
      !(
        key === 'wrapped' &&
        [
          'recursive',
          'recursiveAsync',
          'mutualRecursive',
          'mutualRecursiveAsync',
        ].includes(schema.type as string)
      )
    ) {
      checkRecursiveReferences(schema[key], owner, seen);
    }
  }
}

/**
 * Recursive marker symbol.
 */
export declare const RecursiveMarkerSymbol: unique symbol;

/**
 * Recursive marker type.
 */
export interface RecursiveMarker<TKey extends string | undefined = undefined> {
  readonly [RecursiveMarkerSymbol]: TKey;
}

/**
 * Recursive reference interface.
 */
export interface Ref<TName extends string | undefined = undefined>
  extends BaseSchema<RecursiveMarker<TName>, RecursiveMarker<TName>, never> {
  /**
   * The schema type.
   */
  readonly type: 'ref';
  /**
   * The recursive schema that owns the reference.
   */
  readonly owner: RecursiveOwner;
  /**
   * The referenced definition name.
   */
  readonly name: TName;
}

/**
 * Async recursive reference interface.
 */
export interface RefAsync<TName extends string | undefined = undefined>
  extends BaseSchemaAsync<
    RecursiveMarker<TName>,
    RecursiveMarker<TName>,
    never
  > {
  /**
   * The schema type.
   */
  readonly type: 'refAsync';
  /**
   * The recursive schema that owns the reference.
   */
  readonly owner: RecursiveOwner;
  /**
   * The referenced definition name.
   */
  readonly name: TName;
}

/**
 * Factory for named synchronous recursive references.
 */
export type RefFactory = <const TName extends string = never>(
  name: TName
) => Ref<TName>;

/**
 * Factory for named async recursive references.
 */
export type RefFactoryAsync = <const TName extends string = never>(
  name: TName
) => RefAsync<TName>;

function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner & { readonly async: false },
  name?: TName
): Ref<TName>;
function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner & { readonly async: true },
  name?: TName
): RefAsync<TName>;
function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner,
  name?: TName
): Ref<TName> | RefAsync<TName>;
function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner,
  name?: TName
): Ref<TName> | RefAsync<TName> {
  function run(dataset: UnknownDataset, config: ConfigWithOwner) {
    if (config[OwnerSymbol] !== owner) {
      throw Error('Recursive reference used outside its recursive schema');
    }
    if (
      name !== undefined &&
      (owner.definition.kind === 'schema' ||
        !Object.hasOwn(owner.definition, name))
    ) {
      throw Error(`Unmatched recursive reference: '${name}'`);
    }
    const target =
      name === undefined
        ? (owner.definition as SyncOrAsyncSchema)
        : (owner.definition as Record<string, SyncOrAsyncSchema>)[name];
    return target['~run'](dataset, config);
  }

  // The marker describes a type-level reference, not the delegated runtime value.
  // The recursive resolver replaces it with the target schema's input and output.
  return _standardSchema({
    kind: 'schema' as const,
    type: owner.async ? ('refAsync' as const) : ('ref' as const),
    expects: 'unknown',
    owner,
    async: owner.async,
    reference: owner.reference,
    name,
    '~run': owner.async
      ? async (dataset: UnknownDataset, config: ConfigWithOwner) =>
          run(dataset, config)
      : run,
  } as Omit<Ref<TName> | RefAsync<TName>, '~standard'>);
}

/**
 * Creates a factory for named synchronous recursive references.
 *
 * @param owner The owner of the references.
 *
 * @returns A named reference factory.
 *
 * @internal
 */
export function createRefFactory(
  owner: RecursiveOwner & { readonly async: false }
): RefFactory;
export function createRefFactory(
  owner: RecursiveOwner & { readonly async: true }
): RefFactoryAsync;
export function createRefFactory(owner: RecursiveOwner) {
  return <const TName extends string = never>(name: TName) =>
    createRef(owner, name);
}
