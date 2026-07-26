import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { toSnakeCase, type ToSnakeCaseAction } from './toSnakeCase.ts';

describe('toSnakeCase', () => {
  test('should return action object', () => {
    expectTypeOf(toSnakeCase()).toEqualTypeOf<ToSnakeCaseAction>();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<ToSnakeCaseAction>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<ToSnakeCaseAction>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<ToSnakeCaseAction>>().toEqualTypeOf<never>();
    });
  });
});
