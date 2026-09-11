import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { rfcTime, type RfcTimeAction, type RfcTimeIssue } from './rfcTime.ts';

describe('rfcTime', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = RfcTimeAction<string, undefined>;
      expectTypeOf(rfcTime<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        rfcTime<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(rfcTime<string, 'message'>('message')).toEqualTypeOf<
        RfcTimeAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        rfcTime<string, () => string>(() => 'message')
      ).toEqualTypeOf<RfcTimeAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = RfcTimeAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<RfcTimeIssue<string>>();
    });
  });
});
