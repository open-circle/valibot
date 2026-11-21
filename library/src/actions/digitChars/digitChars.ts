import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getDigitCount } from '../../utils/index.ts';

/**
 * Digit chars issue interface.
 */
export interface DigitCharsIssue<
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
  readonly type: 'digit_chars';
  /**
   * The expected property.
   */
  readonly expected: `${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The required digit chars.
   */
  readonly requirement: TRequirement;
}

/**
 * Digit chars action interface.
 */
export interface DigitCharsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<DigitCharsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    DigitCharsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'digit_chars';
  /**
   * The action reference.
   */
  readonly reference: typeof digitChars;
  /**
   * The expected property.
   */
  readonly expects: `${TRequirement}`;
  /**
   * The required digit chars.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a digit chars validation action.
 *
 * @param requirement The required digit chars.
 *
 * @returns A digit chars action.
 */
export function digitChars<
  TInput extends string,
  const TRequirement extends number,
>(requirement: TRequirement): DigitCharsAction<TInput, TRequirement, undefined>;

/**
 * Creates a digit chars validation action.
 *
 * @param requirement The required digit chars.
 * @param message The error message.
 *
 * @returns A digit chars action.
 */
export function digitChars<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<DigitCharsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): DigitCharsAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function digitChars(
  requirement: number,
  message?: ErrorMessage<DigitCharsIssue<string, number>>
): DigitCharsAction<
  string,
  number,
  ErrorMessage<DigitCharsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'digit_chars',
    reference: digitChars,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getDigitCount(dataset.value);
        if (count !== this.requirement) {
          _addIssue(this, 'digits', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
