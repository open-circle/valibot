import { RFC_3339_DURATION_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * RFC 3339 duration issue interface.
 */
export interface Rfc3339DurationIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'rfc3339_duration';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The RFC 3339 duration regex.
   */
  readonly requirement: RegExp;
}

/**
 * RFC 3339 duration action interface.
 */
export interface Rfc3339DurationAction<
  TInput extends string,
  TMessage extends ErrorMessage<Rfc3339DurationIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, Rfc3339DurationIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'rfc3339_duration';
  /**
   * The action reference.
   */
  readonly reference: typeof rfc3339Duration;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The RFC 3339 duration regex.
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
 * Format: PnW | PnYnMnDTnHnMnS
 *
 * Hint: This action intentionally does not accept negative or fractional
 * values.
 *
 * @returns An RFC 3339 duration action.
 */
export function rfc3339Duration<TInput extends string>(): Rfc3339DurationAction<
  TInput,
  undefined
>;

/**
 * Creates an [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339#appendix-A) duration validation action.
 *
 * Format: PnW | PnYnMnDTnHnMnS
 *
 * Hint: This action intentionally does not accept negative or fractional
 * values.
 *
 * @param message The error message.
 *
 * @returns An RFC 3339 duration action.
 */
export function rfc3339Duration<
  TInput extends string,
  const TMessage extends ErrorMessage<Rfc3339DurationIssue<TInput>> | undefined,
>(message: TMessage): Rfc3339DurationAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function rfc3339Duration(
  message?: ErrorMessage<Rfc3339DurationIssue<string>>
): Rfc3339DurationAction<
  string,
  ErrorMessage<Rfc3339DurationIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'rfc3339_duration',
    reference: rfc3339Duration,
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
