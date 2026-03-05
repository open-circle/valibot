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
  InferNonOptionalInput,
  InferNonOptionalIssue,
  InferNonOptionalOutput,
  NonOptionalIssue,
} from './types.ts';

export interface NonOptionalModifierHKT extends SchemaMapperHKT {
  result: NonOptionalSchema<this['wrapped'], undefined>;
}

/**
 * Non optional schema interface.
 */
export interface NonOptionalSchema<
  TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> extends BaseSchema<
      InferNonOptionalInput<TWrapped>,
      InferNonOptionalOutput<TWrapped>,
      NonOptionalIssue | InferNonOptionalIssue<TWrapped>
    >,
    BaseHKTable<NonOptionalModifierHKT> {
  /**
   * The schema type.
   */
  readonly type: 'non_optional';
  /**
   * The schema reference.
   */
  readonly reference: typeof nonOptional;
  /**
   * The expected property.
   */
  readonly expects: '!undefined';
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
 * Creates a non optional schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns A non optional schema.
 */
export function nonOptional<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NonOptionalSchema<TWrapped, undefined>;

/**
 * Creates a non optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param message The error message.
 *
 * @returns A non optional schema.
 */
export function nonOptional<
  const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(wrapped: TWrapped, message: TMessage): NonOptionalSchema<TWrapped, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nonOptional(
  wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<NonOptionalIssue> | undefined
): NonOptionalSchema<
  BaseSchema<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<NonOptionalIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'non_optional',
    reference: nonOptional,
    expects: '!undefined',
    async: false,
    wrapped,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // If value is not `undefined`, run wrapped schema
      if (dataset.value !== undefined) {
        // @ts-expect-error
        dataset = this.wrapped['~run'](dataset, config);
      }

      // If value is `undefined`, add issue to dataset
      if (dataset.value === undefined) {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<unknown, BaseIssue<unknown>>;
    },
    '~preferHkt': true,
  };
}
