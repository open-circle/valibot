import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  base64Url,
  type Base64UrlAction,
  type Base64UrlIssue,
} from './base64Url.ts';

describe('base64Url', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = Base64UrlAction<string, undefined>;
      expectTypeOf(base64Url<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        base64Url<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(base64Url<string, 'message'>('message')).toEqualTypeOf<
        Base64UrlAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        base64Url<string, () => string>(() => 'message')
      ).toEqualTypeOf<Base64UrlAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = Base64UrlAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        Base64UrlIssue<string>
      >();
    });
  });
});
