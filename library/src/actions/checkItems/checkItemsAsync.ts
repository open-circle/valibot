import type { BaseValidationAsync, ErrorMessage } from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { ArrayInput, ArrayRequirementAsync } from '../types.ts';
import type { CheckItemsIssue } from './types.ts';

/**
 * Check items action async interface.
 */
export interface CheckItemsActionAsync<
  TInput extends ArrayInput,
  TMessage extends ErrorMessage<CheckItemsIssue<TInput>> | undefined,
> extends BaseValidationAsync<TInput, TInput, CheckItemsIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'check_items';
  /**
   * The action reference.
   */
  readonly reference: typeof checkItemsAsync;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: ArrayRequirementAsync<TInput>;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a check items validation action.
 *
 * @param requirement The validation function.
 *
 * @returns A check items action.
 */
export function checkItemsAsync<TInput extends ArrayInput>(
  requirement: ArrayRequirementAsync<TInput>
): CheckItemsActionAsync<TInput, undefined>;

/**
 * Creates a check items validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns A check items action.
 */
export function checkItemsAsync<
  TInput extends ArrayInput,
  const TMessage extends ErrorMessage<CheckItemsIssue<TInput>> | undefined,
>(
  requirement: ArrayRequirementAsync<TInput>,
  message: TMessage
): CheckItemsActionAsync<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function checkItemsAsync(
  requirement: ArrayRequirementAsync<unknown[]>,
  message?: ErrorMessage<CheckItemsIssue<unknown[]>>
): CheckItemsActionAsync<
  unknown[],
  ErrorMessage<CheckItemsIssue<unknown[]>> | undefined
> {
  return {
    kind: 'validation',
    type: 'check_items',
    reference: checkItemsAsync,
    async: true,
    expects: null,
    requirement,
    message,
    async '~run'(dataset, config) {
      if (dataset.typed) {
        const requirementResults = await Promise.all(
          dataset.value.map((...args) =>
            this.requirement(...args, config.signal)
          )
        );
        for (let index = 0; index < dataset.value.length; index++) {
          if (!requirementResults[index]) {
            const item = dataset.value[index];
            _addIssue(this, 'item', dataset, config, {
              input: item,
              path: [
                {
                  type: 'array',
                  origin: 'value',
                  input: dataset.value,
                  key: index,
                  value: item,
                },
              ],
            });
          }
        }
      }
      return dataset;
    },
  };
}
