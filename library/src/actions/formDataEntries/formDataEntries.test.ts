import { describe, expect, test } from 'vitest';
import {
  formDataEntries,
  type FormDataEntriesAction,
} from './formDataEntries.ts';

describe('formDataEntries', () => {
  describe('should return action object', () => {
    test('without multi keys', () => {
      expect(formDataEntries()).toStrictEqual({
        kind: 'transformation',
        type: 'form_data_entries',
        reference: formDataEntries,
        async: false,
        multiKeys: undefined,
        '~run': expect.any(Function),
      } satisfies FormDataEntriesAction<undefined>);
    });

    test('with multi keys', () => {
      expect(formDataEntries(['foo', 'bar'])).toStrictEqual({
        kind: 'transformation',
        type: 'form_data_entries',
        reference: formDataEntries,
        async: false,
        multiKeys: ['foo', 'bar'],
        '~run': expect.any(Function),
      } satisfies FormDataEntriesAction<readonly ['foo', 'bar']>);
    });
  });

  test('should transform form data', () => {
    const file = new File(['foo'], 'foo.txt');
    const formData = new FormData();
    formData.append('single', 'foo');
    formData.append('forceMulti', 'bar');
    formData.append('multi', 'quux');
    formData.append('multi', file);
    expect(
      formDataEntries(['forceMulti'])['~run'](
        { typed: true, value: formData },
        {}
      )
    ).toStrictEqual({
      typed: true,
      value: {
        single: 'foo',
        forceMulti: ['bar'],
        multi: ['quux', file],
      },
    });
  });
});
