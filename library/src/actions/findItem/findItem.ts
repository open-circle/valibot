import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';
import type { ArrayInput, ArrayRequirement } from '../types.ts';

/**
 * Find item action interface.
 */
export interface FindItemAction<
  TInput extends ArrayInput,
  TOuput extends TInput[number],
> extends BaseTransformation<TInput, TOuput | undefined, never> {
  /**
   * The action type.
   */
  readonly type: 'find_item';
  /**
   * The action reference.
   */
  readonly reference: typeof findItem;
  /**
   * The find item operation.
   */
  readonly operation: ArrayRequirement<TInput, TOuput>;
}

/**
 * Creates a find item transformation action.
 *
 * @param operation The find item operation.
 *
 * @returns A find item action.
 */
export function findItem<
  TInput extends ArrayInput,
  TOuput extends TInput[number],
>(operation: ArrayRequirement<TInput, TOuput>): FindItemAction<TInput, TOuput>;

// @__NO_SIDE_EFFECTS__
export function findItem(
  operation: ArrayRequirement<unknown[], unknown>
): FindItemAction<unknown[], unknown> {
  return {
    kind: 'transformation',
    type: 'find_item',
    reference: findItem,
    async: false,
    operation,
    '~run'(dataset) {
      // @ts-expect-error
      dataset.value = dataset.value.find(this.operation);
      return dataset as SuccessDataset<unknown | undefined>;
    },
  };
}
