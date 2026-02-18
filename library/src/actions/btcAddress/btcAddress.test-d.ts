import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  btcAddress,
  type BTCAddressAction,
  type BTCAddressIssue,
} from './btcAddress.ts';

describe('btcAddress', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = BTCAddressAction<string, undefined>;
      expectTypeOf(btcAddress()).toEqualTypeOf<Action>();
      expectTypeOf(btcAddress(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(btcAddress('message')).toEqualTypeOf<
        BTCAddressAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(btcAddress(() => 'message')).toEqualTypeOf<
        BTCAddressAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = BTCAddressAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        BTCAddressIssue<string>
      >();
    });
  });
});
