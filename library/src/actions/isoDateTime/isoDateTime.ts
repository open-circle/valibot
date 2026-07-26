import { ISO_DATE_TIME_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISO date time issue interface.
 */
export interface IsoDateTimeIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iso_date_time';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The ISO date time regex.
   */
  readonly requirement: RegExp;
}

/**
 * ISO date time action interface.
 */
export interface IsoDateTimeAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoDateTimeIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoDateTimeIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iso_date_time';
  /**
   * The action reference.
   */
  readonly reference: typeof isoDateTime;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The ISO date time regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [ISO date time](https://en.wikipedia.org/wiki/ISO_8601) validation action.
 *
 * Format: yyyy-mm-ddThh:mm
 *
 * Hint: The regex used cannot validate the maximum number of days based on
 * year and month. For example, "2023-06-31T00:00" is valid although June has only
 * 30 days.
 *
 * Hint: The regex also allows a space as a separator between the date and time
 * parts instead of the "T" character.
 *
 * @returns An ISO date time action.
 */
export function isoDateTime<TInput extends string>(): IsoDateTimeAction<
  TInput,
  undefined
>;

/**
 * Creates an [ISO date time](https://en.wikipedia.org/wiki/ISO_8601) validation action.
 *
 * Format: yyyy-mm-ddThh:mm
 *
 * Hint: The regex used cannot validate the maximum number of days based on
 * year and month. For example, "2023-06-31T00:00" is valid although June has only
 * 30 days.
 *
 * Hint: The regex also allows a space as a separator between the date and time
 * parts instead of the "T" character.
 *
 * @param message The error message.
 *
 * @returns An ISO date time action.
 */
export function isoDateTime<
  TInput extends string,
  const TMessage extends ErrorMessage<IsoDateTimeIssue<TInput>> | undefined,
>(message: TMessage): IsoDateTimeAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoDateTime(
  message?: ErrorMessage<IsoDateTimeIssue<string>>
): IsoDateTimeAction<
  string,
  ErrorMessage<IsoDateTimeIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'iso_date_time',
    reference: isoDateTime,
    async: false,
    expects: null,
    requirement: ISO_DATE_TIME_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'date-time', dataset, config);
      }
      return dataset;
    },
  };
}
