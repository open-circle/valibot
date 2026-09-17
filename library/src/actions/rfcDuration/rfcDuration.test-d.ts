import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  rfcDuration,
  type RfcDurationAction,
  type RfcDurationIssue,
} from './rfcDuration.ts';

describe('rfcDuration', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = RfcDurationAction<string, undefined>;
      expectTypeOf(rfcDuration<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        rfcDuration<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(rfcDuration<string, 'message'>('message')).toEqualTypeOf<
        RfcDurationAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        rfcDuration<string, () => string>(() => 'message')
      ).toEqualTypeOf<RfcDurationAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = RfcDurationAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<
        InferIssue<Action>
      >().toEqualTypeOf<RfcDurationIssue<string>>();
    });
  });
});
