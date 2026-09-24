import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getGraphemeCount } from '../../utils/index.ts';

/**
 * Graphemes issue interface.
 */
export interface GraphemesIssue<
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
  readonly type: 'graphemes';
  /**
   * The expected property.
   */
  readonly expected: `${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The required graphemes.
   */
  readonly requirement: TRequirement;
}

/**
 * Graphemes action interface.
 */
export interface GraphemesAction<
  TInput extends string,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<GraphemesIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, GraphemesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'graphemes';
  /**
   * The action reference.
   */
  readonly reference: typeof graphemes;
  /**
   * The expected property.
   */
  readonly expects: `${TRequirement}`;
  /**
   * The required graphemes.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a graphemes validation action.
 *
 * @param requirement The required graphemes.
 *
 * @returns A graphemes action.
 */
export function graphemes<
  TInput extends string,
  const TRequirement extends number,
>(requirement: TRequirement): GraphemesAction<TInput, TRequirement, undefined>;

/**
 * Creates a graphemes validation action.
 *
 * @param requirement The required graphemes.
 * @param message The error message.
 *
 * @returns A graphemes action.
 */
export function graphemes<
  TInput extends string,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<GraphemesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): GraphemesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function graphemes(
  requirement: number,
  message?: ErrorMessage<GraphemesIssue<string, number>>
): GraphemesAction<
  string,
  number,
  ErrorMessage<GraphemesIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'graphemes',
    reference: graphemes,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getGraphemeCount(dataset.value);
        if (count !== this.requirement) {
          _addIssue(this, 'graphemes', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
