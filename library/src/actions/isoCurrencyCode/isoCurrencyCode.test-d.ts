import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  isoCurrencyCode,
  type IsoCurrencyCodeAction,
  type IsoCurrencyCodeIssue,
} from './isoCurrencyCode.ts';

describe('isoCurrencyCode', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = IsoCurrencyCodeAction<string, undefined>;
      expectTypeOf(isoCurrencyCode<string>()).toEqualTypeOf<Action>();
      expectTypeOf(isoCurrencyCode<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(isoCurrencyCode<string, 'message'>('message')).toEqualTypeOf<
        IsoCurrencyCodeAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        isoCurrencyCode<string, () => string>(() => 'message')
      ).toEqualTypeOf<IsoCurrencyCodeAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = IsoCurrencyCodeAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<IsoCurrencyCodeIssue<string>>();
    });
  });
});
