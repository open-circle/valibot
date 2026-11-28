import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

/**
 * Transform action interface.
 */
export interface TransformAction<TInput, TOutput> extends BaseTransformation<
  TInput,
  TOutput,
  never
> {
  /**
   * The action type.
   */
  readonly type: 'transform';
  /**
   * The action reference.
   */
  readonly reference: typeof transform;
  /**
   * The transformation operation.
   */
  readonly operation: (input: TInput) => TOutput;
}

/**
 * Creates a custom transformation action.
 *
 * @param operation The transformation operation.
 *
 * @returns A transform action.
 */
// @__NO_SIDE_EFFECTS__
export function transform<TInput, TOutput>(
  operation: (input: TInput) => TOutput
): TransformAction<TInput, TOutput> {
  return {
    kind: 'transformation',
    type: 'transform',
    reference: transform,
    async: false,
    operation,
    '~run'(dataset) {
      // @ts-expect-error
      dataset.value = this.operation(dataset.value);
      // @ts-expect-error
      return dataset as SuccessDataset<TOutput>;
    },
  };
}
