import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getDigitCount } from '../../utils/index.ts';

/**
 * Max digit chars issue interface.
 */
export interface MaxDigitCharsIssue<
  TInput extends string,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'max_digit_chars';
  /**
   * The expected property.
   */
  readonly expected: `<=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The maximum digit chars.
   */
  readonly requirement: TRequirement;
}

/**
 * Max digit chars action interface.
 */
export interface MaxDigitCharsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MaxDigitCharsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    MaxDigitCharsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'max_digit_chars';
  /**
   * The action reference.
   */
  readonly reference: typeof maxDigitChars;
  /**
   * The expected property.
   */
  readonly expects: `<=${TRequirement}`;
  /**
   * The maximum digit chars.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max digit chars validation action.
 *
 * @param requirement The maximum digit chars.
 *
 * @returns A max digit chars action.
 */
export function maxDigitChars<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): MaxDigitCharsAction<TInput, TRequirement, undefined>;

/**
 * Creates a max digit chars validation action.
 *
 * @param requirement The maximum digit chars.
 * @param message The error message.
 *
 * @returns A max digit chars action.
 */
export function maxDigitChars<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MaxDigitCharsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MaxDigitCharsAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function maxDigitChars(
  requirement: number,
  message?: ErrorMessage<MaxDigitCharsIssue<string, number>>
): MaxDigitCharsAction<
  string,
  number,
  ErrorMessage<MaxDigitCharsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_digit_chars',
    reference: maxDigitChars,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getDigitCount(dataset.value);
        if (count > this.requirement) {
          _addIssue(this, 'digits', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
