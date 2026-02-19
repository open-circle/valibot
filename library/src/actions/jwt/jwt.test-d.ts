import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { jwt, type JwtAction, type JwtIssue } from './jwt.ts';

describe('jwt', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = JwtAction<string, undefined>;
      expectTypeOf(jwt<string>()).toEqualTypeOf<Action>();
      expectTypeOf(jwt<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(jwt<string, 'message'>('message')).toEqualTypeOf<
        JwtAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(jwt<string, () => string>(() => 'message')).toEqualTypeOf<
        JwtAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = JwtAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<JwtIssue<string>>();
    });
  });
});
