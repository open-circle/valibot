import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getGraphemeCount } from '../../utils/index.ts';

/**
 * Min graphemes issue interface.
 */
export interface MinGraphemesIssue<
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
  readonly type: 'min_graphemes';
  /**
   * The expected property.
   */
  readonly expected: `>=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The minimum graphemes.
   */
  readonly requirement: TRequirement;
}

/**
 * Min graphemes action interface.
 */
export interface MinGraphemesAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MinGraphemesIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    MinGraphemesIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'min_graphemes';
  /**
   * The action reference.
   */
  readonly reference: typeof minGraphemes;
  /**
   * The expected property.
   */
  readonly expects: `>=${TRequirement}`;
  /**
   * The minimum graphemes.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a min graphemes validation action.
 *
 * @param requirement The minimum graphemes.
 *
 * @returns A min graphemes action.
 */
export function minGraphemes<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): MinGraphemesAction<TInput, TRequirement, undefined>;

/**
 * Creates a min graphemes validation action.
 *
 * @param requirement The minimum graphemes.
 * @param message The error message.
 *
 * @returns A min graphemes action.
 */
export function minGraphemes<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MinGraphemesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MinGraphemesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function minGraphemes(
  requirement: number,
  message?: ErrorMessage<MinGraphemesIssue<string, number>>
): MinGraphemesAction<
  string,
  number,
  ErrorMessage<MinGraphemesIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'min_graphemes',
    reference: minGraphemes,
    async: false,
    expects: `>=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value, this.requirement);
        if (count < this.requirement) {
          _addIssue(this, 'graphemes', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
