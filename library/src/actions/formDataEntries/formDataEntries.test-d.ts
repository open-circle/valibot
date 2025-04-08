import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  formDataEntries,
  type FormDataEntries,
  type FormDataEntriesAction,
} from './formDataEntries.ts';

describe('formDataEntries', () => {
  test('should return action object', () => {
    expectTypeOf(formDataEntries()).toEqualTypeOf<FormDataEntriesAction>();
  });

  describe('should infer correct types', () => {
    type Action = FormDataEntriesAction;

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
});
