import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { checkbox, type CheckboxAction } from './checkbox.ts';

describe('checkbox', () => {
  test('should return action object', () => {
    expectTypeOf(checkbox()).toEqualTypeOf<CheckboxAction>();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<CheckboxAction>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<CheckboxAction>>().toEqualTypeOf<boolean>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<CheckboxAction>>().toEqualTypeOf<never>();
    });
  });
});
