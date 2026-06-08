import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

export interface CheckboxAction
  extends BaseTransformation<string, boolean, never> {
  /**
   * The transformation type.
   */
  readonly type: 'checkbox';
  /**
   * The transformation reference.
   */
  readonly reference: typeof checkbox;
}

/**
 * Creates a transformation action that converts a checkbox string (`"on"`) to a boolean.
 *
 * @returns A transformation action.
 */
export function checkbox(): CheckboxAction {
  return {
    kind: 'transformation',
    type: 'checkbox',
    reference: checkbox,
    async: false,
    '~run'(dataset) {
      // @ts-expect-error
      dataset.value = dataset.value === 'on';
      // @ts-expect-error
      return dataset as SuccessDataset<boolean>;
    },
  };
}
