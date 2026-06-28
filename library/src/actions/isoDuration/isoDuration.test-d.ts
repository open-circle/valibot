import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  isoDuration,
  type IsoDurationAction,
  type IsoDurationIssue,
} from './isoDuration.ts';

describe('isoDuration', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = IsoDurationAction<string, undefined>;
      expectTypeOf(isoDuration<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        isoDuration<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(isoDuration<string, 'message'>('message')).toEqualTypeOf<
        IsoDurationAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        isoDuration<string, () => string>(() => 'message')
      ).toEqualTypeOf<IsoDurationAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = IsoDurationAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        IsoDurationIssue<string>
      >();
    });
  });
});
