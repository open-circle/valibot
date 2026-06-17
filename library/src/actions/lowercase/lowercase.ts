import { LOWERCASE_REGEX } from '../../regex.ts';
import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Lowercase issue interface.
 */
export interface LowercaseIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'lowercase';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The lowercase regex.
   */
  readonly requirement: RegExp;
}

/**
 * Lowercase action interface.
 */
export interface LowercaseAction<
  TInput extends string,
  TMessage extends ErrorMessage<LowercaseIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, LowercaseIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'lowercase';
  /**
   * The action reference.
   */
  readonly reference: typeof lowercase;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The lowercase regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a lowercase validation action.
 *
 * @returns A lowercase action.
 */
export function lowercase<TInput extends string>(): LowercaseAction<
  TInput,
  undefined
>;

/**
 * Creates a lowercase validation action.
 *
 * @param message The error message.
 *
 * @returns A lowercase action.
 */
export function lowercase<
  TInput extends string,
  const TMessage extends ErrorMessage<LowercaseIssue<TInput>> | undefined,
>(message: TMessage): LowercaseAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function lowercase(
  message?: ErrorMessage<LowercaseIssue<string>>
): LowercaseAction<string, ErrorMessage<LowercaseIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'lowercase',
    reference: lowercase,
    async: false,
    expects: null,
    requirement: LOWERCASE_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'lowercase', dataset, config);
      }
      return dataset;
    },
  };
}
