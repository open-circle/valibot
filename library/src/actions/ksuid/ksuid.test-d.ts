import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { ksuid, type KsuidAction, type KsuidIssue } from './ksuid.ts';

describe('ksuid', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = KsuidAction<string, undefined>;
      expectTypeOf(ksuid<string>()).toEqualTypeOf<Action>();
      expectTypeOf(ksuid<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(ksuid<string, 'message'>('message')).toEqualTypeOf<
        KsuidAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(ksuid<string, () => string>(() => 'message')).toEqualTypeOf<
        KsuidAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = KsuidAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<KsuidIssue<string>>();
    });
  });
});
