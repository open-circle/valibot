import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  formDataEntries,
  type FormDataEntries,
  type FormDataEntriesAction,
} from './formDataEntries.ts';

describe('formDataEntries', () => {
  describe('should return action object', () => {
    test('without multi keys', () => {
      expectTypeOf(formDataEntries()).toEqualTypeOf<
        FormDataEntriesAction<undefined>
      >();
    });

    test('with multi keys', () => {
      expectTypeOf(formDataEntries(['foo', 'bar'])).toEqualTypeOf<
        FormDataEntriesAction<readonly ['foo', 'bar']>
      >();
    });
  });

  describe('should infer correct types', () => {
    describe('without multi keys', () => {
      type Action = FormDataEntriesAction<undefined>;

      test('of input', () => {
        expectTypeOf<InferInput<Action>>().toEqualTypeOf<FormData>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Action>>().toEqualTypeOf<FormDataEntries>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Action>>().toEqualTypeOf<never>();
      });
    });
    describe('with multi keys', () => {
      type Action = FormDataEntriesAction<readonly ['foo', 'bar']>;

      test('of input', () => {
        expectTypeOf<InferInput<Action>>().toEqualTypeOf<FormData>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Action>>().toEqualTypeOf<
          FormDataEntries & {
            foo: FormDataEntryValue[];
            bar: FormDataEntryValue[];
          }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Action>>().toEqualTypeOf<never>();
      });
    });
  });
});
