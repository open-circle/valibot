import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Non trimmed issue interface.
 */
export interface NonTrimmedIssue<TInput extends string>
  extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'non_trimmed';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
}

/**
 * Non trimmed action interface.
 */
export interface NonTrimmedAction<
  TInput extends string,
  TMessage extends ErrorMessage<NonTrimmedIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, NonTrimmedIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'non_trimmed';
  /**
   * The action reference.
   */
  readonly reference: typeof nonTrimmed;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a non-trimmed validation action.
 *
 * @returns A non-trimmed action.
 */
export function nonTrimmed<TInput extends string>(): NonTrimmedAction<
  TInput,
  undefined
>;

/**
 * Creates a non-trimmed validation action.
 *
 * @param message The error message.
 *
 * @returns A non-trimmed action.
 */
export function nonTrimmed<
  TInput extends string,
  const TMessage extends ErrorMessage<NonTrimmedIssue<TInput>> | undefined,
>(message: TMessage): NonTrimmedAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function nonTrimmed(
  message?: ErrorMessage<NonTrimmedIssue<string>>
): NonTrimmedAction<string, ErrorMessage<NonTrimmedIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'non_trimmed',
    reference: nonTrimmed,
    async: false,
    expects: null,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && dataset.value === dataset.value.trim()) {
        _addIssue(this, 'whitespace', dataset, config);
      }
      return dataset;
    },
  };
}
