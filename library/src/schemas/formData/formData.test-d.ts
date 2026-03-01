import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  formData,
  type FormDataIssue,
  type FormDataSchema,
} from './formData.ts';

describe('formData', () => {
  describe('should return schema object', () => {
    test('with undefined message', () => {
      type Schema = FormDataSchema<undefined>;
      expectTypeOf(formData()).toEqualTypeOf<Schema>();
      expectTypeOf(formData(undefined)).toEqualTypeOf<Schema>();
    });

    test('with string message', () => {
      expectTypeOf(formData('message')).toEqualTypeOf<
        FormDataSchema<'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(formData(() => 'message')).toEqualTypeOf<
        FormDataSchema<() => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Schema = FormDataSchema<undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Schema>>().toEqualTypeOf<FormData>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<FormData>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<FormDataIssue>();
    });
  });
});
