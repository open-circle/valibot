import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getCodePointCount } from '../../utils/index.ts';

/**
 * Max code points issue type.
 */
export interface MaxCodePointsIssue<
  TInput extends string,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'max_code_points';
  /**
   * The expected property.
   */
  readonly expected: `<=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The maximum code points.
   */
  readonly requirement: TRequirement;
}

/**
 * Max code points action type.
 */
export interface MaxCodePointsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MaxCodePointsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    MaxCodePointsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'max_code_points';
  /**
   * The action reference.
   */
  readonly reference: typeof maxCodePoints;
  /**
   * The expected property.
   */
  readonly expects: `<=${TRequirement}`;
  /**
   * The maximum code points.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max code points validation action.
 *
 * @param requirement The maximum code points.
 *
 * @returns A max code points action.
 */
export function maxCodePoints<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): MaxCodePointsAction<TInput, TRequirement, undefined>;

/**
 * Creates a max code points validation action.
 *
 * @param requirement The maximum code points.
 * @param message The error message.
 *
 * @returns A max code points action.
 */
export function maxCodePoints<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MaxCodePointsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MaxCodePointsAction<TInput, TRequirement, TMessage>;

export function maxCodePoints(
  requirement: number,
  message?: ErrorMessage<MaxCodePointsIssue<string, number>>
): MaxCodePointsAction<
  string,
  number,
  ErrorMessage<MaxCodePointsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_code_points',
    reference: maxCodePoints,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getCodePointCount(dataset.value);
        if (count > this.requirement) {
          _addIssue(this, 'code_points', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
