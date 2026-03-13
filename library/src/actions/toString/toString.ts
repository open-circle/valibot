import type {
  BaseIssue,
  BaseTransformation,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * To string issue interface.
 */
export interface ToStringIssue<TInput> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'to_string';
  /**
   * The expected property.
   */
  readonly expected: null;
}

/**
 * To string action interface.
 */
export interface ToStringAction<
  TInput,
  TMessage extends ErrorMessage<ToStringIssue<TInput>> | undefined,
> extends BaseTransformation<TInput, string, ToStringIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'to_string';
  /**
   * The action reference.
   */
  readonly reference: typeof toString;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a to string transformation action.
 *
 * @returns A to string action.
 *
 * @beta
 */
export function toString<TInput>(): ToStringAction<TInput, undefined>;

/**
 * Creates a to string transformation action.
 *
 * @param message The error message.
 *
 * @returns A to string action.
 *
 * @beta
 */
export function toString<
  TInput,
  const TMessage extends ErrorMessage<ToStringIssue<TInput>> | undefined,
>(message: TMessage): ToStringAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function toString(
  message?: ErrorMessage<ToStringIssue<unknown>>
): ToStringAction<unknown, ErrorMessage<ToStringIssue<unknown>> | undefined> {
  return {
    kind: 'transformation',
    type: 'to_string',
    reference: toString,
    async: false,
    message,
    '~run'(dataset, config) {
      try {
        dataset.value = String(dataset.value);
      } catch {
        _addIssue(this, 'string', dataset, config);
        // @ts-expect-error
        dataset.typed = false;
      }
      return dataset as OutputDataset<string, ToStringIssue<unknown>>;
    },
  };
}
