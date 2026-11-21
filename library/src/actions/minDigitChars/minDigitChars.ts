import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getDigitCount } from '../../utils/index.ts';

/**
 * Min digit chars issue interface.
 */
export interface MinDigitCharsIssue<
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
  readonly type: 'min_digit_chars';
  /**
   * The expected property.
   */
  readonly expected: `>=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The minimum digit chars.
   */
  readonly requirement: TRequirement;
}

/**
 * Min digit chars action interface.
 */
export interface MinDigitCharsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MinDigitCharsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    MinDigitCharsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'min_digit_chars';
  /**
   * The action reference.
   */
  readonly reference: typeof minDigitChars;
  /**
   * The expected property.
   */
  readonly expects: `>=${TRequirement}`;
  /**
   * The minimum digit chars.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a min digit chars validation action.
 *
 * @param requirement The minimum digit chars.
 *
 * @returns A min digit chars action.
 */
export function minDigitChars<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): MinDigitCharsAction<TInput, TRequirement, undefined>;

/**
 * Creates a min digit chars validation action.
 *
 * @param requirement The minimum digit chars.
 * @param message The error message.
 *
 * @returns A min digit chars action.
 */
export function minDigitChars<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MinDigitCharsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MinDigitCharsAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function minDigitChars(
  requirement: number,
  message?: ErrorMessage<MinDigitCharsIssue<string, number>>
): MinDigitCharsAction<
  string,
  number,
  ErrorMessage<MinDigitCharsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'min_digit_chars',
    reference: minDigitChars,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getDigitCount(dataset.value);
        if (count < this.requirement) {
          _addIssue(this, 'digits', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
