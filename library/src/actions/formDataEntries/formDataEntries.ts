import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

export interface FormDataEntries {
  [key: string]: FormDataEntryValue | FormDataEntryValue[];
}

export type FormDataMultiKeys<
  TMultiKeys extends readonly string[] | undefined,
> = TMultiKeys extends readonly string[]
  ? { [TKey in TMultiKeys[number]]?: FormDataEntryValue[] }
  : unknown;

export interface FormDataEntriesAction<
  TMultiKeys extends readonly string[] | undefined,
> extends BaseTransformation<
    FormData,
    FormDataEntries & FormDataMultiKeys<TMultiKeys>,
    never
  > {
  /**
   * The transformation type.
   */
  readonly type: 'form_data_entries';
  /**
   * The transformation reference.
   */
  readonly reference: typeof formDataEntries;

  /**
   * The keys that have multiple values.
   */
  readonly multiKeys: TMultiKeys;
}

/**
 * Creates a transformation action that converts a `FormData` instance to an
 * object with `FormDataEntryValue` values. If a key has multiple values, the
 * values are returned as an array.
 *
 * For more complex uses, consider {@link https://github.com/fabian-hiller/decode-formdata decode-formdata}.
 *
 * @returns A transformation action.
 */
export function formDataEntries(): FormDataEntriesAction<undefined>;
/**
 * Creates a transformation action that converts a `FormData` instance to an
 * object with `FormDataEntryValue` values. If a key has multiple values, or is in `multiKeys`, the
 * values are returned as an array.
 *
 * For more complex uses, consider {@link https://github.com/fabian-hiller/decode-formdata decode-formdata}.
 *
 * @param multiKeys The keys that have multiple values.
 *
 * @returns A transformation action.
 */
export function formDataEntries<const TMultiKeys extends readonly string[]>(
  multiKeys: TMultiKeys
): FormDataEntriesAction<TMultiKeys>;
export function formDataEntries(
  multiKeys?: string[]
): FormDataEntriesAction<string[] | undefined> {
  return {
    kind: 'transformation',
    type: 'form_data_entries',
    reference: formDataEntries,
    async: false,
    multiKeys,
    '~run'(dataset) {
      const entries: FormDataEntries = {};
      for (const [key, value] of dataset.value.entries()) {
        if (entries[key]) {
          if (Array.isArray(entries[key])) {
            entries[key].push(value);
          } else {
            entries[key] = [entries[key], value];
          }
        } else {
          entries[key] = multiKeys?.includes(key) ? [value] : value;
        }
      }
      // @ts-expect-error
      dataset.value = entries;
      // @ts-expect-error
      return dataset as SuccessDataset<FormDataEntries>;
    },
  };
}
