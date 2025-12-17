import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { isbn, type IsbnAction, type IsbnIssue } from './isbn.ts';

describe('isbn', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = IsbnAction<string, undefined>;
      expectTypeOf(isbn<string>()).toEqualTypeOf<Action>();
      expectTypeOf(isbn<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(isbn<string, 'message'>('message')).toEqualTypeOf<
        IsbnAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(isbn<string, () => string>(() => 'message')).toEqualTypeOf<
        IsbnAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = IsbnAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<IsbnIssue<string>>();
    });
  });
});
