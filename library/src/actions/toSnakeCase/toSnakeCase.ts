import type { BaseTransformation } from '../../types/index.ts';
import { _formatCase } from '../../utils/index.ts';

/**
 * To snake case action interface.
 *
 * @beta
 */
export interface ToSnakeCaseAction
  extends BaseTransformation<string, string, never> {
  /**
   * The action type.
   */
  readonly type: 'to_snake_case';
  /**
   * The action reference.
   */
  readonly reference: typeof toSnakeCase;
}

/**
 * Creates a to snake case transformation action.
 *
 * Words are separated by `_`, `-` and ASCII whitespace, as well as by case
 * and acronym boundaries.
 *
 * Hint: Acronym runs are normalized to lowercase (e.g. `parseURLValue` →
 * `parse_url_value`).
 *
 * Hint: Digits stay attached to the preceding token (e.g. `item2Name` →
 * `item2_name`).
 *
 * @returns A to snake case action.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function toSnakeCase(): ToSnakeCaseAction {
  return {
    kind: 'transformation',
    type: 'to_snake_case',
    reference: toSnakeCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _formatCase(dataset.value, '_', false, false);
      return dataset;
    },
  };
}
