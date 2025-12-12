import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { isrc, type IsrcAction, type IsrcIssue } from './isrc.ts';

describe('isrc', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = IsrcAction<string, undefined>;
      expectTypeOf(isrc()).toEqualTypeOf<Action>();
      expectTypeOf(isrc(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(isrc('message')).toEqualTypeOf<
        IsrcAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(isrc(() => 'message')).toEqualTypeOf<
        IsrcAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = IsrcAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<IsrcIssue<string>>();
    });
  });
});
