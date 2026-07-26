import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { EntriesInput } from '../types.ts';

/**
 * Entries issue interface.
 *
 * @beta
 */
export interface EntriesIssue<
  TInput extends EntriesInput,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'entries';
  /**
   * The expected property.
   */
  readonly expected: `${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The required entries.
   */
  readonly requirement: TRequirement;
}

/**
 * Entries action interface.
 *
 * @beta
 */
export interface EntriesAction<
  TInput extends EntriesInput,
  TRequirement extends number,
  TMessage extends ErrorMessage<EntriesIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, EntriesIssue<TInput, TRequirement>> {
  /**
   * The action type.
   */
  readonly type: 'entries';
  /**
   * The action reference.
   */
  readonly reference: typeof entries;
  /**
   * The expected property.
   */
  readonly expects: `${TRequirement}`;
  /**
   * The required entries.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an entries validation action.
 *
 * @param requirement The required entries.
 *
 * @returns An entries action.
 *
 * @beta
 */
export function entries<
  TInput extends EntriesInput,
  const TRequirement extends number,
>(requirement: TRequirement): EntriesAction<TInput, TRequirement, undefined>;

/**
 * Creates an entries validation action.
 *
 * @param requirement The required entries.
 * @param message The error message.
 *
 * @returns An entries action.
 *
 * @beta
 */
export function entries<
  TInput extends EntriesInput,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<EntriesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): EntriesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function entries(
  requirement: number,
  message?: ErrorMessage<EntriesIssue<EntriesInput, number>>
): EntriesAction<
  EntriesInput,
  number,
  ErrorMessage<EntriesIssue<EntriesInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'entries',
    reference: entries,
    async: false,
    expects: `${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (!dataset.typed) return dataset;
      const count = Object.keys(dataset.value).length;
      if (dataset.typed && count !== this.requirement) {
        _addIssue(this, 'entries', dataset, config, {
          received: `${count}`,
        });
      }
      return dataset;
    },
  };
}
