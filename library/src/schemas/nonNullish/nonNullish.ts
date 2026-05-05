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
  InferNonNullishInput,
  InferNonNullishIssue,
  InferNonNullishOutput,
  NonNullishIssue,
} from './types.ts';

export interface NonNullishModifierHKT extends SchemaMapperHKT {
  result: NonNullishSchema<this['wrapped'], undefined>;
}

/**
 * Non nullish schema interface.
 */
export interface NonNullishSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<NonNullishIssue> | undefined,
> extends BaseSchema<
      InferNonNullishInput<TWrapped>,
      InferNonNullishOutput<TWrapped>,
      NonNullishIssue | InferNonNullishIssue<TWrapped>
    >,
    BaseHKTable<NonNullishModifierHKT> {
  /**
   * The schema type.
   */
  readonly type: 'non_nullish';
  /**
   * The schema reference.
   */
  readonly reference: typeof nonNullish;
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
export function nonNullish<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NonNullishSchema<TWrapped, undefined>;

/**
 * Creates a non nullish schema.
 *
 * @param wrapped The wrapped schema.
 * @param message The error message.
 *
 * @returns A non nullish schema.
 */
export function nonNullish<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<NonNullishIssue> | undefined,
>(wrapped: TWrapped, message: TMessage): NonNullishSchema<TWrapped, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nonNullish(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<NonNullishIssue> | undefined
): NonNullishSchema<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<NonNullishIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'non_nullish',
    reference: nonNullish,
    expects: '(!null & !undefined)',
    async: false,
    wrapped,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // If value is not `null` and `undefined`, run wrapped schema
      if (!(dataset.value === null || dataset.value === undefined)) {
        // @ts-expect-error
        dataset = this.wrapped['~run'](dataset, config);
      }

      // If value is `null` or `undefined`, add issue to dataset
      if (dataset.value === null || dataset.value === undefined) {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<unknown, BaseIssue<unknown>>;
    },
    '~preferHkt': true,
  };
}
