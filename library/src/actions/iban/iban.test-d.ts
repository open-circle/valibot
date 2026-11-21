import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { iban, type IbanAction, type IbanIssue } from './iban.ts';

describe('iban', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = IbanAction<string, undefined>;
      expectTypeOf(iban<string>()).toEqualTypeOf<Action>();
      expectTypeOf(iban<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(iban<string, 'message'>('message')).toEqualTypeOf<
        IbanAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(iban<string, () => string>(() => 'message')).toEqualTypeOf<
        IbanAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = IbanAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<IbanIssue<string>>();
    });
  });
});
