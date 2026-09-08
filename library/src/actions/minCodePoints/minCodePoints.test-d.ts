import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  minCodePoints,
  type MinCodePointsAction,
  type MinCodePointsIssue,
} from './minCodePoints.ts';

describe('minCodePoints', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = MinCodePointsAction<string, 10, undefined>;
      expectTypeOf(minCodePoints<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        minCodePoints<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        minCodePoints<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<MinCodePointsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        minCodePoints<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<MinCodePointsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = MinCodePointsAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        MinCodePointsIssue<Input, 10>
      >();
    });
  });
});
