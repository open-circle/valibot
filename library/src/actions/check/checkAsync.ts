import type {
  BaseValidationAsync,
  ErrorMessage,
  MaybePromise,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { CheckIssue } from './types.ts';

/**
 * Check action async interface.
 */
export interface CheckActionAsync<
  TInput,
  TMessage extends ErrorMessage<CheckIssue<TInput>> | undefined,
> extends BaseValidationAsync<TInput, TInput, CheckIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'check';
  /**
   * The action reference.
   */
  readonly reference: typeof checkAsync;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: (
    input: TInput,
    signal?: AbortSignal
  ) => MaybePromise<boolean>;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a check validation action.
 *
 * @param requirement The validation function.
 *
 * @returns A check action.
 */
export function checkAsync<TInput>(
  requirement: (input: TInput, signal?: AbortSignal) => MaybePromise<boolean>
): CheckActionAsync<TInput, undefined>;

/**
 * Creates a check validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns A check action.
 */
export function checkAsync<
  TInput,
  const TMessage extends ErrorMessage<CheckIssue<TInput>> | undefined,
>(
  requirement: (input: TInput, signal?: AbortSignal) => MaybePromise<boolean>,
  message: TMessage
): CheckActionAsync<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function checkAsync(
  requirement: (input: unknown, signal?: AbortSignal) => MaybePromise<boolean>,
  message?: ErrorMessage<CheckIssue<unknown>>
): CheckActionAsync<unknown, ErrorMessage<CheckIssue<unknown>> | undefined> {
  return {
    kind: 'validation',
    type: 'check',
    reference: checkAsync,
    async: true,
    expects: null,
    requirement,
    message,
    async '~run'(dataset, config) {
      if (
        dataset.typed &&
        !(await this.requirement(dataset.value, config.signal))
      ) {
        _addIssue(this, 'input', dataset, config);
      }
      return dataset;
    },
  };
}
