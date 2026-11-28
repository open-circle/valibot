import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { LengthInput } from '../types.ts';

/**
 * Length issue interface.
 */
export interface LengthIssue<
  TInput extends LengthInput,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'length';
  /**
   * The expected property.
   */
  readonly expected: `${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The required length.
   */
  readonly requirement: TRequirement;
}

/**
 * Length action interface.
 */
export interface LengthAction<
  TInput extends LengthInput,
  TRequirement extends number,
  TMessage extends ErrorMessage<LengthIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, LengthIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'length';
  /**
   * The action reference.
   */
  readonly reference: typeof length;
  /**
   * The expected property.
   */
  readonly expects: `${TRequirement}`;
  /**
   * The required length.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a length validation action.
 *
 * @param requirement The required length.
 *
 * @returns A length action.
 */
export function length<
  TInput extends LengthInput,
  const TRequirement extends number,
>(requirement: TRequirement): LengthAction<TInput, TRequirement, undefined>;

/**
 * Creates a length validation action.
 *
 * @param requirement The required length.
 * @param message The error message.
 *
 * @returns A length action.
 */
export function length<
  TInput extends LengthInput,
  const TRequirement extends number,
  const TMessage extends
    ErrorMessage<LengthIssue<TInput, TRequirement>> | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): LengthAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function length(
  requirement: number,
  message?: ErrorMessage<LengthIssue<LengthInput, number>>
): LengthAction<
  LengthInput,
  number,
  ErrorMessage<LengthIssue<LengthInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'length',
    reference: length,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value.length !== this.requirement) {
        _addIssue(this, 'length', dataset, config, {
          received: `${dataset.value.length}`,
        });
      }
      return dataset;
    },
  };
}
