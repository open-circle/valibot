import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  toBigint,
  type ToBigintAction,
  type ToBigintIssue,
} from './toBigint.ts';

describe('toBigint', () => {
  describe('should return action object', () => {
    test('without message', () => {
      expectTypeOf(toBigint<bigint>()).toEqualTypeOf<
        ToBigintAction<bigint, undefined>
      >();
    });

    test('with message', () => {
      expectTypeOf(toBigint<bigint, 'message'>('message')).toEqualTypeOf<
        ToBigintAction<bigint, 'message'>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = ToBigintAction<'123', undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<'123'>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<bigint>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<ToBigintIssue<'123'>>();
    });
  });
});
