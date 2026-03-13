import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import { _isIsbn10, _isIsbn13 } from './utils/index.ts';

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
  readonly type: 'isbn';
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
  readonly type: 'isbn';
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
 * ISBN separator regex.
 */
const ISBN_SEPARATOR_REGEX = /[- ]/gu;

/**
 * ISBN-10 detection regex.
 */
const ISBN_10_DETECTION_REGEX = /^\d{9}[\dX]$/u;

/**
 * ISBN-13 detection regex.
 */
const ISBN_13_DETECTION_REGEX = /^\d{13}$/u;

/**
 * Creates an [ISBN](https://en.wikipedia.org/wiki/ISBN) action.
 *
 * @returns An ISBN action.
 *
 * @beta
 */
export function isbn<TInput extends string>(): IsbnAction<TInput, undefined>;

/**
 * Creates an [ISBN](https://en.wikipedia.org/wiki/ISBN) action.
 *
 * @param message The error message.
 *
 * @returns An ISBN action.
 *
 * @beta
 */
export function isbn<
  TInput extends string,
  const TMessage extends ErrorMessage<IsbnIssue<TInput>> | undefined,
>(message: TMessage): IsbnAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isbn(
  message?: ErrorMessage<IsbnIssue<string>>
): IsbnAction<string, ErrorMessage<IsbnIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'isbn',
    reference: isbn,
    async: false,
    expects: null,
    requirement(input) {
      const replacedInput = input.replace(ISBN_SEPARATOR_REGEX, '');
      if (ISBN_10_DETECTION_REGEX.test(replacedInput)) {
        return _isIsbn10(replacedInput);
      } else if (ISBN_13_DETECTION_REGEX.test(replacedInput)) {
        return _isIsbn13(replacedInput);
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
