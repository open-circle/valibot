import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { toCamelCase, type ToCamelCaseAction } from './toCamelCase.ts';

describe('toCamelCase', () => {
  test('should return action object', () => {
    expectTypeOf(toCamelCase()).toEqualTypeOf<ToCamelCaseAction>();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<ToCamelCaseAction>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<ToCamelCaseAction>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<ToCamelCaseAction>>().toEqualTypeOf<never>();
    });
  });
});
