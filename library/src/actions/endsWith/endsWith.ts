import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Ends with issue interface.
 */
export interface EndsWithIssue<
  TInput extends string,
  TRequirement extends string,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'ends_with';
  /**
   * The expected property.
   */
  readonly expected: `"${TRequirement}"`;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The end string.
   */
  readonly requirement: TRequirement;
}

/**
 * Ends with action interface.
 */
export interface EndsWithAction<
  TInput extends string,
  TRequirement extends string,
  TMessage extends
    | ErrorMessage<EndsWithIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, `${string}${TRequirement}`, EndsWithIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'ends_with';
  /**
   * The action reference.
   */
  readonly reference: typeof endsWith;
  /**
   * The expected property.
   */
  readonly expects: `"${TRequirement}"`;
  /**
   * The end string.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an ends with validation action.
 *
 * @param requirement The end string.
 *
 * @returns An ends with action.
 */
export function endsWith<
  TInput extends string,
  const TRequirement extends string,
>(requirement: TRequirement): EndsWithAction<TInput, TRequirement, undefined>;

/**
 * Creates an ends with validation action.
 *
 * @param requirement The end string.
 * @param message The error message.
 *
 * @returns An ends with action.
 */
export function endsWith<
  TInput extends string,
  const TRequirement extends string,
  const TMessage extends
    | ErrorMessage<EndsWithIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): EndsWithAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function endsWith(
  requirement: string,
  message?: ErrorMessage<EndsWithIssue<string, string>>
): EndsWithAction<
  string,
  string,
  ErrorMessage<EndsWithIssue<string, string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'ends_with',
    reference: endsWith,
    async: false,
    expects: `"${requirement}"`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !dataset.value.endsWith(this.requirement)) {
        _addIssue(this, 'end', dataset, config, {
          received: `"${dataset.value.slice(-this.requirement.length)}"`,
        });
      }
      return dataset;
    },
  };
}
