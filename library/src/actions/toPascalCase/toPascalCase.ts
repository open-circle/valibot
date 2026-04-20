import type { BaseTransformation } from '../../types/index.ts';
import { _caseWords } from '../../utils/index.ts';

/**
 * To pascal case action interface.
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
 * @returns A to pascal case action.
 */
// @__NO_SIDE_EFFECTS__
export function toPascalCase(): ToPascalCaseAction {
  return {
    kind: 'transformation',
    type: 'to_pascal_case',
    reference: toPascalCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _caseWords(dataset.value)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join('');
      return dataset;
    },
  };
}
