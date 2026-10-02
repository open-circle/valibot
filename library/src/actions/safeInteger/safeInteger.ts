import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Safe integer issue interface.
 */
export interface SafeIntegerIssue<
  TInput extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'safe_integer';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The validation function.
   */
  readonly requirement: (input: number) => boolean;
}

/**
 * Safe integer action interface.
 */
export interface SafeIntegerAction<
  TInput extends number,
  TMessage extends ErrorMessage<SafeIntegerIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, SafeIntegerIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'safe_integer';
  /**
   * The action reference.
   */
  readonly reference: typeof safeInteger;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: (input: number) => boolean;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a safe integer validation action.
 *
 * @returns A safe integer action.
 */
export function safeInteger<TInput extends number>(): SafeIntegerAction<
  TInput,
  undefined
>;

/**
 * Creates a safe integer validation action.
 *
 * @param message The error message.
 *
 * @returns A safe integer action.
 */
export function safeInteger<
  TInput extends number,
  const TMessage extends ErrorMessage<SafeIntegerIssue<TInput>> | undefined,
>(message: TMessage): SafeIntegerAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function safeInteger(
  message?: ErrorMessage<SafeIntegerIssue<number>>
): SafeIntegerAction<
  number,
  ErrorMessage<SafeIntegerIssue<number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'safe_integer',
    reference: safeInteger,
    async: false,
    expects: null,
    requirement: Number.isSafeInteger,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'safe integer', dataset, config);
      }
      return dataset;
    },
  };
}
