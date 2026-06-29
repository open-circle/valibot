import type { SchemaMapperHKT } from '../../methods/mapEntries/mapEntries.ts';
import type {
  BaseHKTable,
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _getStandardProps } from '../../utils/index.ts';
import type {
  InferNonNullableInput,
  InferNonNullableIssue,
  InferNonNullableOutput,
  NonNullableIssue,
} from './types.ts';

export interface NonNullableModifierHKT extends SchemaMapperHKT {
  result: NonNullableSchema<this['wrapped'], undefined>;
}

/**
 * Non nullable schema interface.
 */
export interface NonNullableSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<NonNullableIssue> | undefined,
> extends BaseSchema<
      InferNonNullableInput<TWrapped>,
      InferNonNullableOutput<TWrapped>,
      NonNullableIssue | InferNonNullableIssue<TWrapped>
    >,
    BaseHKTable<NonNullableModifierHKT> {
  /**
   * The schema type.
   */
  readonly type: 'non_nullable';
  /**
   * The schema reference.
   */
  readonly reference: typeof nonNullable;
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
export function nonNullable<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NonNullableSchema<TWrapped, undefined>;

/**
 * Creates a non nullable schema.
 *
 * @param wrapped The wrapped schema.
 * @param message The error message.
 *
 * @returns A non nullable schema.
 */
export function nonNullable<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<NonNullableIssue> | undefined,
>(wrapped: TWrapped, message: TMessage): NonNullableSchema<TWrapped, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nonNullable(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<NonNullableIssue> | undefined
): NonNullableSchema<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<NonNullableIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'non_nullable',
    reference: nonNullable,
    expects: '!null',
    async: false,
    wrapped,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // If value is not `null`, run wrapped schema
      if (dataset.value !== null) {
        // @ts-expect-error
        dataset = this.wrapped['~run'](dataset, config);
      }

      // If value is `null`, add issue to dataset
      if (dataset.value === null) {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<unknown, BaseIssue<unknown>>;
    },
    '~preferHkt': true,
  };
}
