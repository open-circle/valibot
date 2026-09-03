import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { trimmed, type TrimmedAction, type TrimmedIssue } from './trimmed.ts';

describe('trimmed', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = TrimmedAction<string, undefined>;
      expectTypeOf(trimmed()).toEqualTypeOf<Action>();
      expectTypeOf(trimmed(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(trimmed('message')).toEqualTypeOf<
        TrimmedAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(trimmed(() => 'message')).toEqualTypeOf<
        TrimmedAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = TrimmedAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<TrimmedIssue<string>>();
    });
  });
});
