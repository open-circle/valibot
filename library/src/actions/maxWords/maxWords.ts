import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getWordCount } from '../../utils/index.ts';

/**
 * Max words issue interface.
 */
export interface MaxWordsIssue<
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
  readonly type: 'max_words';
  /**
   * The expected property.
   */
  readonly expected: `<=${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The maximum words.
   */
  readonly requirement: TRequirement;
}

/**
 * Max words action interface.
 */
export interface MaxWordsAction<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MaxWordsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, MaxWordsIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'max_words';
  /**
   * The action reference.
   */
  readonly reference: typeof maxWords;
  /**
   * The expected property.
   */
  readonly expects: `<=${TRequirement}`;
  /**
   * The locales to be used.
   */
  readonly locales: TLocales;
  /**
   * The maximum words.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a max words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The maximum words.
 *
 * @returns A max words action.
 */
export function maxWords<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
>(
  locales: TLocales,
  requirement: TRequirement
): MaxWordsAction<TInput, TLocales, TRequirement, undefined>;

/**
 * Creates a max words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The maximum words.
 * @param message The error message.
 *
 * @returns A max words action.
 */
export function maxWords<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MaxWordsIssue<TInput, TRequirement>>
    | undefined,
>(
  locales: TLocales,
  requirement: TRequirement,
  message: TMessage
): MaxWordsAction<TInput, TLocales, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function maxWords(
  locales: Intl.LocalesArgument,
  requirement: number,
  message?: ErrorMessage<MaxWordsIssue<string, number>>
): MaxWordsAction<
  string,
  Intl.LocalesArgument,
  number,
  ErrorMessage<MaxWordsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'max_words',
    reference: maxWords,
    async: false,
    expects: `<=${requirement}`,
    locales,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        // Hint: A word consists of at least one code unit, so the word count
        // never exceeds the length of the input. This allows us to skip the
        // expensive segmentation if the length already satisfies the
        // requirement
        if (dataset.value.length > this.requirement) {
          const count = _getWordCount(this.locales, dataset.value);
          if (count > this.requirement) {
            _addIssue(this, 'words', dataset, config, {
              received: `${count}`,
            });
          }
        }
      }
      return dataset;
    },
  };
}
