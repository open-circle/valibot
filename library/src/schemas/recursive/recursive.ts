import type {
  BaseIssue,
  BaseSchema,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import { _getStandardProps } from '../../utils/index.ts';

/**
 * Recursive marker symbol.
 *
 * @internal
 */
export declare const RecursiveMarkerSymbol: unique symbol;

/**
 * Recursive marker type.
 *
 * @internal
 */
export type RecursiveMarker = typeof RecursiveMarkerSymbol;

/**
 * Recursive self schema interface.
 *
 * @internal
 */
export interface RecursiveSelfSchema
  extends BaseSchema<RecursiveMarker, RecursiveMarker, never> {
  /**
   * The schema type.
   */
  readonly type: 'recursive';
}

// Only resolve object shapes that contain the hidden recursive marker so
// inferred class and object instances stay structurally intact.
type ContainsRecursiveMarker<
  TValue,
  TSeen = never,
> = TValue extends RecursiveMarker
  ? true
  : [TValue] extends [TSeen]
    ? false
    : TValue extends
          | Map<infer TKey, infer TItem>
          | ReadonlyMap<infer TKey, infer TItem>
      ? ContainsRecursiveMarker<TKey | TItem, TSeen | TValue>
      : TValue extends Set<infer TItem> | ReadonlySet<infer TItem>
        ? ContainsRecursiveMarker<TItem, TSeen | TValue>
        : TValue extends Promise<infer TItem>
          ? ContainsRecursiveMarker<TItem, TSeen | TValue>
          : TValue extends readonly (infer TItem)[]
            ? ContainsRecursiveMarker<TItem, TSeen | TValue>
            : TValue extends object
              ? {
                  [TKey in keyof TValue]: ContainsRecursiveMarker<
                    TValue[TKey],
                    TSeen | TValue
                  >;
                }[keyof TValue]
              : false;

// Named interfaces keep recursive array output from collapsing into circular
// type aliases while preserving normal array behavior.
/* eslint-disable @typescript-eslint/no-empty-object-type -- These interfaces provide named recursive array indirection for TypeScript. */

interface RecursiveArray<TItem, TRoot>
  extends Array<ResolveRecursiveValue<TItem, TRoot>> {}

interface RecursiveReadonlyArray<TItem, TRoot>
  extends ReadonlyArray<ResolveRecursiveValue<TItem, TRoot>> {}

/* eslint-enable @typescript-eslint/no-empty-object-type */

type ResolveRecursiveArray<
  TValue extends readonly unknown[],
  TRoot,
> = number extends TValue['length']
  ? TValue extends
      | readonly [unknown, ...unknown[]]
      | readonly [...unknown[], unknown]
    ? {
        [TKey in keyof TValue]: ResolveRecursiveValue<TValue[TKey], TRoot>;
      }
    : TValue extends (infer TItem)[]
      ? RecursiveMarker extends TItem
        ? RecursiveArray<TItem, TRoot>
        : ResolveRecursiveValue<TItem, TRoot>[]
      : TValue extends readonly (infer TItem)[]
        ? RecursiveMarker extends TItem
          ? RecursiveReadonlyArray<TItem, TRoot>
          : readonly ResolveRecursiveValue<TItem, TRoot>[]
        : never
  : {
      [TKey in keyof TValue]: ResolveRecursiveValue<TValue[TKey], TRoot>;
    };

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

type ResolveRecursiveValue<TValue, TRoot> = TValue extends RecursiveMarker
  ? ResolveRecursiveValue<TRoot, TRoot>
  : true extends ContainsRecursiveMarker<TValue>
    ? ResolveRecursiveContainer<TValue, TRoot>
    : TValue;

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
 * Generic recursive schema interface.
 */
export interface GenericRecursiveSchema
  extends BaseSchema<unknown, unknown, BaseIssue<unknown>> {
  /**
   * The schema type.
   */
  readonly type: 'recursive';
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The schema getter.
   */
  readonly getter: (
    self: RecursiveSelfSchema
  ) => BaseSchema<unknown, unknown, BaseIssue<unknown>>;
}

/**
 * Recursive schema interface.
 */
export interface RecursiveSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
> extends BaseSchema<
    ResolveRecursiveInput<InferInput<TWrapped>>,
    ResolveRecursiveOutput<InferOutput<TWrapped>>,
    InferIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'recursive';
  /**
   * The schema reference.
   */
  readonly reference: typeof recursive;
  /**
   * The expected property.
   */
  readonly expects: 'unknown';
  /**
   * The schema getter.
   */
  readonly getter: (self: RecursiveSelfSchema) => TWrapped;
}

/**
 * Creates a recursive schema.
 *
 * @param getter The schema getter.
 *
 * @returns A recursive schema.
 */
// @__NO_SIDE_EFFECTS__
export function recursive<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(getter: (self: RecursiveSelfSchema) => TWrapped): RecursiveSchema<TWrapped> {
  return {
    kind: 'schema',
    type: 'recursive',
    reference: recursive,
    expects: 'unknown',
    async: false,
    getter,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      return this.getter(this as unknown as RecursiveSelfSchema)['~run'](
        dataset,
        config
      ) as OutputDataset<
        ResolveRecursiveOutput<InferOutput<TWrapped>>,
        InferIssue<TWrapped>
      >;
    },
  };
}
