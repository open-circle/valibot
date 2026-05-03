import type { BaseTransformation } from '../../types/index.ts';
import { _caseWords } from '../../utils/index.ts';

/**
 * To snake case action interface.
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
 * @returns A to snake case action.
 */
// @__NO_SIDE_EFFECTS__
export function toSnakeCase(): ToSnakeCaseAction {
  return {
    kind: 'transformation',
    type: 'to_snake_case',
    reference: toSnakeCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _caseWords(dataset.value).join('_');
      return dataset;
    },
  };
}
