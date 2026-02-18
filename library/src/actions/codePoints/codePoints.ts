import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getCodePointCount } from '../../utils/index.ts';

/**
 * CodePoints issue type.
 */
export interface CodePointsIssue<
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
  readonly type: 'code_points';
  /**
   * The expected property.
   */
  readonly expected: `${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The required codePoints.
   */
  readonly requirement: TRequirement;
}

/**
 * CodePoints action type.
 */
export interface CodePointsAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<CodePointsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    CodePointsIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'code_points';
  /**
   * The action reference.
   */
  readonly reference: typeof codePoints;
  /**
   * The expected property.
   */
  readonly expects: `${TRequirement}`;
  /**
   * The required code points.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a code points validation action.
 *
 * @param requirement The required code points.
 *
 * @returns A code points action.
 */
export function codePoints<
  TInput extends string,
  const TRequirement extends number,
>(requirement: TRequirement): CodePointsAction<TInput, TRequirement, undefined>;

/**
 * Creates a code points validation action.
 *
 * @param requirement The required code points.
 * @param message The error message.
 *
 * @returns A code points action.
 */
export function codePoints<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<CodePointsIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): CodePointsAction<TInput, TRequirement, TMessage>;

export function codePoints(
  requirement: number,
  message?: ErrorMessage<CodePointsIssue<string, number>>
): CodePointsAction<
  string,
  number,
  ErrorMessage<CodePointsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'code_points',
    reference: codePoints,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getCodePointCount(dataset.value);
        if (count !== this.requirement) {
          _addIssue(this, 'codePoints', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
