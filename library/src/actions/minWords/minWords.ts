import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getWordCount } from '../../utils/index.ts';

/**
 * Min words issue interface.
 */
export interface MinWordsIssue<
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
  readonly type: 'min_words';
  /**
   * The expected property.
   */
  readonly expected: `>=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The minimum words.
   */
  readonly requirement: TRequirement;
}

/**
 * Min words action interface.
 */
export interface MinWordsAction<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MinWordsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, MinWordsIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'min_words';
  /**
   * The action reference.
   */
  readonly reference: typeof minWords;
  /**
   * The expected property.
   */
  readonly expects: `>=${TRequirement}`;
  /**
   * The locales to be used.
   */
  readonly locales: TLocales;
  /**
   * The minimum words.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a min words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The minimum words.
 *
 * @returns A min words action.
 */
export function minWords<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
>(
  locales: TLocales,
  requirement: TRequirement
): MinWordsAction<TInput, TLocales, TRequirement, undefined>;

/**
 * Creates a min words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The minimum words.
 * @param message The error message.
 *
 * @returns A min words action.
 */
export function minWords<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MinWordsIssue<TInput, TRequirement>>
    | undefined,
>(
  locales: TLocales,
  requirement: TRequirement,
  message: TMessage
): MinWordsAction<TInput, TLocales, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function minWords(
  locales: Intl.LocalesArgument,
  requirement: number,
  message?: ErrorMessage<MinWordsIssue<string, number>>
): MinWordsAction<
  string,
  Intl.LocalesArgument,
  number,
  ErrorMessage<MinWordsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'min_words',
    reference: minWords,
    async: false,
    expects: `>=${requirement}`,
    locales,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getWordCount(
          this.locales,
          dataset.value,
          this.requirement
        );
        if (count < this.requirement) {
          _addIssue(this, 'words', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
