import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _joinExpects, _stringify } from '../../utils/index.ts';
import type { ValueInput } from '../types.ts';

/**
 * Not values issue type.
 */
export interface NotValuesIssue<
  TInput extends ValueInput,
  TRequirement extends readonly TInput[],
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'not_values';
  /**
   * The expected property.
   */
  readonly expected: `!${string}`;
  /**
   * The not required values.
   */
  readonly requirement: TRequirement;
}

/**
 * Not values action type.
 */
export interface NotValuesAction<
  TInput extends ValueInput,
  TRequirement extends readonly TInput[],
  TMessage extends
    | ErrorMessage<NotValuesIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, NotValuesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'not_values';
  /**
   * The action reference.
   */
  readonly reference: typeof notValues;
  /**
   * The expected property.
   */
  readonly expects: `!${string}`;
  /**
   * The not required values.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not values validation action.
 *
 * @param requirement The not required values.
 *
 * @returns A not values action.
 */
export function notValues<
  TInput extends ValueInput,
  const TRequirement extends readonly TInput[],
>(requirement: TRequirement): NotValuesAction<TInput, TRequirement, undefined>;

/**
 * Creates a not values validation action.
 *
 * @param requirement The not required values.
 * @param message The error message.
 *
 * @returns A not values action.
 */
export function notValues<
  TInput extends ValueInput,
  const TRequirement extends readonly TInput[],
  const TMessage extends
    | ErrorMessage<NotValuesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotValuesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notValues(
  requirement: readonly ValueInput[],
  message?: ErrorMessage<NotValuesIssue<ValueInput, readonly ValueInput[]>>
): NotValuesAction<
  ValueInput,
  readonly ValueInput[],
  ErrorMessage<NotValuesIssue<ValueInput, readonly ValueInput[]>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_values',
    reference: notValues,
    async: false,
    expects: `!${_joinExpects(
      requirement.map((value) =>
        value instanceof Date ? value.toJSON() : _stringify(value)
      ),
      '|'
    )}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (
        dataset.typed &&
        this.requirement.some(
          (value) => value <= dataset.value && value >= dataset.value
        )
      ) {
        _addIssue(this, 'value', dataset, config, {
          received:
            dataset.value instanceof Date
              ? dataset.value.toJSON()
              : _stringify(dataset.value),
        });
      }
      return dataset;
    },
  };
}
