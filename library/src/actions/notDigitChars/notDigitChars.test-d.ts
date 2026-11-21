import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  notDigitChars,
  type NotDigitCharsAction,
  type NotDigitCharsIssue,
} from './notDigitChars.ts';

describe('notDigitChars', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = NotDigitCharsAction<string, 10, undefined>;
      expectTypeOf(notDigitChars<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        notDigitChars<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        notDigitChars<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<NotDigitCharsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        notDigitChars<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<NotDigitCharsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = NotDigitCharsAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        NotDigitCharsIssue<Input, 10>
      >();
    });
  });
});
