import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  nonTrimmed,
  type NonTrimmedAction,
  type NonTrimmedIssue,
} from './nonTrimmed.ts';

describe('nonTrimmed', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = NonTrimmedAction<string, undefined>;
      expectTypeOf(nonTrimmed()).toEqualTypeOf<Action>();
      expectTypeOf(nonTrimmed(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(nonTrimmed('message')).toEqualTypeOf<
        NonTrimmedAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(nonTrimmed(() => 'message')).toEqualTypeOf<
        NonTrimmedAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = NonTrimmedAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        NonTrimmedIssue<string>
      >();
    });
  });
});
