import { RFC_3339_TIME_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * RFC time issue interface.
 */
export interface RfcTimeIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'rfc_time';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The RFC time regex.
   */
  readonly requirement: RegExp;
}

/**
 * RFC time action interface.
 */
export interface RfcTimeAction<
  TInput extends string,
  TMessage extends ErrorMessage<RfcTimeIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, RfcTimeIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'rfc_time';
  /**
   * The action reference.
   */
  readonly reference: typeof rfcTime;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The RFC time regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) time validation action.
 *
 * Format: hh:mm:ss[.sss](Z|±hh:mm)
 *
 * @returns An RFC time action.
 */
export function rfcTime<TInput extends string>(): RfcTimeAction<
  TInput,
  undefined
>;

export function rfcTime<
  TInput extends string,
  const TMessage extends ErrorMessage<RfcTimeIssue<TInput>> | undefined,
>(message: TMessage): RfcTimeAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function rfcTime(
  message?: ErrorMessage<RfcTimeIssue<string>>
): RfcTimeAction<string, ErrorMessage<RfcTimeIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'rfc_time',
    reference: rfcTime,
    async: false,
    expects: null,
    requirement: RFC_3339_TIME_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'time', dataset, config);
      }
      return dataset;
    },
  };
}
