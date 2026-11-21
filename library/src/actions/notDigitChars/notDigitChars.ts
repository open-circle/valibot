import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getDigitCount } from '../../utils/index.ts';

/**
 * Not digit chars issue interface.
 */
export interface NotDigitCharsIssue<
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
  readonly type: 'not_digit_chars';
  /**
   * The expected property.
   */
  readonly expected: `!${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The not required digit chars.
   */
  readonly requirement: TRequirement;
}

/**
 * Not digit chars action interface.
 */
export interface NotDigitCharsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<NotDigitCharsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    NotDigitCharsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'not_digit_chars';
  /**
   * The action reference.
   */
  readonly reference: typeof notDigitChars;
  /**
   * The expected property.
   */
  readonly expects: `!${TRequirement}`;
  /**
   * The not required digit chars.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not digit chars validation action.
 *
 * @param requirement The not required digit chars.
 *
 * @returns A not digit chars action.
 */
export function notDigitChars<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): NotDigitCharsAction<TInput, TRequirement, undefined>;

/**
 * Creates a not digit chars validation action.
 *
 * @param requirement The not required digit chars.
 * @param message The error message.
 *
 * @returns A not digit chars action.
 */
export function notDigitChars<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<NotDigitCharsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotDigitCharsAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notDigitChars(
  requirement: number,
  message?: ErrorMessage<NotDigitCharsIssue<string, number>>
): NotDigitCharsAction<
  string,
  number,
  ErrorMessage<NotDigitCharsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_digit_chars',
    reference: notDigitChars,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getDigitCount(dataset.value);
        if (count === this.requirement) {
          _addIssue(this, 'digits', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
