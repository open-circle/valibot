import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { nonNullable } from './nonNullable.ts';
import type {
  InferNonNullableInput,
  InferNonNullableIssue,
  InferNonNullableOutput,
  NonNullableIssue,
} from './types.ts';

/**
 * Non nullable schema async interface.
 */
export interface NonNullableSchemaAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<NonNullableIssue> | undefined,
> extends BaseSchemaAsync<
    InferNonNullableInput<TWrapped>,
    InferNonNullableOutput<TWrapped>,
    NonNullableIssue | InferNonNullableIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'non_nullable';
  /**
   * The schema reference.
   */
  readonly reference: typeof nonNullable | typeof nonNullableAsync;
  /**
   * The expected property.
   */
  readonly expects: '!null';
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
 * Creates a non nullable schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns A non nullable schema.
 */
export function nonNullableAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NonNullableSchemaAsync<TWrapped, undefined>;

/**
 * Creates a non nullable schema.
 *
 * @param wrapped The wrapped schema.
 * @param message The error message.
 *
 * @returns A non nullable schema.
 */
export function nonNullableAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<NonNullableIssue> | undefined,
>(
  wrapped: TWrapped,
  message: TMessage
): NonNullableSchemaAsync<TWrapped, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nonNullableAsync(
  wrapped:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<NonNullableIssue> | undefined
): NonNullableSchemaAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<NonNullableIssue> | undefined
> {
  return _standardSchema<
    NonNullableSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<NonNullableIssue> | undefined
    >
  >({
    kind: 'schema',
    type: 'non_nullable',
    reference: nonNullableAsync,
    expects: '!null',
    async: true,
    wrapped,
    message,
    async '~run'(
      this: NonNullableSchemaAsync<
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<NonNullableIssue> | undefined
      >,
      dataset,
      config
    ) {
      // If value is not `null`, run wrapped schema
      if (dataset.value !== null) {
        // @ts-expect-error
        dataset = await this.wrapped['~run'](dataset, config);
      }

      // If value is `null`, add issue to dataset
      if (dataset.value === null) {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<unknown, BaseIssue<unknown>>;
    },
  });
}
