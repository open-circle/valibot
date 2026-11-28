import type {
  BaseTransformationAsync,
  SuccessDataset,
} from '../../types/index.ts';

/**
 * Transform action async interface.
 */
export interface TransformActionAsync<
  TInput,
  TOutput,
> extends BaseTransformationAsync<TInput, TOutput, never> {
  /**
   * The action type.
   */
  readonly type: 'transform';
  /**
   * The action reference.
   */
  readonly reference: typeof transformAsync;
  /**
   * The transformation operation.
   */
  readonly operation: (input: TInput) => Promise<TOutput>;
}

/**
 * Creates a custom transformation action.
 *
 * @param operation The transformation operation.
 *
 * @returns A transform action.
 */
// @__NO_SIDE_EFFECTS__
export function transformAsync<TInput, TOutput>(
  operation: (input: TInput) => Promise<TOutput>
): TransformActionAsync<TInput, TOutput> {
  return {
    kind: 'transformation',
    type: 'transform',
    reference: transformAsync,
    async: true,
    operation,
    async '~run'(dataset) {
      // @ts-expect-error
      dataset.value = await this.operation(dataset.value);
      // @ts-expect-error
      return dataset as SuccessDataset<TOutput>;
    },
  };
}
