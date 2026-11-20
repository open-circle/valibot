import type { Config } from './config.ts';
import type { InferInput } from './infer.ts';
import type { ObjectEntries, ObjectEntriesAsync } from './object.ts';
import type { BaseSchema, BaseSchemaAsync } from './schema.ts';
import type { TupleItems, TupleItemsAsync } from './tuple.ts';
import type { MaybePromise, MaybeReadonly } from './utils.ts';

/**
 * Array path item interface.
 */
export interface ArrayPathItem {
  /**
   * The path item type.
   */
  readonly type: 'array';
  /**
   * The path item origin.
   */
  readonly origin: 'value';
  /**
   * The path item input.
   */
  readonly input: MaybeReadonly<unknown[]>;
  /**
   * The path item key.
   */
  readonly key: number;
  /**
   * The path item value.
   */
  readonly value: unknown;
}

/**
 * Map path item interface.
 */
export interface MapPathItem {
  /**
   * The path item type.
   */
  readonly type: 'map';
  /**
   * The path item origin.
   */
  readonly origin: 'key' | 'value';
  /**
   * The path item input.
   */
  readonly input: Map<unknown, unknown>;
  /**
   * The path item key.
   */
  readonly key: unknown;
  /**
   * The path item value.
   */
  readonly value: unknown;
}

/**
 * Object path item interface.
 */
export interface ObjectPathItem {
  /**
   * The path item type.
   */
  readonly type: 'object';
  /**
   * The path item origin.
   */
  readonly origin: 'key' | 'value';
  /**
   * The path item input.
   */
  readonly input: Record<string, unknown>;
  /**
   * The path item key.
   */
  readonly key: string;
  /**
   * The path item value.
   */
  readonly value: unknown;
}

/**
 * Set path item interface.
 */
export interface SetPathItem {
  /**
   * The path item type.
   */
  readonly type: 'set';
  /**
   * The path item origin.
   */
  readonly origin: 'value';
  /**
   * The path item input.
   */
  readonly input: Set<unknown>;
  /**
   * The path item key.
   */
  readonly key: null;
  /**
   * The path item key.
   */
  readonly value: unknown;
}

/**
 * Unknown path item interface.
 */
export interface UnknownPathItem {
  /**
   * The path item type.
   */
  readonly type: 'unknown';
  /**
   * The path item origin.
   */
  readonly origin: 'key' | 'value';
  /**
   * The path item input.
   */
  readonly input: unknown;
  /**
   * The path item key.
   */
  readonly key: unknown;
  /**
   * The path item value.
   */
  readonly value: unknown;
}

/**
 * Issue path item type.
 */
export type IssuePathItem =
  | ArrayPathItem
  | MapPathItem
  | ObjectPathItem
  | SetPathItem
  | UnknownPathItem;

/**
 * Base issue interface.
 */
export interface BaseIssue<TInput> extends Config<BaseIssue<TInput>> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema' | 'validation' | 'transformation';
  /**
   * The issue type.
   */
  readonly type: string;
  /**
   * The raw input data.
   */
  readonly input: TInput;
  /**
   * The expected property.
   */
  readonly expected: string | null;
  /**
   * The received property.
   */
  readonly received: string;
  /**
   * The error message.
   */
  readonly message: string;
  /**
   * The input requirement.
   */
  readonly requirement?: unknown | undefined;
  /**
   * The issue path.
   */
  readonly path?: [IssuePathItem, ...IssuePathItem[]] | undefined;
  /**
   * The sub issues.
   */
  readonly issues?: [BaseIssue<TInput>, ...BaseIssue<TInput>[]] | undefined;
}

/**
 * Generic issue type.
 */
export type GenericIssue<TInput = unknown> = BaseIssue<TInput>;

/**
 * Any schema type.
 */
type AnySchema =
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>;

/**
 * Dot path type.
 */
type DotPath<
  TKey extends string | number | symbol,
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TKey extends string | number
  ? `${TKey}` | `${TKey}.${IssueDotPath<TSchema>}`
  : never;

/**
 * Object path type.
 */
type ObjectPath<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  [TKey in keyof TEntries]: DotPath<TKey, TEntries[TKey]>;
}[keyof TEntries];

/**
 * Tuple keys type.
 */
type TupleKeys<TItems extends TupleItems | TupleItemsAsync> = Exclude<
  keyof TItems,
  keyof []
>;

/**
 * Tuple path type.
 */
type TuplePath<TItems extends TupleItems | TupleItemsAsync> = {
  [TKey in TupleKeys<TItems>]: TItems[TKey] extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    ? DotPath<TKey, TItems[TKey]>
    : never;
}[TupleKeys<TItems>];

/**
 * Issue dot path type.
 */
export type IssueDotPath<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> =
  // Pipe
  TSchema extends {
    readonly pipe: readonly [infer TFirst extends AnySchema, ...unknown[]];
  }
    ? IssueDotPath<TFirst>
    : // Array
      TSchema extends {
          readonly type: 'array';
          readonly item: infer TItem extends AnySchema;
        }
      ? DotPath<number, TItem>
      : // Intersect, Union or Variant
        TSchema extends {
            readonly type: 'intersect' | 'union' | 'variant';
            readonly options: infer TOptions extends readonly AnySchema[];
          }
        ? IssueDotPath<TOptions[number]>
        : // Map or Record
          TSchema extends {
              readonly type: 'map' | 'record';
              readonly key: infer TKey extends AnySchema;
              readonly value: infer TValue extends AnySchema;
            }
          ? DotPath<Extract<InferInput<TKey>, PropertyKey>, TValue>
          : // Object
            TSchema extends {
                readonly type: 'loose_object' | 'object' | 'strict_object';
                readonly entries: infer TEntries extends
                  | ObjectEntries
                  | ObjectEntriesAsync;
              }
            ? ObjectPath<TEntries>
            : // Object with Rest
              TSchema extends { readonly type: 'object_with_rest' }
              ? string
              : // Tuple
                TSchema extends {
                    readonly type: 'loose_tuple' | 'strict_tuple' | 'tuple';
                    readonly items: infer TItems extends
                      | TupleItems
                      | TupleItemsAsync;
                  }
                ? TuplePath<TItems>
                : // Tuple with Rest
                  TSchema extends {
                      readonly type: 'tuple_with_rest';
                      readonly items: infer TItems extends
                        | TupleItems
                        | TupleItemsAsync;
                      readonly rest: infer TRest extends AnySchema;
                    }
                  ? TuplePath<TItems> | DotPath<number, TRest>
                  : // Wrapped
                    TSchema extends {
                        readonly type:
                          | 'exact_optional'
                          | 'non_nullable'
                          | 'non_nullish'
                          | 'non_optional'
                          | 'nullable'
                          | 'nullish'
                          | 'optional'
                          | 'undefinedable';
                        readonly wrapped: infer TWrapped extends AnySchema;
                      }
                    ? IssueDotPath<TWrapped>
                    : // Lazy
                      TSchema extends {
                          readonly type: 'lazy';
                          readonly getter: (
                            input: unknown
                          ) => MaybePromise<infer TWrapped extends AnySchema>;
                        }
                      ? IssueDotPath<TWrapped>
                      : // Otherwise
                        never;
