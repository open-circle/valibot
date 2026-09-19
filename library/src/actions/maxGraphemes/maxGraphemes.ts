import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getGraphemeCount } from '../../utils/index.ts';

/**
 * Max graphemes issue interface.
 */
export interface MaxGraphemesIssue<
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
  readonly type: 'max_graphemes';
  /**
   * The expected property.
   */
  readonly expected: `<=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The maximum graphemes.
   */
  readonly requirement: TRequirement;
}

/**
 * Max graphemes action interface.
 */
export interface MaxGraphemesAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MaxGraphemesIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    MaxGraphemesIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'max_graphemes';
  /**
   * The action reference.
   */
  readonly reference: typeof maxGraphemes;
  /**
   * The expected property.
   */
  readonly expects: `<=${TRequirement}`;
  /**
   * The maximum graphemes.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max graphemes validation action.
 *
 * @param requirement The maximum graphemes.
 *
 * @returns A max graphemes action.
 */
export function maxGraphemes<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): MaxGraphemesAction<TInput, TRequirement, undefined>;

/**
 * Creates a max graphemes validation action.
 *
 * @param requirement The maximum graphemes.
 * @param message The error message.
 *
 * @returns A max graphemes action.
 */
export function maxGraphemes<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MaxGraphemesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MaxGraphemesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function maxGraphemes(
  requirement: number,
  message?: ErrorMessage<MaxGraphemesIssue<string, number>>
): MaxGraphemesAction<
  string,
  number,
  ErrorMessage<MaxGraphemesIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_graphemes',
    reference: maxGraphemes,
    async: false,
    expects: `<=${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        if (dataset.value.length > this.requirement) {
          const count = _getGraphemeCount(dataset.value);
          if (count > this.requirement) {
            _addIssue(this, 'graphemes', dataset, config, {
              received: `${count}`,
            });
          }
        }
      }
      return dataset;
    },
  };
}
