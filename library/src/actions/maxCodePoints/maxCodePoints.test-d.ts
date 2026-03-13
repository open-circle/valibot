import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  maxCodePoints,
  type MaxCodePointsAction,
  type MaxCodePointsIssue,
} from './maxCodePoints.ts';

describe('maxCodePoints', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = MaxCodePointsAction<string, 10, undefined>;
      expectTypeOf(maxCodePoints<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        maxCodePoints<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        maxCodePoints<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<MaxCodePointsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        maxCodePoints<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<MaxCodePointsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = MaxCodePointsAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        MaxCodePointsIssue<Input, 10>
      >();
    });
  });
});
