import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { SizeInput } from '../types.ts';

/**
 * Size issue interface.
 */
export interface SizeIssue<
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
  readonly type: 'size';
  /**
   * The expected property.
   */
  readonly expected: `${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The required size.
   */
  readonly requirement: TRequirement;
}

/**
 * Size action interface.
 */
export interface SizeAction<
  TInput extends SizeInput,
  TRequirement extends number,
  TMessage extends ErrorMessage<SizeIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, SizeIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'size';
  /**
   * The action reference.
   */
  readonly reference: typeof size;
  /**
   * The expected property.
   */
  readonly expects: `${TRequirement}`;
  /**
   * The required size.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a size validation action.
 *
 * @param requirement The required size.
 *
 * @returns A size action.
 */
export function size<
  TInput extends SizeInput,
  const TRequirement extends number,
>(requirement: TRequirement): SizeAction<TInput, TRequirement, undefined>;

/**
 * Creates a size validation action.
 *
 * @param requirement The required size.
 * @param message The error message.
 *
 * @returns A size action.
 */
export function size<
  TInput extends SizeInput,
  const TRequirement extends number,
  const TMessage extends
    ErrorMessage<SizeIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): SizeAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function size(
  requirement: number,
  message?: ErrorMessage<SizeIssue<SizeInput, number>>
): SizeAction<
  SizeInput,
  number,
  ErrorMessage<SizeIssue<SizeInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'size',
    reference: size,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.size !== this.requirement) {
        _addIssue(this, 'size', dataset, config, {
          received: `${dataset.value.size}`,
        });
      }
      return dataset;
    },
  };
}
