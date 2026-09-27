import type { ReadonlyAction } from '../actions/index.ts';
import type {
  SchemaWithFallback,
  SchemaWithFallbackAsync,
} from '../methods/index.ts';
import type {
  ExactOptionalSchema,
  ExactOptionalSchemaAsync,
  NullishSchema,
  NullishSchemaAsync,
  OptionalSchema,
  OptionalSchemaAsync,
} from '../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from './infer.ts';
import type { BaseIssue } from './issue.ts';
import type { BaseSchema, BaseSchemaAsync } from './schema.ts';
import type { MarkOptional, MaybeReadonly, Prettify } from './utils.ts';

/**
 * Optional entry schema type.
 */
export type OptionalEntrySchema =
  | ExactOptionalSchema<
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >
  | NullishSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>
  | OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>;

/**
 * Optional entry schema async type.
 */
export type OptionalEntrySchemaAsync =
  | ExactOptionalSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >
  | NullishSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >
  | OptionalSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      unknown
    >;

/**
 * Object entries interface.
 */
export interface ObjectEntries {
  [key: string]:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | SchemaWithFallback<
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        unknown
      >
    | OptionalEntrySchema;
}

/**
 * Object entries async interface.
 */
export interface ObjectEntriesAsync {
  [key: string]:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
    | SchemaWithFallback<
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        unknown
      >
    | SchemaWithFallbackAsync<
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        unknown
      >
    | OptionalEntrySchema
    | OptionalEntrySchemaAsync;
}

/**
 * Object keys type.
 */
export type ObjectKeys<
  TSchema extends {
    readonly type:
      | 'loose_object'
      | 'object'
      | 'object_with_rest'
      | 'strict_object';
    readonly entries: ObjectEntries | ObjectEntriesAsync;
  },
> = MaybeReadonly<[keyof TSchema['entries'], ...(keyof TSchema['entries'])[]]>;

/**
 * Infer entries input type.
 */
type InferEntriesInput<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  -readonly [TKey in keyof TEntries]: InferInput<TEntries[TKey]>;
};

/**
 * Infer entries output type.
 */
type InferEntriesOutput<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  -readonly [TKey in keyof TEntries]: InferOutput<TEntries[TKey]>;
};

/**
 * Optional input keys type.
 */
type OptionalInputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  [TKey in keyof TEntries]: TEntries[TKey] extends
    | OptionalEntrySchema
    | OptionalEntrySchemaAsync
    ? TKey
    : never;
}[keyof TEntries];

/**
 * Optional output keys type.
 */
type OptionalOutputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  [TKey in keyof TEntries]: TEntries[TKey] extends
    | OptionalEntrySchema
    | OptionalEntrySchemaAsync
    ? undefined extends TEntries[TKey]['default']
      ? TKey
      : never
    : never;
}[keyof TEntries];

/**
 * Input with question marks type.
 */
type InputWithQuestionMarks<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
  TObject extends InferEntriesInput<TEntries>,
> = MarkOptional<TObject, OptionalInputKeys<TEntries>>;

/**
 * Output with question marks type.
 */
type OutputWithQuestionMarks<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
  TObject extends InferEntriesOutput<TEntries>,
> = MarkOptional<TObject, OptionalOutputKeys<TEntries>>;

/**
 * Readonly output keys type.
 */

type ReadonlyOutputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  // NOTE: We use a structural `{ readonly pipe: readonly unknown[] }` check
  // plus indexed access instead of `SchemaWithPipe<infer TPipe>` because
  // `infer` forces TS to decompose the full `Omit + &` intersection of
  // `SchemaWithPipe` for every entry, which dominates check time on large
  // schemas (see issue #1374).
  [TKey in keyof TEntries]: TEntries[TKey] extends {
    readonly pipe: readonly unknown[];
  }
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ReadonlyAction<any> extends TEntries[TKey]['pipe'][number]
      ? TKey
      : never
    : never;
}[keyof TEntries];

/**
 * Output with readonly type.
 */
type OutputWithReadonly<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
  TObject extends OutputWithQuestionMarks<
    TEntries,
    InferEntriesOutput<TEntries>
  >,
> =
  // NOTE: We short-circuit to `TObject` when no entry has a `ReadonlyAction`
  // to avoid building the `Readonly<T> & Pick<T, ...>` intersection in the
  // common case (see issue #1374).
  ReadonlyOutputKeys<TEntries> extends never
    ? TObject
    : Readonly<TObject> &
        Pick<TObject, Exclude<keyof TObject, ReadonlyOutputKeys<TEntries>>>;

/**
 * Infer object input type.
 */
export type InferObjectInput<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
> = Prettify<InputWithQuestionMarks<TEntries, InferEntriesInput<TEntries>>>;

/**
 * Infer object output type.
 */
export type InferObjectOutput<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
> = Prettify<
  OutputWithReadonly<
    TEntries,
    OutputWithQuestionMarks<TEntries, InferEntriesOutput<TEntries>>
  >
>;

/**
 * Infer object issue type.
 */
export type InferObjectIssue<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
> = InferIssue<TEntries[keyof TEntries]>;
