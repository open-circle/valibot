import { RFC_EMAIL_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * RFC email issue interface.
 */
export interface RfcEmailIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'rfc_email';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The RFC email regex.
   */
  readonly requirement: RegExp;
}

/**
 * RFC email action interface.
 */
export interface RfcEmailAction<
  TInput extends string,
  TMessage extends ErrorMessage<RfcEmailIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, RfcEmailIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'rfc_email';
  /**
   * The action reference.
   */
  readonly reference: typeof rfcEmail;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The RFC email regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [RFC email](https://datatracker.ietf.org/doc/html/rfc5322#section-3.4.1)
 * validation action.
 *
 * Hint: This validation action intentionally validates only the major part of RFC 5322
 * specification covered by `<input type="email">` in the HTML Living Standard.
 * For example, quoted local parts or comments in local parts are not supported.
 * If you are interested in an action that only covers commoner
 * email addresses, please use the `email` action instead.
 *
 * @returns A RFC email action.
 */
export function rfcEmail<TInput extends string>(): RfcEmailAction<
  TInput,
  undefined
>;

/**
 * Creates a [RFC email](https://datatracker.ietf.org/doc/html/rfc5322#section-3.4.1)
 * validation action.
 *
 * Hint: This validation action intentionally validates only the major part of RFC 5322
 * specification covered by `<input type="email">` in the HTML Living Standard.
 * For example, quoted local parts or comments in local parts are not supported.
 * If you are interested in an action that only covers commoner
 * email addresses, please use the `email` action instead.
 *
 * @param message The error message.
 *
 * @returns A RFC email action.
 */
export function rfcEmail<
  TInput extends string,
  const TMessage extends ErrorMessage<RfcEmailIssue<TInput>> | undefined,
>(message: TMessage): RfcEmailAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function rfcEmail(
  message?: ErrorMessage<RfcEmailIssue<string>>
): RfcEmailAction<string, ErrorMessage<RfcEmailIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'rfc_email',
    reference: rfcEmail,
    expects: null,
    async: false,
    requirement: RFC_EMAIL_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'email', dataset, config);
      }
      return dataset;
    },
  };
}
