import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  rfc3339Duration,
  type Rfc3339DurationAction,
  type Rfc3339DurationIssue,
} from './rfc3339Duration.ts';

describe('rfc3339Duration', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = Rfc3339DurationAction<string, undefined>;
      expectTypeOf(rfc3339Duration<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        rfc3339Duration<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(rfc3339Duration<string, 'message'>('message')).toEqualTypeOf<
        Rfc3339DurationAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        rfc3339Duration<string, () => string>(() => 'message')
      ).toEqualTypeOf<Rfc3339DurationAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = Rfc3339DurationAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        Rfc3339DurationIssue<string>
      >();
    });
  });
});
