import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  maxDigitChars,
  type MaxDigitCharsAction,
  type MaxDigitCharsIssue,
} from './maxDigitChars.ts';

describe('maxDigitChars', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = MaxDigitCharsAction<string, 10, undefined>;
      expectTypeOf(maxDigitChars<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        maxDigitChars<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        maxDigitChars<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<MaxDigitCharsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        maxDigitChars<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<MaxDigitCharsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = MaxDigitCharsAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        MaxDigitCharsIssue<Input, 10>
      >();
    });
  });
});
