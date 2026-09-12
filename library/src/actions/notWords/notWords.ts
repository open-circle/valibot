import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue, _getWordCount } from '../../utils/index.ts';

/**
 * Not words issue interface.
 */
export interface NotWordsIssue<
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
  readonly type: 'not_words';
  /**
   * The expected property.
   */
  readonly expected: `!${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The not required words.
   */
  readonly requirement: TRequirement;
}

/**
 * Not words action interface.
 */
export interface NotWordsAction<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<NotWordsIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, NotWordsIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'not_words';
  /**
   * The action reference.
   */
  readonly reference: typeof notWords;
  /**
   * The expected property.
   */
  readonly expects: `!${TRequirement}`;
  /**
   * The locales to be used.
   */
  readonly locales: TLocales;
  /**
   * The not required words.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The not required words.
 *
 * @returns A not words action.
 */
export function notWords<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
>(
  locales: TLocales,
  requirement: TRequirement
): NotWordsAction<TInput, TLocales, TRequirement, undefined>;

/**
 * Creates a not words validation action.
 *
 * @param locales The locales to be used.
 * @param requirement The not required words.
 * @param message The error message.
 *
 * @returns A not words action.
 */
export function notWords<
  TInput extends string,
  TLocales extends Intl.LocalesArgument,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<NotWordsIssue<TInput, TRequirement>>
    | undefined,
>(
  locales: TLocales,
  requirement: TRequirement,
  message: TMessage
): NotWordsAction<TInput, TLocales, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notWords(
  locales: Intl.LocalesArgument,
  requirement: number,
  message?: ErrorMessage<NotWordsIssue<string, number>>
): NotWordsAction<
  string,
  Intl.LocalesArgument,
  number,
  ErrorMessage<NotWordsIssue<string, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_words',
    reference: notWords,
    async: false,
    expects: `!${requirement}`,
    locales,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed) {
        const count = _getWordCount(
          this.locales,
          dataset.value,
          this.requirement + 1
        );
        if (count === this.requirement) {
          _addIssue(this, 'words', dataset, config, {
            received: `${count}`,
          });
        }
      }
      return dataset;
    },
  };
}
