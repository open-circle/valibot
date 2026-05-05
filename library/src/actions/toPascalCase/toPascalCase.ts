import type { BaseTransformation } from '../../types/index.ts';
import { _formatCase } from '../../utils/index.ts';

/**
 * To pascal case action interface.
 *
 * @beta
 */
export interface ToPascalCaseAction
  extends BaseTransformation<string, string, never> {
  /**
   * The action type.
   */
  readonly type: 'to_pascal_case';
  /**
   * The action reference.
   */
  readonly reference: typeof toPascalCase;
}

/**
 * Creates a to pascal case transformation action.
 *
 * Words are separated by `_`, `-` and ASCII whitespace, as well as by case
 * and acronym boundaries.
 *
 * Hint: Acronym runs are normalized to lowercase (e.g. `parseURLValue` →
 * `ParseUrlValue`).
 *
 * Hint: Digits stay attached to the preceding token (e.g. `item2Name` →
 * `Item2Name`).
 *
 * @returns A to pascal case action.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function toPascalCase(): ToPascalCaseAction {
  return {
    kind: 'transformation',
    type: 'to_pascal_case',
    reference: toPascalCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _formatCase(dataset.value, '', true, true);
      return dataset;
    },
  };
}
