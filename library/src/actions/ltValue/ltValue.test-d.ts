import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { ltValue, type LtValueAction, type LtValueIssue } from './ltValue.ts';

describe('ltValue', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = LtValueAction<number, 10, undefined>;
      expectTypeOf(ltValue<number, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        ltValue<number, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(ltValue<number, 10, 'message'>(10, 'message')).toEqualTypeOf<
        LtValueAction<number, 10, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        ltValue<number, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<LtValueAction<number, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = LtValueAction<number, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<number>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<number>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        LtValueIssue<number, 10>
      >();
    });
  });
});
