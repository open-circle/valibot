import type { Brand, readonly } from '../../actions/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  BaseTransformation,
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
 * Readonly action shape interface.
 *
 * Hint: This interface is structurally equivalent to `ReadonlyAction<any>`.
 * We use it instead of `ReadonlyAction<any>` because relating two
 * instantiations of `ReadonlyAction` forces TypeScript to measure the variance
 * of `ReadonlyAction`, which is expensive (see issue #1663).
 */
interface ReadonlyActionShape
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
 * With readonly type.
 */
type WithReadonly<
  TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TObject extends WithQuestionMarks<Record<string | number | symbol, unknown>>,
> =
  // NOTE: We use a structural `{ readonly pipe: readonly unknown[] }` check
  // plus indexed access instead of `SchemaWithPipe<infer TPipe>` because
  // `infer` forces TS to decompose the full `Omit + &` intersection of
  // `SchemaWithPipe`, which is expensive on large schemas (see issue #1374).
  TValue extends {
    readonly pipe: readonly unknown[];
  }
    ? ReadonlyActionShape extends TValue['pipe'][number]
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
