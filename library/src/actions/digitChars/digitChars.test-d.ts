import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  digitChars,
  type DigitCharsAction,
  type DigitCharsIssue,
} from './digitChars.ts';

describe('digitChars', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = DigitCharsAction<string, 10, undefined>;
      expectTypeOf(digitChars<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        digitChars<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        digitChars<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<DigitCharsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        digitChars<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<DigitCharsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = DigitCharsAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        DigitCharsIssue<Input, 10>
      >();
    });
  });
});
