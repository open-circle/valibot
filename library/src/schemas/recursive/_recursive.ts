import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  Config,
  GenericConstraintError,
  Generics,
  GenericSchema,
  GenericSchemaAsync,
  IsAny,
  UnknownDataset,
} from '../../types/index.ts';
import { _standardSchema } from '../../utils/_standardSchema/index.ts';
import type { MutualRecursiveSchema } from '../mutualRecursive/mutualRecursive.ts';
import type { MutualRecursiveSchemaAsync } from '../mutualRecursive/mutualRecursiveAsync.ts';
import type { RecursiveSchema } from './recursive.ts';
import type { RecursiveSchemaAsync } from './recursiveAsync.ts';

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

// Extract arguments and names of matching registered generics
type RegisteredGeneric<TValue> = {
  [TName in keyof Generics<TValue, never>]: Generics<
    TValue,
    never
  >[TName] extends {
    readonly getArgs: infer TArgs extends readonly unknown[];
  }
    ? [TArgs] extends [never]
      ? never
      : { readonly name: TName; readonly args: TArgs }
    : never;
}[keyof Generics<TValue, never>];

// Reconstruct registered generics with resolved arguments
type ResolveRegisteredGeneric<
  TValue,
  TRoot,
  TGeneric = RegisteredGeneric<TValue>,
> = TGeneric extends {
  readonly name: infer TName extends keyof Generics<TValue, never>;
  readonly args: infer TArgs extends readonly unknown[];
}
  ? Generics<TValue, ResolveRecursiveTuple<TArgs, TRoot>>[TName] extends {
      readonly applyArgs: infer TOutput;
    }
    ? [TOutput] extends [never]
      ? GenericConstraintError<{
          generic: TName;
          received: ResolveRecursiveTuple<TArgs, TRoot>;
        }>
      : TOutput
    : never
  : never;

// Preserve built-in container handling before registered generics and objects
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
              : [RegisteredGeneric<TValue>] extends [never]
                ? TValue extends (...args: infer TArgs) => infer TReturn
                  ? (...args: TArgs) => ResolveRecursiveValue<TReturn, TRoot>
                  : TValue extends object
                    ? {
                        [TKey in keyof TValue]: ResolveRecursiveValue<
                          TValue[TKey],
                          TRoot
                        >;
                      }
                    : TValue
                : ResolveRegisteredGeneric<TValue, TRoot>;

type MergeReference<TValue, TExtra> = TValue extends object
  ? {
      [TKey in keyof (TValue & TExtra)]: (TValue & TExtra)[TKey];
    }
  : TValue & TExtra;

type ResolveRecursiveReference<TValue, TRoot, TTarget> =
  Exclude<keyof TValue, typeof RecursiveMarkerSymbol> extends never
    ? ResolveRecursiveValue<TTarget, TRoot>
    : MergeReference<
        ResolveRecursiveValue<TTarget, TRoot>,
        ResolveRecursiveContainer<
          Omit<TValue, typeof RecursiveMarkerSymbol>,
          TRoot
        >
      >;

type ResolveRecursiveValue<TValue, TRoot> =
  IsAny<TValue> extends true
    ? TValue
    : TValue extends RecursiveMarker<infer TKey>
      ? TKey extends undefined
        ? ResolveRecursiveReference<TValue, TRoot, TRoot>
        : TKey extends keyof TRoot
          ? ResolveRecursiveReference<TValue, TRoot, TRoot[TKey]>
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

type SyncOrAsyncSchema = GenericSchema | GenericSchemaAsync;

type Equal<A, B> = B extends unknown
  ? [A] extends [B]
    ? [B] extends [A]
      ? true
      : false
    : false
  : never;

/**
 * Collects recursive references from a value.
 */
export type RecursiveReferences<TValue, TSeen = never> =
  IsAny<TValue> extends true
    ? never
    : TValue extends RecursiveMarker<string | undefined>
      ?
          | TValue
          | RecursiveReferences<
              Omit<TValue, typeof RecursiveMarkerSymbol>,
              TSeen
            >
      : true extends Equal<TValue, TSeen>
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
              : [RegisteredGeneric<TValue>] extends [never]
                ? TValue extends (...args: never[]) => infer TReturn
                  ? RecursiveReferences<TReturn, TSeen | TValue>
                  : TValue extends object
                    ? {
                        [TKey in keyof TValue]-?: RecursiveReferences<
                          TValue[TKey],
                          TSeen | TValue
                        >;
                      }[keyof TValue]
                    : never
                : RegisteredGeneric<TValue> extends {
                      readonly args: infer TArgs extends readonly unknown[];
                    }
                  ? RecursiveReferences<TArgs[number], TSeen | TValue>
                  : never;

/**
 * The recursive owner currently running.
 *
 * @internal
 */
export const OwnerSymbol: unique symbol = Symbol('recursive owner');

/**
 * Recursive schema brand.
 *
 * @internal
 */
const RecursiveSchemaSymbol: unique symbol = Symbol('recursive schema');

/**
 * Recursive reference brand.
 *
 * @internal
 */
const RefSymbol: unique symbol = Symbol('recursive reference');

type AnyRecursiveSchema =
  | RecursiveSchema
  | RecursiveSchemaAsync
  | MutualRecursiveSchema
  | MutualRecursiveSchemaAsync;

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
  readonly reference: AnyRecursiveSchema['reference'];
}

/**
 * Creates an owner-bound recursive schema wrapper.
 *
 * @param wrapped The wrapped schema.
 * @param owner The recursive owner.
 * @param type The schema type.
 * @param reference The schema factory.
 *
 * @returns A recursive schema wrapper.
 *
 * @internal
 */
export function createRecursiveSchema<
  TSchema extends Omit<SyncOrAsyncSchema, 'reference'> & {
    readonly wrapped: SyncOrAsyncSchema;
  },
>(
  wrapped: TSchema['wrapped'],
  owner: RecursiveOwner & { readonly async: TSchema['async'] },
  type: TSchema['type'],
  reference: AnyRecursiveSchema['reference']
): TSchema;
export function createRecursiveSchema(
  wrapped: SyncOrAsyncSchema,
  owner: RecursiveOwner,
  type: AnyRecursiveSchema['type'],
  reference: AnyRecursiveSchema['reference']
): unknown {
  const withOwner = (config: ConfigWithOwner): ConfigWithOwner => ({
    ...config,
    [OwnerSymbol]: owner,
  });
  const run = (dataset: UnknownDataset, config: ConfigWithOwner) =>
    wrapped['~run'](dataset, withOwner(config));

  return _standardSchema<AnyRecursiveSchema>({
    [RecursiveSchemaSymbol]: true,
    kind: 'schema',
    type,
    reference,
    expects: 'unknown',
    async: owner.async,
    wrapped,
    // @ts-expect-error TypeScript cannot correlate owner.async with the wrapped schema's return type.
    '~run': owner.async
      ? async (dataset: UnknownDataset, config: ConfigWithOwner) =>
          run(dataset, config)
      : run,
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
  const object = value as Record<string, unknown>;
  if (RefSymbol in object) {
    if (object.owner !== undefined && object.owner !== owner) {
      throw Error('Recursive reference used outside its recursive schema');
    }
    if (object.owner === owner) {
      const name = object.name as string | undefined;
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
  for (const key in object) {
    if (key !== 'wrapped' || !(RecursiveSchemaSymbol in object)) {
      checkRecursiveReferences(object[key], owner, seen);
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
 * Creates a reference to a recursive owner's schema.
 *
 * @param owner The owner of the reference.
 * @param name The definition name, for mutual recursion.
 *
 * @returns A recursive reference.
 *
 * @internal
 */
export function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner & { readonly async: false },
  name?: TName
): Ref<TName>;
export function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner & { readonly async: true },
  name?: TName
): RefAsync<TName>;
export function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner,
  name?: TName
): Ref<TName> | RefAsync<TName>;
export function createRef<TName extends string | undefined = undefined>(
  owner: RecursiveOwner,
  name?: TName
): Ref<TName> | RefAsync<TName> {
  /**
   * Runs the referenced schema after checking its owner and definition name.
   *
   * @param dataset The input dataset.
   * @param config The parsing configuration.
   *
   * @returns The output dataset or a promise of it.
   */
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
    [RefSymbol]: true,
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
