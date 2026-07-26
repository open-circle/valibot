import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { gtValue, type GtValueAction, type GtValueIssue } from './gtValue.ts';

describe('gtValue', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = GtValueAction<number, 10, undefined>;
      expectTypeOf(gtValue<number, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        gtValue<number, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(gtValue<number, 10, 'message'>(10, 'message')).toEqualTypeOf<
        GtValueAction<number, 10, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        gtValue<number, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<GtValueAction<number, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = GtValueAction<number, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<number>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<number>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        GtValueIssue<number, 10>
      >();
    });
  });
});
