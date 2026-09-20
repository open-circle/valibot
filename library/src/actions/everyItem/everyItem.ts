import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { ArrayInput, ArrayRequirement } from '../types.ts';

/**
 * Every item issue interface.
 */
export interface EveryItemIssue<
  TInput extends ArrayInput,
> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'every_item';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The validation function.
   */
  readonly requirement: ArrayRequirement<TInput>;
}

/**
 * Every item action interface.
 */
export interface EveryItemAction<
  TInput extends ArrayInput,
  TMessage extends ErrorMessage<EveryItemIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, EveryItemIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'every_item';
  /**
   * The action reference.
   */
  readonly reference: typeof everyItem;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: ArrayRequirement<TInput>;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an every item validation action.
 *
 * @param requirement The validation function.
 *
 * @returns An every item action.
 */
export function everyItem<TInput extends ArrayInput>(
  requirement: ArrayRequirement<TInput>
): EveryItemAction<TInput, undefined>;

/**
 * Creates an every item validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns An every item action.
 */
export function everyItem<
  TInput extends ArrayInput,
  const TMessage extends ErrorMessage<EveryItemIssue<TInput>> | undefined,
>(
  requirement: ArrayRequirement<TInput>,
  message: TMessage
): EveryItemAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function everyItem(
  requirement: ArrayRequirement<unknown[]>,
  message?: ErrorMessage<EveryItemIssue<unknown[]>>
): EveryItemAction<
  unknown[],
  ErrorMessage<EveryItemIssue<unknown[]>> | undefined
> {
  return {
    kind: 'validation',
    type: 'every_item',
    reference: everyItem,
    async: false,
    expects: null,
    requirement,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !dataset.value.every(this.requirement)) {
        _addIssue(this, 'item', dataset, config);
      }
      return dataset;
    },
  };
}
