import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _joinExpects, _stringify } from '../../utils/index.ts';
import type { ValueInput } from '../types.ts';

/**
 * Values issue type.
 */
export interface ValuesIssue<
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
  readonly type: 'values';
  /**
   * The expected property.
   */
  readonly expected: string;
  /**
   * The required values.
   */
  readonly requirement: TRequirement;
}

/**
 * Values action type.
 */
export interface ValuesAction<
  TInput extends ValueInput,
  TRequirement extends readonly TInput[],
  TMessage extends ErrorMessage<ValuesIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, ValuesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'values';
  /**
   * The action reference.
   */
  readonly reference: typeof values;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The required values.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a values validation action.
 *
 * @param requirement The required values.
 *
 * @returns A values action.
 */
export function values<
  TInput extends ValueInput,
  const TRequirement extends readonly TInput[],
>(requirement: TRequirement): ValuesAction<TInput, TRequirement, undefined>;

/**
 * Creates a values validation action.
 *
 * @param requirement The required values.
 * @param message The error message.
 *
 * @returns A values action.
 */
export function values<
  TInput extends ValueInput,
  const TRequirement extends readonly TInput[],
  const TMessage extends
    | ErrorMessage<ValuesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): ValuesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function values(
  requirement: readonly ValueInput[],
  message?: ErrorMessage<ValuesIssue<ValueInput, readonly ValueInput[]>>
): ValuesAction<
  ValueInput,
  readonly ValueInput[],
  ErrorMessage<ValuesIssue<ValueInput, readonly ValueInput[]>> | undefined
> {
  return {
    kind: 'validation',
    type: 'values',
    reference: values,
    async: false,
    expects: `${_joinExpects(
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
        !this.requirement.some(
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
