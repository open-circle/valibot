import { ISO_DATE_TIME_SECOND_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISO date time second issue interface.
 */
export interface IsoDateTimeSecondIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iso_date_time_second';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The ISO date time with seconds regex.
   */
  readonly requirement: RegExp;
}

/**
 * ISO date time second action interface.
 */
export interface IsoDateTimeSecondAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoDateTimeSecondIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoDateTimeSecondIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iso_date_time_second';
  /**
   * The action reference.
   */
  readonly reference: typeof isoDateTimeSecond;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The ISO date time with seconds regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [ISO date time second](https://en.wikipedia.org/wiki/ISO_8601) validation action.
 *
 * Format: yyyy-mm-ddThh:mm:ss
 *
 * Hint: The regex used cannot validate the maximum number of days based on
 * year and month. For example, "2023-06-31T00:00:00" is valid although June has only
 * 30 days.
 *
 * Hint: The regex also allows a space as a separator between the date and time
 * parts instead of the "T" character.
 *
 * @returns An ISO date time second action.
 */
export function isoDateTimeSecond<
  TInput extends string,
>(): IsoDateTimeSecondAction<TInput, undefined>;

/**
 * Creates an [ISO date time second](https://en.wikipedia.org/wiki/ISO_8601) validation action.
 *
 * Format: yyyy-mm-ddThh:mm:ss
 *
 * Hint: The regex used cannot validate the maximum number of days based on
 * year and month. For example, "2023-06-31T00:00:00" is valid although June has only
 * 30 days.
 *
 * Hint: The regex also allows a space as a separator between the date and time
 * parts instead of the "T" character.
 *
 * @param message The error message.
 *
 * @returns An ISO date time second action.
 */
export function isoDateTimeSecond<
  TInput extends string,
  const TMessage extends
    | ErrorMessage<IsoDateTimeSecondIssue<TInput>>
    | undefined,
>(message: TMessage): IsoDateTimeSecondAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoDateTimeSecond(
  message?: ErrorMessage<IsoDateTimeSecondIssue<string>>
): IsoDateTimeSecondAction<
  string,
  ErrorMessage<IsoDateTimeSecondIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'iso_date_time_second',
    reference: isoDateTimeSecond,
    async: false,
    expects: null,
    requirement: ISO_DATE_TIME_SECOND_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'date-time-second', dataset, config);
      }
      return dataset;
    },
  };
}
