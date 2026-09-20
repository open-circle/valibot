import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { LengthInput } from '../types.ts';

/**
 * Empty issue interface.
 */
export interface EmptyIssue<
  TInput extends LengthInput,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'empty';
  /**
   * The expected input.
   */
  readonly expected: '0';
  /**
   * The received input.
   */
  readonly received: `${number}`;
}

/**
 * Empty action interface.
 */
export interface EmptyAction<
  TInput extends LengthInput,
  TMessage extends ErrorMessage<EmptyIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, EmptyIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'empty';
  /**
   * The action reference.
   */
  readonly reference: typeof empty;
  /**
   * The expected property.
   */
  readonly expects: '0';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an empty validation action.
 *
 * @returns An empty action.
 */
export function empty<TInput extends LengthInput>(): EmptyAction<
  TInput,
  undefined
>;

/**
 * Creates an empty validation action.
 *
 * @param message The error message.
 *
 * @returns An empty action.
 */
export function empty<
  TInput extends LengthInput,
  const TMessage extends ErrorMessage<EmptyIssue<TInput>> | undefined,
>(message: TMessage): EmptyAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function empty(
  message?: ErrorMessage<EmptyIssue<LengthInput>>
): EmptyAction<LengthInput, ErrorMessage<EmptyIssue<LengthInput>> | undefined> {
  return {
    kind: 'validation',
    type: 'empty',
    reference: empty,
    async: false,
    expects: '0',
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.length > 0) {
        _addIssue(this, 'length', dataset, config, {
          received: `${dataset.value.length}`,
        });
      }
      return dataset;
    },
  };
}
