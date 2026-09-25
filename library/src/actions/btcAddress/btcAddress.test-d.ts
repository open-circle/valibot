import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  btcAddress,
  type BtcAddressAction,
  type BtcAddressIssue,
} from './btcAddress.ts';

describe('btcAddress', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = BtcAddressAction<string, undefined>;
      expectTypeOf(btcAddress<string>()).toEqualTypeOf<Action>();
      expectTypeOf(btcAddress<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(btcAddress<string, 'message'>('message')).toEqualTypeOf<
        BtcAddressAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(btcAddress<string, () => string>(() => 'message')).toEqualTypeOf<
        BtcAddressAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = BtcAddressAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<BtcAddressIssue<string>>();
    });
  });
});
