import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISBN issue interface.
 */
export interface IsbnIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'ISBN';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
}

/**
 * ISBN action interface.
 */
export interface IsbnAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsbnIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsbnIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'ISBN';
  /**
   * The action reference.
   */
  readonly reference: typeof isbn;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates An [ISBN](https://en.wikipedia.org/wiki/ISBN) validation action.
 *
 * @returns An ISBN validation action.
 */
export function isbn<TInput extends string>(): IsbnAction<TInput, undefined>;

/**
 * Creates An [ISBN](https://en.wikipedia.org/wiki/ISBN) validation action.
 *
 * @param message The error message.
 *
 * @returns An ISBN validation action.
 */
export function isbn<
  TInput extends string,
  TMessage extends ErrorMessage<IsbnIssue<TInput>> | undefined,
>(message: TMessage): IsbnAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isbn(
  message?: ErrorMessage<IsbnIssue<string>>
): IsbnAction<string, ErrorMessage<IsbnIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'ISBN',
    reference: isbn,
    async: false,
    expects: null,
    requirement(input) {
      const replacedInput = input.replaceAll('-', '');
      const isbn10Regex = /^\d{9}[\dX]$/u;
      const isbn13Regex = /^\d{13}$/u;
      if (isbn10Regex.test(replacedInput)) {
        return validateISBN10(replacedInput);
      } else if (isbn13Regex.test(replacedInput)) {
        return validateISBN13(replacedInput);
      }
      return false;
    },
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'ISBN', dataset, config);
      }
      return dataset;
    },
  };
}

/**
 * [Validates an ISBN-10](https://en.wikipedia.org/wiki/ISBN#ISBN-10_check_digits).
 *
 * @param input The input value.
 *
 * @returns `true` if the input is a valid ISBN-10, `false` otherwise.
 */
function validateISBN10(input: string): boolean {
  const digits = input.split('').map((c) => (c === 'X' ? 10 : parseInt(c)));
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const mod = sum % 11;
  const checkDigit = mod === 0 ? 0 : 11 - mod;
  return checkDigit === digits[9];
}

/**
 * [Validates an ISBN-13](https://en.wikipedia.org/wiki/ISBN#ISBN-13_check_digit_calculation).
 *
 * @param input The input value.
 *
 * @returns `true` if the input is a valid ISBN-13, `false` otherwise.
 */
function validateISBN13(input: string): boolean {
  const digits = input.split('').map((c) => parseInt(c));
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const mod = sum % 10;
  const checkDigit = mod === 0 ? 0 : 10 - mod;
  return checkDigit === digits[12];
}
