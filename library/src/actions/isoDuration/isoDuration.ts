import { ISO_DURATION_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISO duration issue interface.
 */
export interface IsoDurationIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iso_duration';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The ISO duration regex.
   */
  readonly requirement: RegExp;
}

/**
 * ISO duration action interface.
 */
export interface IsoDurationAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoDurationIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoDurationIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iso_duration';
  /**
   * The action reference.
   */
  readonly reference: typeof isoDuration;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The ISO duration regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [ISO duration](https://en.wikipedia.org/wiki/ISO_8601#Durations)
 * validation action.
 *
 * Format: PnYnMnDTnHnMnS
 *
 * Hint: The regex used cannot validate the semantic order or plausibility of
 * the components. For example, "P0D" is valid although it represents a zero
 * duration.
 *
 * @returns An ISO duration action.
 */
export function isoDuration<TInput extends string>(): IsoDurationAction<
  TInput,
  undefined
>;

/**
 * Creates an [ISO duration](https://en.wikipedia.org/wiki/ISO_8601#Durations)
 * validation action.
 *
 * Format: PnYnMnDTnHnMnS
 *
 * Hint: The regex used cannot validate the semantic order or plausibility of
 * the components. For example, "P0D" is valid although it represents a zero
 * duration.
 *
 * @param message The error message.
 *
 * @returns An ISO duration action.
 */
export function isoDuration<
  TInput extends string,
  const TMessage extends ErrorMessage<IsoDurationIssue<TInput>> | undefined,
>(message: TMessage): IsoDurationAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoDuration(
  message?: ErrorMessage<IsoDurationIssue<string>>
): IsoDurationAction<
  string,
  ErrorMessage<IsoDurationIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'iso_duration',
    reference: isoDuration,
    async: false,
    expects: null,
    requirement: ISO_DURATION_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'duration', dataset, config);
      }
      return dataset;
    },
  };
}
