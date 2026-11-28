import type { BaseTransformation } from '../../types/index.ts';

/**
 * Trim end action interface.
 */
export interface TrimEndAction extends BaseTransformation<
  string,
  string,
  never
> {
  /**
   * The action type.
   */
  readonly type: 'trim_end';
  /**
   * The action reference.
   */
  readonly reference: typeof trimEnd;
}

/**
 * Creates a trim end transformation action.
 *
 * @returns A trim end action.
 */
// @__NO_SIDE_EFFECTS__
export function trimEnd(): TrimEndAction {
  return {
    kind: 'transformation',
    type: 'trim_end',
    reference: trimEnd,
    async: false,
    '~run'(dataset) {
      dataset.value = dataset.value.trimEnd();
      return dataset;
    },
  };
}
