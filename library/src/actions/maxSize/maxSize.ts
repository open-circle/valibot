import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { SizeInput } from '../types.ts';

/**
 * Max size issue interface.
 */
export interface MaxSizeIssue<
  TInput extends SizeInput,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'max_size';
  /**
   * The expected property.
   */
  readonly expected: `<=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The maximum size.
   */
  readonly requirement: TRequirement;
}

/**
 * Max size action interface.
 */
export interface MaxSizeAction<
  TInput extends SizeInput,
  TRequirement extends number,
  TMessage extends ErrorMessage<MaxSizeIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MaxSizeIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'max_size';
  /**
   * The action reference.
   */
  readonly reference: typeof maxSize;
  /**
   * The expected property.
   */
  readonly expects: `<=${TRequirement}`;
  /**
   * The maximum size.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max size validation action.
 *
 * @param requirement The maximum size.
 *
 * @returns A max size action.
 */
export function maxSize<
  TInput extends SizeInput,
  const TRequirement extends number,
>(requirement: TRequirement): MaxSizeAction<TInput, TRequirement, undefined>;

/**
 * Creates a max size validation action.
 *
 * @param requirement The maximum size.
 * @param message The error message.
 *
 * @returns A max size action.
 */
export function maxSize<
  TInput extends SizeInput,
  const TRequirement extends number,
  const TMessage extends
    ErrorMessage<MaxSizeIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MaxSizeAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function maxSize(
  requirement: number,
  message?: ErrorMessage<MaxSizeIssue<SizeInput, number>>
): MaxSizeAction<
  SizeInput,
  number,
  ErrorMessage<MaxSizeIssue<SizeInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_size',
    reference: maxSize,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.size > this.requirement) {
        _addIssue(this, 'size', dataset, config, {
          received: `${dataset.value.size}`,
        });
      }
      return dataset;
    },
  };
}
