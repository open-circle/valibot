import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { toPascalCase, type ToPascalCaseAction } from './toPascalCase.ts';

describe('toPascalCase', () => {
  test('should return action object', () => {
    expectTypeOf(toPascalCase()).toEqualTypeOf<ToPascalCaseAction>();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<ToPascalCaseAction>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<ToPascalCaseAction>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<ToPascalCaseAction>>().toEqualTypeOf<never>();
    });
  });
});
