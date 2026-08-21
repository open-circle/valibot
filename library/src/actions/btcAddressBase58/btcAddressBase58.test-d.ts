import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  btcAddressBase58,
  type BtcAddressBase58Action,
  type BtcAddressBase58Issue,
} from './btcAddressBase58.ts';

describe('btcAddressBase58', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = BtcAddressBase58Action<string, undefined>;
      expectTypeOf(btcAddressBase58<string>()).toEqualTypeOf<Action>();
      expectTypeOf(btcAddressBase58<string, undefined>(undefined)).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(btcAddressBase58<string, 'message'>('message')).toEqualTypeOf<
        BtcAddressBase58Action<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        btcAddressBase58<string, () => string>(() => 'message')
      ).toEqualTypeOf<BtcAddressBase58Action<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = BtcAddressBase58Action<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        BtcAddressBase58Issue<string>
      >();
    });
  });
});
