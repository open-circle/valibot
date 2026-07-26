import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  jwsCompact,
  type JwsCompactAction,
  type JwsCompactIssue,
} from './jwsCompact.ts';

describe('jwsCompact', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = JwsCompactAction<string, undefined>;
      expectTypeOf(jwsCompact<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        jwsCompact<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(jwsCompact<string, 'message'>('message')).toEqualTypeOf<
        JwsCompactAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        jwsCompact<string, () => string>(() => 'message')
      ).toEqualTypeOf<JwsCompactAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = JwsCompactAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        JwsCompactIssue<string>
      >();
    });
  });
});
