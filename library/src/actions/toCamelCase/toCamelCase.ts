import type { BaseTransformation } from '../../types/index.ts';
import { _caseWords } from '../../utils/index.ts';

/**
 * To camel case action interface.
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
 * @returns A to camel case action.
 */
// @__NO_SIDE_EFFECTS__
export function toCamelCase(): ToCamelCaseAction {
  return {
    kind: 'transformation',
    type: 'to_camel_case',
    reference: toCamelCase,
    async: false,
    '~run'(dataset) {
      dataset.value = _caseWords(dataset.value)
        .map((word, i) =>
          i === 0 ? word : word[0].toUpperCase() + word.slice(1)
        )
        .join('');
      return dataset;
    },
  };
}
