import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { LengthInput } from '../types.ts';

/**
 * Max length issue interface.
 */
export interface MaxLengthIssue<
  TInput extends LengthInput,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'max_length';
  /**
   * The expected property.
   */
  readonly expected: `<=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The maximum length.
   */
  readonly requirement: TRequirement;
}

/**
 * Max length action interface.
 */
export interface MaxLengthAction<
  TInput extends LengthInput,
  TRequirement extends number,
  TMessage extends
    ErrorMessage<MaxLengthIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MaxLengthIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'max_length';
  /**
   * The action reference.
   */
  readonly reference: typeof maxLength;
  /**
   * The expected property.
   */
  readonly expects: `<=${TRequirement}`;
  /**
   * The maximum length.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max length validation action.
 *
 * @param requirement The maximum length.
 *
 * @returns A max length action.
 */
export function maxLength<
  TInput extends LengthInput,
  const TRequirement extends number,
>(requirement: TRequirement): MaxLengthAction<TInput, TRequirement, undefined>;

/**
 * Creates a max length validation action.
 *
 * @param requirement The maximum length.
 * @param message The error message.
 *
 * @returns A max length action.
 */
export function maxLength<
  TInput extends LengthInput,
  const TRequirement extends number,
  const TMessage extends
    ErrorMessage<MaxLengthIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MaxLengthAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function maxLength(
  requirement: number,
  message?: ErrorMessage<MaxLengthIssue<LengthInput, number>>
): MaxLengthAction<
  LengthInput,
  number,
  ErrorMessage<MaxLengthIssue<LengthInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_length',
    reference: maxLength,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.length > this.requirement) {
        _addIssue(this, 'length', dataset, config, {
          received: `${dataset.value.length}`,
        });
      }
      return dataset;
    },
  };
}
