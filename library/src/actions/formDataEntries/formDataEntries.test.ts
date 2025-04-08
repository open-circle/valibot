import { describe, expect, test } from 'vitest';
import {
  formDataEntries,
  type FormDataEntriesAction,
} from './formDataEntries.ts';

describe('formDataEntries', () => {
  test('should return action object', () => {
    expect(formDataEntries()).toStrictEqual({
      kind: 'transformation',
      type: 'form_data_entries',
      reference: formDataEntries,
      async: false,
      '~run': expect.any(Function),
    } satisfies FormDataEntriesAction);
  });

  test('should transform form data', () => {
    const file = new File(['foo'], 'foo.txt');
    const formData = new FormData();
    formData.append('foo', 'bar');
    formData.append('foo', 'baz');
    formData.append('qux', 'quux');
    formData.append('quux', file);
    expect(
      formDataEntries()['~run']({ typed: true, value: formData }, {})
    ).toStrictEqual({
      typed: true,
      value: {
        foo: ['bar', 'baz'],
        qux: 'quux',
        quux: file,
      },
    });
  });
});
