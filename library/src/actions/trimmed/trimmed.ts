import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Trimmed issue interface.
 */
export interface TrimmedIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'trimmed';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
}

/**
 * Trimmed action interface.
 */
export interface TrimmedAction<
  TInput extends string,
  TMessage extends ErrorMessage<TrimmedIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, TrimmedIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'trimmed';
  /**
   * The action reference.
   */
  readonly reference: typeof trimmed;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a trimmed validation action.
 *
 * @returns A trimmed action.
 */
export function trimmed<TInput extends string>(): TrimmedAction<
  TInput,
  undefined
>;

/**
 * Creates a trimmed validation action.
 *
 * @param message The error message.
 *
 * @returns A trimmed action.
 */
export function trimmed<
  TInput extends string,
  const TMessage extends ErrorMessage<TrimmedIssue<TInput>> | undefined,
>(message: TMessage): TrimmedAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function trimmed(
  message?: ErrorMessage<TrimmedIssue<string>>
): TrimmedAction<string, ErrorMessage<TrimmedIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'trimmed',
    reference: trimmed,
    async: false,
    expects: null,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.trim() !== dataset.value) {
        _addIssue(this, 'trimmed', dataset, config);
      }
      return dataset;
    },
  };
}
