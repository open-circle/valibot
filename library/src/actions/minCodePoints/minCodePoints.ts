import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getCodePointCount } from '../../utils/index.ts';

/**
 * Min code points issue type.
 */
export interface MinCodePointsIssue<
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
  readonly type: 'min_code_points';
  /**
   * The expected property.
   */
  readonly expected: `>=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The minimum code points.
   */
  readonly requirement: TRequirement;
}

/**
 * Min code points action type.
 */
export interface MinCodePointsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MinCodePointsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    MinCodePointsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'min_code_points';
  /**
   * The action reference.
   */
  readonly reference: typeof minCodePoints;
  /**
   * The expected property.
   */
  readonly expects: `>=${TRequirement}`;
  /**
   * The minimum code points.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a min code points validation action.
 *
 * @param requirement The minimum code points.
 *
 * @returns A min code points action.
 */
export function minCodePoints<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): MinCodePointsAction<TInput, TRequirement, undefined>;

/**
 * Creates a min code points validation action.
 *
 * @param requirement The minimum code points.
 * @param message The error message.
 *
 * @returns A min code points action.
 */
export function minCodePoints<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MinCodePointsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MinCodePointsAction<TInput, TRequirement, TMessage>;

export function minCodePoints(
  requirement: number,
  message?: ErrorMessage<MinCodePointsIssue<string, number>>
): MinCodePointsAction<
  string,
  number,
  ErrorMessage<MinCodePointsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'min_code_points',
    reference: minCodePoints,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getCodePointCount(dataset.value);
        if (count < this.requirement) {
          _addIssue(this, 'code_points', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
