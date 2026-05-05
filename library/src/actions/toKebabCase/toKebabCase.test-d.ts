import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { toKebabCase, type ToKebabCaseAction } from './toKebabCase.ts';

describe('toKebabCase', () => {
  test('should return action object', () => {
    expectTypeOf(toKebabCase()).toEqualTypeOf<ToKebabCaseAction>();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<ToKebabCaseAction>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<ToKebabCaseAction>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<ToKebabCaseAction>>().toEqualTypeOf<never>();
    });
  });
});
