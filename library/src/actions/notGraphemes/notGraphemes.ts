import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getGraphemeCount } from '../../utils/index.ts';

/**
 * Not graphemes issue interface.
 */
export interface NotGraphemesIssue<
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
  readonly type: 'not_graphemes';
  /**
   * The expected property.
   */
  readonly expected: `!${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The not required graphemes.
   */
  readonly requirement: TRequirement;
}

/**
 * Not graphemes action interface.
 */
export interface NotGraphemesAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<NotGraphemesIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    NotGraphemesIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'not_graphemes';
  /**
   * The action reference.
   */
  readonly reference: typeof notGraphemes;
  /**
   * The expected property.
   */
  readonly expects: `!${TRequirement}`;
  /**
   * The not required graphemes.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not graphemes validation action.
 *
 * @param requirement The not required graphemes.
 *
 * @returns A not graphemes action.
 */
export function notGraphemes<
  TInput extends string,
  const TRequirement extends number,
>(
  requirement: TRequirement
): NotGraphemesAction<TInput, TRequirement, undefined>;

/**
 * Creates a not graphemes validation action.
 *
 * @param requirement The not required graphemes.
 * @param message The error message.
 *
 * @returns A not graphemes action.
 */
export function notGraphemes<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<NotGraphemesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotGraphemesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notGraphemes(
  requirement: number,
  message?: ErrorMessage<NotGraphemesIssue<string, number>>
): NotGraphemesAction<
  string,
  number,
  ErrorMessage<NotGraphemesIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_graphemes',
    reference: notGraphemes,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value, this.requirement + 1);
        if (count === this.requirement) {
          _addIssue(this, 'graphemes', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
