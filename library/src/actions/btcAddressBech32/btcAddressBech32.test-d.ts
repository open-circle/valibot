import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  btcAddressBech32,
  type BtcAddressBech32Action,
  type BtcAddressBech32Issue,
} from './btcAddressBech32.ts';

describe('btcAddressBech32', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = BtcAddressBech32Action<string, undefined>;
      expectTypeOf(btcAddressBech32<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        btcAddressBech32<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        btcAddressBech32<string, 'message'>('message')
      ).toEqualTypeOf<BtcAddressBech32Action<string, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        btcAddressBech32<string, () => string>(() => 'message')
      ).toEqualTypeOf<BtcAddressBech32Action<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = BtcAddressBech32Action<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        BtcAddressBech32Issue<string>
      >();
    });
  });
});
