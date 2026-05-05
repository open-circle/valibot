import type { BaseTransformation } from '../../types/index.ts';
import { _formatCase } from '../../utils/index.ts';

/**
 * To camel case action interface.
 *
 * @beta
 */
export interface ToCamelCaseAction
  extends BaseTransformation<string, string, never> {
  /**
   * The action type.
   */
  readonly type: 'to_camel_case';
  /**
   * The action reference.
   */
  readonly reference: typeof toCamelCase;
}

/**
 * Creates a to camel case transformation action.
 *
 * Words are separated by `_`, `-` and ASCII whitespace, as well as by case
 * and acronym boundaries.
 *
 * Hint: Acronym runs are normalized to lowercase (e.g. `parseURLValue` →
 * `parseUrlValue`).
 *
 * Hint: Digits stay attached to the preceding token (e.g. `item2Name` →
 * `item2Name`).
 *
 * @returns A to camel case action.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function toCamelCase(): ToCamelCaseAction {
  return {
    kind: 'transformation',
    type: 'to_camel_case',
    reference: toCamelCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _formatCase(dataset.value, '', false, true);
      return dataset;
    },
  };
}
