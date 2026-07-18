import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

/**
 * To boolean action interface.
 */
export interface ToBooleanAction<TInput>
  extends BaseTransformation<TInput, boolean, never> {
  /**
   * The action type.
   */
  readonly type: 'to_boolean';
  /**
   * The action reference.
   */
  readonly reference: typeof toBoolean;
}

/**
 * Creates a to boolean transformation action.
 *
 * @returns A to boolean action.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function toBoolean<TInput>(): ToBooleanAction<TInput> {
  return {
    kind: 'transformation',
    type: 'to_boolean',
    reference: toBoolean,
    async: false,
    '~run'(dataset) {
      // @ts-expect-error
      dataset.value = Boolean(dataset.value);
      return dataset as SuccessDataset<boolean>;
    },
  };
}
