import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Starts with issue interface.
 */
export interface StartsWithIssue<
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
  readonly type: 'starts_with';
  /**
   * The expected property.
   */
  readonly expected: `"${TRequirement}"`;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The start string.
   */
  readonly requirement: TRequirement;
}

/**
 * Starts with action interface.
 */
export interface StartsWithAction<
  TInput extends string,
  TRequirement extends string,
  TMessage extends
    | ErrorMessage<StartsWithIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    `${TRequirement}${string}`,
    StartsWithIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'starts_with';
  /**
   * The action reference.
   */
  readonly reference: typeof startsWith;
  /**
   * The expected property.
   */
  readonly expects: `"${TRequirement}"`;
  /**
   * The start string.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a starts with validation action.
 *
 * @param requirement The start string.
 *
 * @returns A starts with action.
 */
export function startsWith<
  TInput extends string,
  const TRequirement extends string,
>(requirement: TRequirement): StartsWithAction<TInput, TRequirement, undefined>;

/**
 * Creates a starts with validation action.
 *
 * @param requirement The start string.
 * @param message The error message.
 *
 * @returns A starts with action.
 */
export function startsWith<
  TInput extends string,
  const TRequirement extends string,
  const TMessage extends
    | ErrorMessage<StartsWithIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): StartsWithAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function startsWith(
  requirement: string,
  message?: ErrorMessage<StartsWithIssue<string, string>>
): StartsWithAction<
  string,
  string,
  ErrorMessage<StartsWithIssue<string, string>> | undefined
> {
  return {
    kind: 'validation',
    type: 'starts_with',
    reference: startsWith,
    async: false,
    expects: `"${requirement}"`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !dataset.value.startsWith(this.requirement)) {
        _addIssue(this, 'start', dataset, config, {
          received: `"${dataset.value.slice(0, this.requirement.length)}"`,
        });
      }
      return dataset;
    },
  };
}
