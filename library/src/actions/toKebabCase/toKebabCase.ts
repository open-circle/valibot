import type { BaseTransformation } from '../../types/index.ts';
import { _caseWords } from '../../utils/index.ts';

/**
 * To kebab case action interface.
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
 * @returns A to kebab case action.
 */
// @__NO_SIDE_EFFECTS__
export function toKebabCase(): ToKebabCaseAction {
  return {
    kind: 'transformation',
    type: 'to_kebab_case',
    reference: toKebabCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _caseWords(dataset.value).join('-');
      return dataset;
    },
  };
}
