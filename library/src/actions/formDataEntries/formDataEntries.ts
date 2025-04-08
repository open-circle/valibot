import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

export interface FormDataEntries {
  [key: string]: FormDataEntryValue | FormDataEntryValue[];
}

export interface FormDataEntriesAction
  extends BaseTransformation<FormData, FormDataEntries, never> {
  /**
   * The transformation type.
   */
  readonly type: 'form_data_entries';
  /**
   * The transformation reference.
   */
  readonly reference: typeof formDataEntries;
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
export function formDataEntries(): FormDataEntriesAction {
  return {
    kind: 'transformation',
    type: 'form_data_entries',
    reference: formDataEntries,
    async: false,
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
          entries[key] = value;
        }
      }
      // @ts-expect-error
      dataset.value = entries;
      // @ts-expect-error
      return dataset as SuccessDataset<FormDataEntries>;
    },
  };
}
