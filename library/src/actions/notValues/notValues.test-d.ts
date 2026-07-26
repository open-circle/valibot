import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  notValues,
  type NotValuesAction,
  type NotValuesIssue,
} from './notValues.ts';

describe('notValues', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = NotValuesAction<number, [7, 12], undefined>;
      expectTypeOf(notValues<number, [7, 12]>([7, 12])).toEqualTypeOf<Action>();
      expectTypeOf(
        notValues<number, [7, 12], undefined>([7, 12], undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        notValues<number, [7, 12], 'message'>([7, 12], 'message')
      ).toEqualTypeOf<NotValuesAction<number, [7, 12], 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        notValues<number, [7, 12], () => string>([7, 12], () => 'message')
      ).toEqualTypeOf<NotValuesAction<number, [7, 12], () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = NotValuesAction<number, [7, 12], undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<number>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<number>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        NotValuesIssue<number, [7, 12]>
      >();
    });
  });
});
