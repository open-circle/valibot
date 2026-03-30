import type { Brand, ReadonlyAction } from '../../actions/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferInput,
  InferOutput,
  MarkOptional,
  Prettify,
} from '../../types/index.ts';

/**
 * Record issue interface.
 */
export interface RecordIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'record';
  /**
   * The expected property.
   */
  readonly expected: 'Object';
}

/**
 * Is literal type.
 */
type IsLiteral<TKey extends string | number | symbol> = string extends TKey
  ? false
  : number extends TKey
    ? false
    : symbol extends TKey
      ? false
      : TKey extends Brand<string | number | symbol>
        ? false
        : true;

/**
 * Optional keys type.
 */
type OptionalKeys<TObject extends Record<string | number | symbol, unknown>> = {
  [TKey in keyof TObject]: IsLiteral<TKey> extends true ? TKey : never;
}[keyof TObject];

/**
 * With question marks type.
 *
 * Hint: We mark an entry as optional if we detect that its key is a literal
 * type. The reason for this is that it is not technically possible to detect
 * missing literal keys without restricting the key schema to `string`, `enum`
 * and `picklist`. However, if `enum` and `picklist` are used, it is better to
 * use `object` with `entriesFromList` because it already covers the needed
 * functionality. This decision also reduces the bundle size of `record`,
 * because it only needs to check the entries of the input and not any missing
 * keys.
 */
type WithQuestionMarks<
  TObject extends Record<string | number | symbol, unknown>,
> = MarkOptional<TObject, OptionalKeys<TObject>>;

/**
 * With readonly type.
 */
type WithReadonly<
  TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TObject extends WithQuestionMarks<Record<string | number | symbol, unknown>>,
> = TValue extends {
  readonly pipe: readonly unknown[];
}
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReadonlyAction<any> extends TValue['pipe'][number]
    ? Readonly<TObject>
    : TObject
  : TObject;

/**
 * Infer record input type.
 */
export type InferRecordInput<
  TKey extends
    | BaseSchema<string, string | number | symbol, BaseIssue<unknown>>
    | BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
  TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = Prettify<WithQuestionMarks<Record<InferInput<TKey>, InferInput<TValue>>>>;

/**
 * Infer record output type.
 */
export type InferRecordOutput<
  TKey extends
    | BaseSchema<string, string | number | symbol, BaseIssue<unknown>>
    | BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
  TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = Prettify<
  WithReadonly<
    TValue,
    WithQuestionMarks<Record<InferOutput<TKey>, InferOutput<TValue>>>
  >
>;
