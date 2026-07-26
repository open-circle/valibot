import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Regex issue interface.
 */
export interface RegexIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'regex';
  /**
   * The expected input.
   */
  readonly expected: string;
  /**
   * The received input.
   */
  readonly received: `"${string}"`;
  /**
   * The regex pattern.
   */
  readonly requirement: RegExp;
}

/**
 * Regex action interface.
 */
export interface RegexAction<
  TInput extends string,
  TMessage extends ErrorMessage<RegexIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, RegexIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'regex';
  /**
   * The action reference.
   */
  readonly reference: typeof regex;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The regex pattern.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [regex](https://en.wikipedia.org/wiki/Regular_expression) validation action.
 *
 * Hint: Be careful with the global flag `g` in your regex pattern, as it can lead to unexpected results. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test#using_test_on_a_regex_with_the_global_flag) for more information.
 *
 * @param requirement The regex pattern.
 *
 * @returns A regex action.
 */
export function regex<TInput extends string>(
  requirement: RegExp
): RegexAction<TInput, undefined>;

/**
 * Creates a [regex](https://en.wikipedia.org/wiki/Regular_expression) validation action.
 *
 * Hint: Be careful with the global flag `g` in your regex pattern, as it can lead to unexpected results. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test#using_test_on_a_regex_with_the_global_flag) for more information.
 *
 * @param requirement The regex pattern.
 * @param message The error message.
 *
 * @returns A regex action.
 */
export function regex<
  TInput extends string,
  const TMessage extends ErrorMessage<RegexIssue<TInput>> | undefined,
>(requirement: RegExp, message: TMessage): RegexAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function regex(
  requirement: RegExp,
  message?: ErrorMessage<RegexIssue<string>>
): RegexAction<string, ErrorMessage<RegexIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'regex',
    reference: regex,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'format', dataset, config);
      }
      return dataset;
    },
  };
}
