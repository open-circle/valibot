import { SLUG_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Slug issue type.
 */
export interface SlugIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'slug';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The slug regex.
   */
  readonly requirement: RegExp;
}

/**
 * Slug action type.
 */
export interface SlugAction<
  TInput extends string,
  TMessage extends ErrorMessage<SlugIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, SlugIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'slug';
  /**
   * The action reference.
   */
  readonly reference: typeof slug;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The slug regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [slug](https://en.wikipedia.org/wiki/Clean_URL#Slug) validation action.
 *
 * @returns A slug action.
 */
export function slug<TInput extends string>(): SlugAction<TInput, undefined>;

/**
 * Creates a [slug](https://en.wikipedia.org/wiki/Clean_URL#Slug) validation action.
 *
 * @param message The error message.
 *
 * @returns A slug action.
 */
export function slug<
  TInput extends string,
  const TMessage extends ErrorMessage<SlugIssue<TInput>> | undefined,
>(message: TMessage): SlugAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function slug(
  message?: ErrorMessage<SlugIssue<string>>
): SlugAction<string, ErrorMessage<SlugIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'slug',
    reference: slug,
    async: false,
    expects: null,
    requirement: SLUG_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'slug', dataset, config);
      }
      return dataset;
    },
  };
}
