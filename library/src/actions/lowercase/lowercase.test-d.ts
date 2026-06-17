import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  lowercase,
  type LowercaseAction,
  type LowercaseIssue,
} from './lowercase.ts';

describe('lowercase', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = LowercaseAction<string, undefined>;
      expectTypeOf(lowercase()).toEqualTypeOf<Action>();
      expectTypeOf(lowercase(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(lowercase('message')).toEqualTypeOf<
        LowercaseAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(lowercase(() => 'message')).toEqualTypeOf<
        LowercaseAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = LowercaseAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        LowercaseIssue<string>
      >();
    });
  });
});
