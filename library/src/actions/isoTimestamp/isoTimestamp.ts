import { ISO_TIMESTAMP_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISO timestamp issue interface.
 */
export interface IsoTimestampIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iso_timestamp';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The ISO timestamp regex.
   */
  readonly requirement: RegExp;
}

/**
 * ISO timestamp action interface.
 */
export interface IsoTimestampAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoTimestampIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoTimestampIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iso_timestamp';
  /**
   * The action reference.
   */
  readonly reference: typeof isoTimestamp;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The ISO timestamp regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [ISO timestamp](https://en.wikipedia.org/wiki/ISO_8601) validation
 * action.
 *
 * Formats:
 * - yyyy-mm-ddThh:mm:ss.sssZ
 * - yyyy-mm-ddThh:mm:ss.sss±hh:mm
 * - yyyy-mm-ddThh:mm:ss.sss±hhmm
 *
 * Hint: To support timestamps with lower or higher accuracy, the millisecond
 * specification can be removed or contain up to 9 digits.
 *
 * Hint: The regex used cannot validate the maximum number of days based on
 * year and month. For example, "2023-06-31T00:00:00.000Z" is valid although
 * June has only 30 days.
 *
 * Hint: The regex also allows a space as a separator between the date and time
 * parts instead of the "T" character.
 *
 * Hint: The regex also allows a space before the UTC offset (e.g., " +00:00")
 * to support PostgreSQL's `timestamptz` output format.
 *
 * @returns An ISO timestamp action.
 */
export function isoTimestamp<TInput extends string>(): IsoTimestampAction<
  TInput,
  undefined
>;

/**
 * Creates an [ISO timestamp](https://en.wikipedia.org/wiki/ISO_8601) validation
 * action.
 *
 * Formats:
 * - yyyy-mm-ddThh:mm:ss.sssZ
 * - yyyy-mm-ddThh:mm:ss.sss±hh:mm
 * - yyyy-mm-ddThh:mm:ss.sss±hhmm
 * - yyyy-mm-ddThh:mm:ss.sss±hh
 *
 * Hint: To support timestamps with lower or higher accuracy, the millisecond
 * specification can be removed or contain up to 9 digits.
 *
 * Hint: The regex used cannot validate the maximum number of days based on
 * year and month. For example, "2023-06-31T00:00:00.000Z" is valid although
 * June has only 30 days.
 *
 * Hint: The regex also allows a space as a separator between the date and time
 * parts instead of the "T" character.
 *
 * Hint: The regex also allows a space before the UTC offset (e.g., " +00:00")
 * to support PostgreSQL's `timestamptz` output format.
 *
 * @param message The error message.
 *
 * @returns An ISO timestamp action.
 */
export function isoTimestamp<
  TInput extends string,
  const TMessage extends ErrorMessage<IsoTimestampIssue<TInput>> | undefined,
>(message: TMessage): IsoTimestampAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoTimestamp(
  message?: ErrorMessage<IsoTimestampIssue<string>>
): IsoTimestampAction<
  string,
  ErrorMessage<IsoTimestampIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'iso_timestamp',
    reference: isoTimestamp,
    async: false,
    expects: null,
    requirement: ISO_TIMESTAMP_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'timestamp', dataset, config);
      }
      return dataset;
    },
  };
}
