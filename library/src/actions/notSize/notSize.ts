import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { SizeInput } from '../types.ts';

/**
 * Not size issue interface.
 */
export interface NotSizeIssue<
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
  readonly type: 'not_size';
  /**
   * The expected property.
   */
  readonly expected: `!${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${TRequirement}`;
  /**
   * The not required size.
   */
  readonly requirement: TRequirement;
}

/**
 * Not size action interface.
 */
export interface NotSizeAction<
  TInput extends SizeInput,
  TRequirement extends number,
  TMessage extends ErrorMessage<NotSizeIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, NotSizeIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'not_size';
  /**
   * The action reference.
   */
  readonly reference: typeof notSize;
  /**
   * The expected property.
   */
  readonly expects: `!${TRequirement}`;
  /**
   * The not required size.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not size validation action.
 *
 * @param requirement The not required size.
 *
 * @returns A not size action.
 */
export function notSize<
  TInput extends SizeInput,
  const TRequirement extends number,
>(requirement: TRequirement): NotSizeAction<TInput, TRequirement, undefined>;

/**
 * Creates a not size validation action.
 *
 * @param requirement The not required size.
 * @param message The error message.
 *
 * @returns A not size action.
 */
export function notSize<
  TInput extends SizeInput,
  const TRequirement extends number,
  const TMessage extends
    ErrorMessage<NotSizeIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotSizeAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notSize(
  requirement: number,
  message?: ErrorMessage<NotSizeIssue<SizeInput, number>>
): NotSizeAction<
  SizeInput,
  number,
  ErrorMessage<NotSizeIssue<SizeInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_size',
    reference: notSize,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.size === this.requirement) {
        _addIssue(this, 'size', dataset, config, {
          received: `${dataset.value.size}`,
        });
      }
      return dataset;
    },
  };
}
