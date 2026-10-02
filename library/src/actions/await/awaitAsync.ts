import type {
  BaseTransformationAsync,
  SuccessDataset,
} from '../../types/index.ts';

/**
 * Await action async interface.
 */
export interface AwaitActionAsync<
  TInput extends Promise<unknown>,
> extends BaseTransformationAsync<TInput, Awaited<TInput>, never> {
  /**
   * The action type.
   */
  readonly type: 'await';
  /**
   * The action reference.
   */
  readonly reference: typeof awaitAsync;
}

/**
 * Creates an await transformation action.
 *
 * @returns An await action.
 */
// @__NO_SIDE_EFFECTS__
export function awaitAsync<
  TInput extends Promise<unknown>,
>(): AwaitActionAsync<TInput> {
  return {
    kind: 'transformation',
    type: 'await',
    reference: awaitAsync,
    async: true,
    async '~run'(dataset) {
      dataset.value = await dataset.value;
      return dataset as SuccessDataset<Awaited<TInput>>;
    },
  };
}
