import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { SizeInput } from '../types.ts';

/**
 * Min size issue interface.
 */
export interface MinSizeIssue<
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
  readonly type: 'min_size';
  /**
   * The expected property.
   */
  readonly expected: `>=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The minimum size.
   */
  readonly requirement: TRequirement;
}

/**
 * Min size action interface.
 */
export interface MinSizeAction<
  TInput extends SizeInput,
  TRequirement extends number,
  TMessage extends ErrorMessage<MinSizeIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MinSizeIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'min_size';
  /**
   * The action reference.
   */
  readonly reference: typeof minSize;
  /**
   * The expected property.
   */
  readonly expects: `>=${TRequirement}`;
  /**
   * The minimum size.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a min size validation action.
 *
 * @param requirement The minimum size.
 *
 * @returns A min size action.
 */
export function minSize<
  TInput extends SizeInput,
  const TRequirement extends number,
>(requirement: TRequirement): MinSizeAction<TInput, TRequirement, undefined>;

/**
 * Creates a min size validation action.
 *
 * @param requirement The minimum size.
 * @param message The error message.
 *
 * @returns A min size action.
 */
export function minSize<
  TInput extends SizeInput,
  const TRequirement extends number,
  const TMessage extends
    ErrorMessage<MinSizeIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MinSizeAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function minSize(
  requirement: number,
  message?: ErrorMessage<MinSizeIssue<SizeInput, number>>
): MinSizeAction<
  SizeInput,
  number,
  ErrorMessage<MinSizeIssue<SizeInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'min_size',
    reference: minSize,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.size < this.requirement) {
        _addIssue(this, 'size', dataset, config, {
          received: `${dataset.value.size}`,
        });
      }
      return dataset;
    },
  };
}
