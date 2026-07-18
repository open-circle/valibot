import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * To date issue interface.
 */
export interface ToDateIssue<TInput> extends BaseIssue<TInput | Date> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'to_date';
  /**
   * The expected property.
   */
  readonly expected: null;
}

/**
 * To date action interface.
 */
export interface ToDateAction<
  TInput,
  TMessage extends ErrorMessage<ToDateIssue<TInput>> | undefined,
> extends BaseTransformation<TInput, Date, ToDateIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'to_date';
  /**
   * The action reference.
   */
  readonly reference: typeof toDate;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a to date transformation action.
 *
 * @returns A to date action.
 *
 * @beta
 */
export function toDate<TInput>(): ToDateAction<TInput, undefined>;

/**
 * Creates a to date transformation action.
 *
 * @param message The error message.
 *
 * @returns A to date action.
 *
 * @beta
 */
export function toDate<
  TInput,
  const TMessage extends ErrorMessage<ToDateIssue<TInput>> | undefined,
>(message: TMessage): ToDateAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function toDate(
  message?: ErrorMessage<ToDateIssue<unknown>>
): ToDateAction<unknown, ErrorMessage<ToDateIssue<unknown>> | undefined> {
  return {
    kind: 'transformation',
    type: 'to_date',
    reference: toDate,
    async: false,
    message,
    '~run'(dataset, config) {
      try {
        // @ts-expect-error
        dataset.value = new Date(dataset.value);
        // @ts-expect-error
        if (isNaN(dataset.value)) {
          _addIssue(this, 'date', dataset, config, {
            received: '"Invalid Date"',
          });
          // @ts-expect-error
          dataset.typed = false;
        }
      } catch {
        _addIssue(this, 'date', dataset, config);
        // @ts-expect-error
        dataset.typed = false;
      }
      return dataset as OutputDataset<Date, ToDateIssue<unknown>>;
    },
  };
}
