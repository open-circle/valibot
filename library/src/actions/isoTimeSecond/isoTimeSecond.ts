import { ISO_TIME_SECOND_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * ISO time second issue interface.
 */
export interface IsoTimeSecondIssue<
  TInput extends string,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iso_time_second';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The ISO time with seconds regex.
   */
  readonly requirement: RegExp;
}

/**
 * ISO time second action interface.
 */
export interface IsoTimeSecondAction<
  TInput extends string,
  TMessage extends ErrorMessage<IsoTimeSecondIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IsoTimeSecondIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iso_time_second';
  /**
   * The action reference.
   */
  readonly reference: typeof isoTimeSecond;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The ISO time second regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an [ISO time second](https://en.wikipedia.org/wiki/ISO_8601) validation action.
 *
 * Format: hh:mm:ss
 *
 * @returns An ISO time second action.
 */
export function isoTimeSecond<TInput extends string>(): IsoTimeSecondAction<
  TInput,
  undefined
>;

/**
 * Creates an [ISO time second](https://en.wikipedia.org/wiki/ISO_8601) validation action.
 *
 * Format: hh:mm:ss
 *
 * @param message The error message.
 *
 * @returns An ISO time second action.
 */
export function isoTimeSecond<
  TInput extends string,
  const TMessage extends ErrorMessage<IsoTimeSecondIssue<TInput>> | undefined,
>(message: TMessage): IsoTimeSecondAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function isoTimeSecond(
  message?: ErrorMessage<IsoTimeSecondIssue<string>>
): IsoTimeSecondAction<
  string,
  ErrorMessage<IsoTimeSecondIssue<string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'iso_time_second',
    reference: isoTimeSecond,
    async: false,
    expects: null,
    requirement: ISO_TIME_SECOND_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'time-second', dataset, config);
      }
      return dataset;
    },
  };
}
