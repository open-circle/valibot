import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  isoCountryCode,
  type IsoCountryCodeAction,
  type IsoCountryCodeIssue,
} from './isoCountryCode.ts';

describe('isoCountryCode', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = IsoCountryCodeAction<string, undefined>;
      expectTypeOf(isoCountryCode<string>()).toEqualTypeOf<Action>();
      expectTypeOf(isoCountryCode<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(isoCountryCode<string, 'message'>('message')).toEqualTypeOf<
        IsoCountryCodeAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        isoCountryCode<string, () => string>(() => 'message')
      ).toEqualTypeOf<IsoCountryCodeAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = IsoCountryCodeAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<IsoCountryCodeIssue<string>>();
    });
  });
});
