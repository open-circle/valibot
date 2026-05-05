import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { toBoolean, type ToBooleanAction } from './toBoolean.ts';

describe('toBoolean', () => {
  test('should return action object', () => {
    expectTypeOf(toBoolean<'foo'>()).toEqualTypeOf<ToBooleanAction<'foo'>>();
  });

  describe('should infer correct types', () => {
    type Action = ToBooleanAction<'foo'>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<'foo'>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<boolean>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<never>();
    });
  });
});
