import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { nonNullish } from './nonNullish.ts';
import type {
  InferNonNullishInput,
  InferNonNullishIssue,
  InferNonNullishOutput,
  NonNullishIssue,
} from './types.ts';

/**
 * Non nullish schema async interface.
 */
export interface NonNullishSchemaAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<NonNullishIssue> | undefined,
> extends BaseSchemaAsync<
    InferNonNullishInput<TWrapped>,
    InferNonNullishOutput<TWrapped>,
    NonNullishIssue | InferNonNullishIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'non_nullish';
  /**
   * The schema reference.
   */
  readonly reference: typeof nonNullish | typeof nonNullishAsync;
  /**
   * The expected property.
   */
  readonly expects: '(!null & !undefined)';
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a non nullish schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns A non nullish schema.
 */
export function nonNullishAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NonNullishSchemaAsync<TWrapped, undefined>;

/**
 * Creates a non nullish schema.
 *
 * @param wrapped The wrapped schema.
 * @param message The error message.
 *
 * @returns A non nullish schema.
 */
export function nonNullishAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<NonNullishIssue> | undefined,
>(
  wrapped: TWrapped,
  message: TMessage
): NonNullishSchemaAsync<TWrapped, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nonNullishAsync(
  wrapped:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<NonNullishIssue> | undefined
): NonNullishSchemaAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<NonNullishIssue> | undefined
> {
  return _standardSchema<
    NonNullishSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<NonNullishIssue> | undefined
    >
  >({
    kind: 'schema',
    type: 'non_nullish',
    reference: nonNullishAsync,
    expects: '(!null & !undefined)',
    async: true,
    wrapped,
    message,
    async '~run'(
      this: NonNullishSchemaAsync<
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<NonNullishIssue> | undefined
      >,
      dataset,
      config
    ) {
      // If value is not `null` and `undefined`, run wrapped schema
      if (!(dataset.value === null || dataset.value === undefined)) {
        // @ts-expect-error
        dataset = await this.wrapped['~run'](dataset, config);
      }

      // If value is `null` or `undefined`, add issue to dataset
      if (dataset.value === null || dataset.value === undefined) {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<unknown, BaseIssue<unknown>>;
    },
  });
}
