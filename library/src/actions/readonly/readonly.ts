import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

/**
 * Readonly output type.
 */
type ReadonlyOutput<TInput> =
  TInput extends Map<infer TKey, infer TValue>
    ? ReadonlyMap<TKey, TValue>
    : TInput extends Set<infer TValue>
      ? ReadonlySet<TValue>
      : Readonly<TInput>;

/**
 * Readonly action interface.
 */
export interface ReadonlyAction<TInput>
  extends BaseTransformation<TInput, ReadonlyOutput<TInput>, never> {
  /**
   * The action type.
   */
  readonly type: 'readonly';
  /**
   * The action reference.
   */
  readonly reference: typeof readonly;
}

/**
 * Creates a readonly transformation action.
 *
 * @returns A readonly action.
 */
export function readonly<TInput>(): ReadonlyAction<TInput>;

// @__NO_SIDE_EFFECTS__
export function readonly(): ReadonlyAction<unknown> {
  return {
    kind: 'transformation',
    type: 'readonly',
    reference: readonly,
    async: false,
    '~run'(dataset) {
      return dataset as SuccessDataset<Readonly<unknown>>;
    },
  };
}
