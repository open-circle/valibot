import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { minDate, type MinDateAction, type MinDateIssue } from './minDate.ts';

describe('minDate', () => {
  describe('should return action object', () => {
    const requirement = new Date();

    test('with undefined message', () => {
      type Action = MinDateAction<Date, Date, undefined>;
      expectTypeOf(minDate<Date, Date>(requirement)).toEqualTypeOf<Action>();
      expectTypeOf(
        minDate<Date, Date, undefined>(requirement, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        minDate<Date, Date, 'message'>(requirement, 'message')
      ).toEqualTypeOf<MinDateAction<Date, Date, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        minDate<Date, Date, () => string>(requirement, () => 'message')
      ).toEqualTypeOf<MinDateAction<Date, Date, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = MinDateAction<Date, Date, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Date>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Date>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        MinDateIssue<Date, Date>
      >();
    });
  });
});
