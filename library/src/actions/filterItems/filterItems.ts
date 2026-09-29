import type { BaseTransformation } from '../../types/index.ts';
import type { ArrayInput, ArrayRequirement } from '../types.ts';

/**
 * Filter items action interface.
 */
export interface FilterItemsAction<
  TInput extends ArrayInput,
  TOutput extends ArrayInput = TInput,
> extends BaseTransformation<TInput, TOutput, never> {
  /**
   * The action type.
   */
  readonly type: 'filter_items';
  /**
   * The action reference.
   */
  readonly reference: typeof filterItems;
  /**
   * The filter items operation.
   */
  readonly operation: ArrayRequirement<TInput>;
}

/**
 * Creates a filter items transformation action.
 *
 * @param operation The filter items operation.
 *
 * @returns A filter items action.
 */
export function filterItems<
  TInput extends ArrayInput,
  TOutput extends TInput[number],
>(
  operation: (
    item: TInput[number],
    index: number,
    array: TInput
  ) => item is TOutput
): FilterItemsAction<TInput, TOutput[]>;

export function filterItems<TInput extends ArrayInput>(
  operation: (
    item: TInput[number],
    index: number,
    array: TInput
  ) => boolean
): FilterItemsAction<TInput, TInput>;

// @__NO_SIDE_EFFECTS__
export function filterItems(
  operation: ArrayRequirement<unknown[]>
): FilterItemsAction<unknown[]> {
  return {
    kind: 'transformation',
    type: 'filter_items',
    reference: filterItems,
    async: false,
    operation,
    '~run'(dataset) {
      dataset.value = dataset.value.filter(this.operation);
      return dataset;
    },
  };
}
