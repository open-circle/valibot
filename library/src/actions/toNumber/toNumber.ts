import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * To number issue interface.
 */
export interface ToNumberIssue<TInput> extends BaseIssue<TInput | number> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'to_number';
  /**
   * The expected property.
   */
  readonly expected: null;
}

/**
 * To number action interface.
 */
export interface ToNumberAction<
  TInput,
  TMessage extends ErrorMessage<ToNumberIssue<TInput>> | undefined,
> extends BaseTransformation<TInput, number, ToNumberIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'to_number';
  /**
   * The action reference.
   */
  readonly reference: typeof toNumber;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a to number transformation action.
 *
 * @returns A to number action.
 *
 * @beta
 */
export function toNumber<TInput>(): ToNumberAction<TInput, undefined>;

/**
 * Creates a to number transformation action.
 *
 * @param message The error message.
 *
 * @returns A to number action.
 *
 * @beta
 */
export function toNumber<
  TInput,
  const TMessage extends ErrorMessage<ToNumberIssue<TInput>> | undefined,
>(message: TMessage): ToNumberAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function toNumber(
  message?: ErrorMessage<ToNumberIssue<unknown>>
): ToNumberAction<unknown, ErrorMessage<ToNumberIssue<unknown>> | undefined> {
  return {
    kind: 'transformation',
    type: 'to_number',
    reference: toNumber,
    async: false,
    message,
    '~run'(dataset, config) {
      try {
        dataset.value = Number(dataset.value);
        // @ts-expect-error
        if (isNaN(dataset.value)) {
          _addIssue(this, 'number', dataset, config);
          // @ts-expect-error
          dataset.typed = false;
        }
      } catch {
        _addIssue(this, 'number', dataset, config);
        // @ts-expect-error
        dataset.typed = false;
      }
      return dataset as OutputDataset<number, ToNumberIssue<unknown>>;
    },
  };
}
