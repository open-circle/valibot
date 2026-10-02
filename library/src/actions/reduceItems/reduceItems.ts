import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';
import type { ArrayInput } from '../types.ts';

/**
 * Array action type.
 */
type ArrayAction<TInput extends ArrayInput, TOutput> = (
  output: TOutput,
  item: TInput[number],
  index: number,
  array: TInput
) => TOutput;

/**
 * Reduce items action interface.
 */
export interface ReduceItemsAction<
  TInput extends ArrayInput,
  TOutput,
> extends BaseTransformation<TInput, TOutput, never> {
  /**
   * The action type.
   */
  readonly type: 'reduce_items';
  /**
   * The action reference.
   */
  readonly reference: typeof reduceItems;
  /**
   * The reduce items operation.
   */
  readonly operation: ArrayAction<TInput, TOutput>;
  /**
   * The initial value.
   */
  readonly initial: TOutput;
}

/**
 * Creates a reduce items transformation action.
 *
 * @param operation The reduce items operation.
 * @param initial The initial value.
 *
 * @returns A reduce items action.
 */
export function reduceItems<TInput extends ArrayInput, TOutput>(
  operation: ArrayAction<TInput, TOutput>,
  initial: TOutput
): ReduceItemsAction<TInput, TOutput>;

// @__NO_SIDE_EFFECTS__
export function reduceItems(
  operation: ArrayAction<unknown[], unknown>,
  initial: unknown
): ReduceItemsAction<unknown[], unknown> {
  return {
    kind: 'transformation',
    type: 'reduce_items',
    reference: reduceItems,
    async: false,
    operation,
    initial,
    '~run'(dataset) {
      // @ts-expect-error
      dataset.value = dataset.value.reduce(this.operation, this.initial);
      return dataset as SuccessDataset<unknown>;
    },
  };
}
