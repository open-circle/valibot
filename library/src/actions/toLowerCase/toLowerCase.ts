import type { BaseTransformation } from '../../types/index.ts';

/**
 * To lower case action interface.
 */
export interface ToLowerCaseAction extends BaseTransformation<
  string,
  string,
  never
> {
  /**
   * The action type.
   */
  readonly type: 'to_lower_case';
  /**
   * The action reference.
   */
  readonly reference: typeof toLowerCase;
}

/**
 * Creates a to lower case transformation action.
 *
 * @returns A to lower case action.
 */
// @__NO_SIDE_EFFECTS__
export function toLowerCase(): ToLowerCaseAction {
  return {
    kind: 'transformation',
    type: 'to_lower_case',
    reference: toLowerCase,
    async: false,
    '~run'(dataset) {
      dataset.value = dataset.value.toLowerCase();
      return dataset;
    },
  };
}
