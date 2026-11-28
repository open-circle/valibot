import type { readonly } from '../actions/index.ts';
import type {
  ExactOptionalSchema,
  ExactOptionalSchemaAsync,
  LooseObjectIssue,
  LooseObjectSchema,
  LooseObjectSchemaAsync,
  NullishSchema,
  NullishSchemaAsync,
  ObjectIssue,
  ObjectSchema,
  ObjectSchemaAsync,
  ObjectWithRestIssue,
  ObjectWithRestSchema,
  ObjectWithRestSchemaAsync,
  OptionalSchema,
  OptionalSchemaAsync,
  StrictObjectIssue,
  StrictObjectSchema,
  StrictObjectSchemaAsync,
} from '../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from './infer.ts';
import type { BaseIssue } from './issue.ts';
import type { ErrorMessage } from './other.ts';
import type { BaseSchema, BaseSchemaAsync } from './schema.ts';
import type { BaseTransformation } from './transformation.ts';
import type { MarkOptional, MaybeReadonly, Prettify } from './utils.ts';

/**
 * Optional entry schema type.
 *
 * @deprecated This type is no longer used and will be removed in the next
 * major version.
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
 *
 * @deprecated This type is no longer used and will be removed in the next
 * major version.
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
 *
 * Hint: Any schema can be used as an entry. Entries wrapped with `optional`,
 * `exactOptional` or `nullish` make their key optional, and the fallback of
 * an entry created with `fallback` is used if its key is missing.
 */
export interface ObjectEntries {
  [key: string]: BaseSchema<unknown, unknown, BaseIssue<unknown>>;
}

/**
 * Object entries async interface.
 *
 * Hint: Any sync or async schema can be used as an entry. Entries wrapped
 * with `optional`, `exactOptional`, `nullish` or their async counterparts make
 * their key optional, and the fallback of an entry created with `fallback` or
 * `fallbackAsync` is used if its key is missing.
 */
export interface ObjectEntriesAsync {
  [key: string]:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>;
}

/**
 * Object keys type.
 */
export type ObjectKeys<
  TSchema extends
    | LooseObjectSchema<
        ObjectEntries,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | LooseObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<LooseObjectIssue> | undefined
      >
    | ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
    | ObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<ObjectIssue> | undefined
      >
    | ObjectWithRestSchema<
        ObjectEntries,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | ObjectWithRestSchemaAsync<
        ObjectEntriesAsync,
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<ObjectWithRestIssue> | undefined
      >
    | StrictObjectSchema<
        ObjectEntries,
        ErrorMessage<StrictObjectIssue> | undefined
      >
    | StrictObjectSchemaAsync<
        ObjectEntriesAsync,
        ErrorMessage<StrictObjectIssue> | undefined
      >,
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
 * Optional entry shape interface.
 */
interface OptionalEntryShape {
  readonly type: 'exact_optional' | 'nullish' | 'optional';
  readonly default: unknown;
}

/**
 * Optional input keys type.
 */
type OptionalInputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  // NOTE: We use a structural check instead of `OptionalEntrySchema` because
  // relating an entry to an instantiation of `OptionalSchema` forces TS to
  // measure the variance of `OptionalSchema`, which is expensive (see issue
  // #1663).
  [TKey in keyof TEntries]: TEntries[TKey] extends OptionalEntryShape
    ? TKey
    : never;
}[keyof TEntries];

/**
 * Optional output keys type.
 */
type OptionalOutputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
  // NOTE: We use a structural check instead of `OptionalEntrySchema` because
  // relating an entry to an instantiation of `OptionalSchema` forces TS to
  // measure the variance of `OptionalSchema`, which is expensive (see issue
  // #1663).
  [TKey in keyof TEntries]: TEntries[TKey] extends OptionalEntryShape
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
> =
  // NOTE: We short-circuit to `TObject` when no entry is optional to avoid
  // building the `Omit`, `Pick` and `Partial` types of `MarkOptional` in the
  // common case (see issue #1663).
  [OptionalInputKeys<TEntries>] extends [never]
    ? TObject
    : MarkOptional<TObject, OptionalInputKeys<TEntries>>;

/**
 * Output with question marks type.
 */
type OutputWithQuestionMarks<
  TEntries extends ObjectEntries | ObjectEntriesAsync,
  TObject extends InferEntriesOutput<TEntries>,
> =
  // NOTE: We short-circuit to `TObject` when no entry is optional to avoid
  // building the `Omit`, `Pick` and `Partial` types of `MarkOptional` in the
  // common case (see issue #1663).
  [OptionalOutputKeys<TEntries>] extends [never]
    ? TObject
    : MarkOptional<TObject, OptionalOutputKeys<TEntries>>;

/**
 * Readonly action shape interface.
 *
 * Hint: This interface is structurally equivalent to `ReadonlyAction<any>`.
 * We use it instead of `ReadonlyAction<any>` because relating two
 * instantiations of `ReadonlyAction` forces TypeScript to measure the variance
 * of `ReadonlyAction`, which is expensive (see issue #1663).
 */
export interface ReadonlyActionShape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends BaseTransformation<any, any, never> {
  /**
   * The action type.
   */
  readonly type: 'readonly';
  /**
   * The action reference.
   */
  readonly reference: typeof readonly;
}

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
    ? ReadonlyActionShape extends TEntries[TKey]['pipe'][number]
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
