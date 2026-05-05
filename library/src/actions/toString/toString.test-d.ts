import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  toString,
  type ToStringAction,
  type ToStringIssue,
} from './toString.ts';

describe('toString', () => {
  test('should return action object', () => {
    expectTypeOf(toString<'foo'>()).toEqualTypeOf<
      ToStringAction<'foo', undefined>
    >();
  });

  describe('should infer correct types', () => {
    type Action = ToStringAction<'foo', undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<'foo'>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<ToStringIssue<'foo'>>();
    });
  });
});
