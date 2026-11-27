import { BASE64_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Base64 issue interface.
 */
export interface Base64Issue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'base64';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The Base64 regex.
   */
  readonly requirement: RegExp;
}

/**
 * Base64 action interface.
 */
export interface Base64Action<
  TInput extends string,
  TMessage extends ErrorMessage<Base64Issue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, Base64Issue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'base64';
  /**
   * The action reference.
   */
  readonly reference: typeof base64;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The Base64 regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Base64 characters regex without repeated groups to avoid stack overflows on large inputs.
 */
const BASE64_CHARS_REGEX = /^[\da-zA-Z+/]*={0,2}$/u;

/**
 * Creates a [Base64](https://en.wikipedia.org/wiki/Base64) validation action.
 *
 * @returns A Base64 action.
 */
export function base64<TInput extends string>(): Base64Action<
  TInput,
  undefined
>;

/**
 * Creates a [Base64](https://en.wikipedia.org/wiki/Base64) validation action.
 *
 * @param message The error message.
 *
 * @returns A Base64 action.
 */
export function base64<
  TInput extends string,
  const TMessage extends ErrorMessage<Base64Issue<TInput>> | undefined,
>(message: TMessage): Base64Action<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function base64(
  message?: ErrorMessage<Base64Issue<string>>
): Base64Action<string, ErrorMessage<Base64Issue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'base64',
    reference: base64,
    async: false,
    expects: null,
    requirement: BASE64_REGEX,
    message,
    '~run'(dataset, config) {
      if (
        dataset.typed &&
        (dataset.value.length % 4 !== 0 ||
          !BASE64_CHARS_REGEX.test(dataset.value))
      ) {
        _addIssue(this, 'Base64', dataset, config);
      }
      return dataset;
    },
  };
}
