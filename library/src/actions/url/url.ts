import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * URL issue interface.
 */
export interface UrlIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'url';
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
 * URL action interface.
 */
export interface UrlAction<
  TInput extends string,
  TMessage extends ErrorMessage<UrlIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, UrlIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'url';
  /**
   * The action reference.
   */
  readonly reference: typeof url;
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
 * Creates an [URL](https://en.wikipedia.org/wiki/URL) validation action.
 *
 * Hint: The value is checked with the [URL parser](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL).
 * This check is not perfect. For example, values like "abc:1234" are accepted.
 *
 * @returns An URL action.
 */
export function url<TInput extends string>(): UrlAction<TInput, undefined>;

/**
 * Creates an [URL](https://en.wikipedia.org/wiki/URL) validation action.
 *
 * Hint: The value is checked with the [URL parser](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL).
 * This check is not perfect. For example, values like "abc:1234" are accepted.
 *
 * @param message The error message.
 *
 * @returns An URL action.
 */
export function url<
  TInput extends string,
  const TMessage extends ErrorMessage<UrlIssue<TInput>> | undefined,
>(message: TMessage): UrlAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function url(
  message?: ErrorMessage<UrlIssue<string>> | undefined
): UrlAction<string, ErrorMessage<UrlIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'url',
    reference: url,
    async: false,
    expects: null,
    requirement(input) {
      try {
        // Use `URL.canParse` when available to avoid constructing a URL object
        if (URL.canParse) {
          return URL.canParse(input);
        }
        new URL(input);
        return true;
      } catch {
        return false;
      }
    },
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'URL', dataset, config);
      }
      return dataset;
    },
  };
}
