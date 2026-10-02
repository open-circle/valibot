import type { BaseTransformation } from '../../types/index.ts';

/**
 * Normalize form type.
 */
export type NormalizeForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

/**
 * Normalize action interface.
 */
export interface NormalizeAction<
  TForm extends NormalizeForm | undefined,
> extends BaseTransformation<string, string, never> {
  /**
   * The action type.
   */
  readonly type: 'normalize';
  /**
   * The action reference.
   */
  readonly reference: typeof normalize;
  /**
   * The normalization form.
   */
  readonly form: TForm;
}

/**
 * Creates a normalize transformation action.
 *
 * @returns A normalize action.
 */
export function normalize(): NormalizeAction<undefined>;

/**
 * Creates a normalize transformation action.
 *
 * @param form The normalization form.
 *
 * @returns A normalize action.
 */
export function normalize<TForm extends NormalizeForm | undefined>(
  form: TForm
): NormalizeAction<TForm>;

// @__NO_SIDE_EFFECTS__
export function normalize(
  form?: NormalizeForm
): NormalizeAction<NormalizeForm | undefined> {
  return {
    kind: 'transformation',
    type: 'normalize',
    reference: normalize,
    async: false,
    form,
    '~run'(dataset) {
      dataset.value = dataset.value.normalize(this.form);
      return dataset;
    },
  };
}
