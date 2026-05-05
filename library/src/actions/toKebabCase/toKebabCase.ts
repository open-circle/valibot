import type { BaseTransformation } from '../../types/index.ts';
import { _formatCase } from '../../utils/index.ts';

/**
 * To kebab case action interface.
 *
 * @beta
 */
export interface ToKebabCaseAction
  extends BaseTransformation<string, string, never> {
  /**
   * The action type.
   */
  readonly type: 'to_kebab_case';
  /**
   * The action reference.
   */
  readonly reference: typeof toKebabCase;
}

/**
 * Creates a to kebab case transformation action.
 *
 * Words are separated by `_`, `-` and ASCII whitespace, as well as by case
 * and acronym boundaries.
 *
 * Hint: Acronym runs are normalized to lowercase (e.g. `parseURLValue` →
 * `parse-url-value`).
 *
 * Hint: Digits stay attached to the preceding token (e.g. `item2Name` →
 * `item2-name`).
 *
 * @returns A to kebab case action.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function toKebabCase(): ToKebabCaseAction {
  return {
    kind: 'transformation',
    type: 'to_kebab_case',
    reference: toKebabCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _formatCase(dataset.value, '-', false, false);
      return dataset;
    },
  };
}
