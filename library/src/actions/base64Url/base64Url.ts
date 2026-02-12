import { BASE64_URL_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Base64Url issue interface.
 */
export interface Base64UrlIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'base64_url';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The base64 url regex.
   */
  readonly requirement: RegExp;
}

/**
 * Base64Url action interface.
 */
export interface Base64UrlAction<
  TInput extends string,
  TMessage extends ErrorMessage<Base64UrlIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, Base64UrlIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'base64_url';
  /**
   * The action reference.
   */
  readonly reference: typeof base64Url;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The base64 url regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [base64 url](https://en.wikipedia.org/wiki/Base64#URL_applications) validation action.
 *
 * @returns A base64 url action.
 */
export function base64Url<TInput extends string>(): Base64UrlAction<
  TInput,
  undefined
>;

/**
 * Creates a [base64 url](https://en.wikipedia.org/wiki/Base64#URL_applications) validation action.
 *
 * @param message The error message.
 *
 * @returns A base64 url action.
 */
export function base64Url<
  TInput extends string,
  const TMessage extends ErrorMessage<Base64UrlIssue<TInput>> | undefined,
>(message: TMessage): Base64UrlAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function base64Url(
  message?: ErrorMessage<Base64UrlIssue<string>>
): Base64UrlAction<string, ErrorMessage<Base64UrlIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'base64_url',
    reference: base64Url,
    async: false,
    expects: null,
    requirement: BASE64_URL_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'Base64Url', dataset, config);
      }
      return dataset;
    },
  };
}
