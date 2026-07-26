import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { values, type ValuesAction, type ValuesIssue } from './values.ts';

describe('values', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = ValuesAction<number, [2, 4, 6], undefined>;
      expectTypeOf(
        values<number, [2, 4, 6]>([2, 4, 6])
      ).toEqualTypeOf<Action>();
      expectTypeOf(
        values<number, [2, 4, 6], undefined>([2, 4, 6], undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        values<number, [2, 4, 6], 'message'>([2, 4, 6], 'message')
      ).toEqualTypeOf<ValuesAction<number, [2, 4, 6], 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        values<number, [2, 4, 6], () => string>([2, 4, 6], () => 'message')
      ).toEqualTypeOf<ValuesAction<number, [2, 4, 6], () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = ValuesAction<number, [2, 4, 6], undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<number>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<number>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        ValuesIssue<number, [2, 4, 6]>
      >();
    });
  });
});
