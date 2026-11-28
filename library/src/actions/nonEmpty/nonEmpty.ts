import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { LengthInput } from '../types.ts';

/**
 * Non empty issue interface.
 */
export interface NonEmptyIssue<
  TInput extends LengthInput,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'non_empty';
  /**
   * The expected input.
   */
  readonly expected: '!0';
  /**
   * The received input.
   */
  readonly received: '0';
}

/**
 * Non empty action interface.
 */
export interface NonEmptyAction<
  TInput extends LengthInput,
  TMessage extends ErrorMessage<NonEmptyIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, NonEmptyIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'non_empty';
  /**
   * The action reference.
   */
  readonly reference: typeof nonEmpty;
  /**
   * The expected property.
   */
  readonly expects: '!0';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a non-empty validation action.
 *
 * @returns A non-empty action.
 */
export function nonEmpty<TInput extends LengthInput>(): NonEmptyAction<
  TInput,
  undefined
>;

/**
 * Creates a non-empty validation action.
 *
 * @param message The error message.
 *
 * @returns A non-empty action.
 */
export function nonEmpty<
  TInput extends LengthInput,
  const TMessage extends ErrorMessage<NonEmptyIssue<TInput>> | undefined,
>(message: TMessage): NonEmptyAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nonEmpty(
  message?: ErrorMessage<NonEmptyIssue<LengthInput>>
): NonEmptyAction<
  LengthInput,
  ErrorMessage<NonEmptyIssue<LengthInput>> | undefined
> {
  return {
    kind: 'validation',
    type: 'non_empty',
    reference: nonEmpty,
    async: false,
    expects: '!0',
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.length === 0) {
        _addIssue(this, 'length', dataset, config, {
          received: '0',
        });
      }
      return dataset;
    },
  };
}
