import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getGraphemeCount } from '../../utils/index.ts';

/**
 * Not code points issue interface.
 */
export interface NotCodePointsIssue<
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
  readonly type: 'not_code_points';
  /**
   * The expected property.
   */
  readonly expected: `!${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The not required code points.
   */
  readonly requirement: TRequirement;
}

/**
 * Not code points action interface.
 */
export interface NotCodePointsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<NotCodePointsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    NotCodePointsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'not_code_points';
  /**
   * The action reference.
   */
  readonly reference: typeof notCodePoints;
  /**
   * The expected property.
   */
  readonly expects: `!${TRequirement}`;
  /**
   * The not required code points.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not code points validation action.
 *
 * @param requirement The not required code points.
 *
 * @returns A not code points action.
 */
export function notCodePoints<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): NotCodePointsAction<TInput, TRequirement, undefined>;

/**
 * Creates a not code points validation action.
 *
 * @param requirement The not required code points.
 * @param message The error message.
 *
 * @returns A not code points action.
 */
export function notCodePoints<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<NotCodePointsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotCodePointsAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notCodePoints(
  requirement: number,
  message?: ErrorMessage<NotCodePointsIssue<string, number>>
): NotCodePointsAction<
  string,
  number,
  ErrorMessage<NotCodePointsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_code_points',
    reference: notCodePoints,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value);
        if (count === this.requirement) {
          _addIssue(this, 'code_points', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
