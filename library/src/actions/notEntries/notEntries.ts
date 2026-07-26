import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { EntriesInput } from '../types.ts';

/**
 * Not entries issue interface.
 *
 * @beta
 */
export interface NotEntriesIssue<
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
  readonly type: 'not_entries';
  /**
   * The expected property.
   */
  readonly expected: `!${TRequirement}`;
  /**
   * The received property.
   */
  readonly received: `${number}`;
  /**
   * The not required entries.
   */
  readonly requirement: TRequirement;
}

/**
 * Not entries action interface.
 *
 * @beta
 */
export interface NotEntriesAction<
  TInput extends EntriesInput,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<NotEntriesIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<
    TInput,
    TInput,
    NotEntriesIssue<TInput, TRequirement>
  > {
  /**
   * The action type.
   */
  readonly type: 'not_entries';
  /**
   * The action reference.
   */
  readonly reference: typeof notEntries;
  /**
   * The expected property.
   */
  readonly expects: `!${TRequirement}`;
  /**
   * The not required entries.
   */
  readonly requirement: TRequirement;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a not entries validation action.
 *
 * @param requirement The not required entries.
 *
 * @returns A not entries action.
 *
 * @beta
 */
export function notEntries<
  TInput extends EntriesInput,
  const TRequirement extends number,
>(requirement: TRequirement): NotEntriesAction<TInput, TRequirement, undefined>;

/**
 * Creates a not entries validation action.
 *
 * @param requirement The not required entries.
 * @param message The error message.
 *
 * @returns A not entries action.
 *
 * @beta
 */
export function notEntries<
  TInput extends EntriesInput,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<NotEntriesIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): NotEntriesAction<TInput, TRequirement, TMessage>;

// @__NO_SIDE_EFFECTS__
export function notEntries(
  requirement: number,
  message?: ErrorMessage<NotEntriesIssue<EntriesInput, number>>
): NotEntriesAction<
  EntriesInput,
  number,
  ErrorMessage<NotEntriesIssue<EntriesInput, number>> | undefined
> {
  return {
    kind: 'validation',
    type: 'not_entries',
    reference: notEntries,
    async: false,
    expects: `!${requirement}`,
    requirement,
    message,
    '~run'(dataset, config) {
      if (!dataset.typed) return dataset;
      const count = Object.keys(dataset.value).length;
      if (dataset.typed && count === this.requirement) {
        _addIssue(this, 'entries', dataset, config, {
          received: `${count}`,
        });
      }
      return dataset;
    },
  };
}
