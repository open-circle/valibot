import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  minDigitChars,
  type MinDigitCharsAction,
  type MinDigitCharsIssue,
} from './minDigitChars.ts';

describe('minDigitChars', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = MinDigitCharsAction<string, 10, undefined>;
      expectTypeOf(minDigitChars<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        minDigitChars<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        minDigitChars<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<MinDigitCharsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        minDigitChars<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<MinDigitCharsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = MinDigitCharsAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        MinDigitCharsIssue<Input, 10>
      >();
    });
  });
});
