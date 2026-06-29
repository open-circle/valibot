import { RFC_3339_DURATION_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * RFC duration issue interface.
 */
export interface RfcDurationIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'rfc_duration';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The RFC duration regex.
   */
  readonly requirement: RegExp;
}

/**
 * RFC duration action interface.
 */
export interface RfcDurationAction<
  TInput extends string,
  TMessage extends ErrorMessage<RfcDurationIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, RfcDurationIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'rfc_duration';
  /**
   * The action reference.
   */
  readonly reference: typeof rfcDuration;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The RFC duration regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A) duration validation action.
 *
 * Format: PnYnMnDTnHnMnS
 *
 * @returns An RFC duration action.
 */
export function rfcDuration<TInput extends string>(): RfcDurationAction<
  TInput,
  undefined
>;

/**
 * Creates an [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A) duration validation action.
 *
 * Format: PnYnMnDTnHnMnS
 *
 * @param message The error message.
 *
 * @returns An RFC duration action.
 */
export function rfcDuration<
  TInput extends string,
  const TMessage extends ErrorMessage<RfcDurationIssue<TInput>> | undefined,
>(message: TMessage): RfcDurationAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function rfcDuration(
  message?: ErrorMessage<RfcDurationIssue<string>>
): RfcDurationAction<
  string,
  ErrorMessage<RfcDurationIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'rfc_duration',
    reference: rfcDuration,
    async: false,
    expects: null,
    requirement: RFC_3339_DURATION_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'duration', dataset, config);
      }
      return dataset;
    },
  };
}
