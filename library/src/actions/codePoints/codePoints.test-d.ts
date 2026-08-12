import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  codePoints,
  type CodePointsAction,
  type CodePointsIssue,
} from './codePoints.ts';

describe('codePoints', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = CodePointsAction<string, 10, undefined>;
      expectTypeOf(codePoints<string, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        codePoints<string, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        codePoints<string, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<CodePointsAction<string, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        codePoints<string, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<CodePointsAction<string, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Input = 'example string';
    type Action = CodePointsAction<Input, 5, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        CodePointsIssue<Input, 5>
      >();
    });
  });
});
