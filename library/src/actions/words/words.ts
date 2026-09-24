import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getWordCount } from '../../utils/index.ts';

/**
 * Words issue interface.
 */
export interface WordsIssue<TInput extends string, TRequirement extends number>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'words';
  /**
   * The expected property.
   */
  readonly expected: `${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The required words.
   */
  readonly requirement: TRequirement;
}

/**
 * Words action interface.
 */
export interface WordsAction<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  TRequirement extends number,
  TMessage extends ErrorMessage<WordsIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, WordsIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'words';
  /**
   * The action reference.
   */
  readonly reference: typeof words;
  /**
   * The expected property.
   */
  readonly expects: `${TRequirement}`;
  /**
   * The locales to be used.
   */
  readonly locales: TLocales;
  /**
   * The required words.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The required words.
 *
 * @returns A words action.
 */
export function words<
  TInput extends string,
  const TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
>(
  locales: TLocales,
  requirement: TRequirement
): WordsAction<TInput, TLocales, TRequirement, undefined>;

/**
 * Creates a words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The required words.
 * @param message The error message.
 *
 * @returns A words action.
 */
export function words<
  TInput extends string,
  const TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<WordsIssue<TInput, TRequirement>>
    | undefined,
>(
  locales: TLocales,
  requirement: TRequirement,
  message: TMessage
): WordsAction<TInput, TLocales, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function words(
  locales: Intl.LocalesArgument,
  requirement: number,
  message?: ErrorMessage<WordsIssue<string, number>>
): WordsAction<
  string,
  Intl.LocalesArgument,
  number,
  ErrorMessage<WordsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'words',
    reference: words,
    async: false,
    expects: `${requirement}`,
    locales,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getWordCount(this.locales, dataset.value);
        if (count !== this.requirement) {
          _addIssue(this, 'words', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
