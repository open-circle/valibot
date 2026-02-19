import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _isLuhnAlgo } from '../../utils/index.ts';

/**
 * Credit card issue interface.
 */
export interface CreditCardIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'credit_card';
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
 * Credit card action interface.
 */
export interface CreditCardAction<
  TInput extends string,
  TMessage extends ErrorMessage<CreditCardIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, CreditCardIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'credit_card';
  /**
   * The action reference.
   */
  readonly reference: typeof creditCard;
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
 * Credit card regex.
 */
const CREDIT_CARD_REGEX =
  /^(?:\d{13,19}|\d{4}(?: \d{3,6}){2,4}|\d{4}(?:-\d{3,6}){2,4})$/u;

/**
 * Sanitize regex.
 */
const SANITIZE_REGEX = /[- ]/gu;

/**
 * Provider regex list.
 */
const PROVIDER_REGEX_LIST = [
  // American Express
  /^3[47]\d{13}$/u,
  // Diners Club
  /^3(?:0[0-5]|[68]\d)\d{11,13}$/u,
  // Discover
  /^6(?:011|5\d{2})\d{12,15}$/u,
  // JCB
  /^(?:2131|1800|35\d{3})\d{11}$/u,
  // Mastercard
  // eslint-disable-next-line redos-detector/no-unsafe-regex
  /^5[1-5]\d{2}|(?:222\d|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}$/u,
  // UnionPay
  /^(?:6[27]\d{14,17}|81\d{14,17})$/u,
  // Visa
  /^4\d{12}(?:\d{3,6})?$/u,
];

/**
 * Creates a [credit card](https://en.wikipedia.org/wiki/Payment_card_number) validation action.
 *
 * @returns A Credit card action.
 */
export function creditCard<TInput extends string>(): CreditCardAction<
  TInput,
  undefined
>;

/**
 * Creates a [credit card](https://en.wikipedia.org/wiki/Payment_card_number) validation action.
 *
 * @param message The error message.
 *
 * @returns A credit card action.
 */
export function creditCard<
  TInput extends string,
  const TMessage extends ErrorMessage<CreditCardIssue<TInput>> | undefined,
>(message: TMessage): CreditCardAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function creditCard(
  message?: ErrorMessage<CreditCardIssue<string>>
): CreditCardAction<string, ErrorMessage<CreditCardIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'credit_card',
    reference: creditCard,
    async: false,
    expects: null,
    requirement(input) {
      let sanitized: string | undefined;
      return (CREDIT_CARD_REGEX.test(input) &&
        // Remove any hyphens and blanks
        (sanitized = input.replace(SANITIZE_REGEX, '')) &&
        // Check if it matches a provider
        PROVIDER_REGEX_LIST.some((regex) => regex.test(sanitized!)) &&
        // Check if passes luhn algorithm
        _isLuhnAlgo(sanitized)) as boolean;
    },
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'credit card', dataset, config);
      }
      return dataset;
    },
  };
}
