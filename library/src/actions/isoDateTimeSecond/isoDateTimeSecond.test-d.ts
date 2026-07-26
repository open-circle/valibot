import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  isoDateTimeSecond,
  type IsoDateTimeSecondAction,
  type IsoDateTimeSecondIssue,
} from './isoDateTimeSecond.ts';

describe('isoDateTimeSecond', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = IsoDateTimeSecondAction<string, undefined>;
      expectTypeOf(isoDateTimeSecond<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        isoDateTimeSecond<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        isoDateTimeSecond<string, 'message'>('message')
      ).toEqualTypeOf<IsoDateTimeSecondAction<string, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        isoDateTimeSecond<string, () => string>(() => 'message')
      ).toEqualTypeOf<IsoDateTimeSecondAction<string, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = IsoDateTimeSecondAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        IsoDateTimeSecondIssue<string>
      >();
    });
  });
});
