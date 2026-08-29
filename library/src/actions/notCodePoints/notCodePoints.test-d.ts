import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  notCodePoints,
  type NotCodePointsAction,
  type NotCodePointsIssue,
} from './notCodePoints.ts';

describe('notCodePoints', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = NotCodePointsAction<string, 10, undefined>;
      expectTypeOf(notCodePoints<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        notCodePoints<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        notCodePoints<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<NotCodePointsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        notCodePoints<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<NotCodePointsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = NotCodePointsAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        NotCodePointsIssue<Input, 10>
      >();
    });
  });
});
