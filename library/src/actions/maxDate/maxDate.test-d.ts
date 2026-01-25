import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { maxDate, type MaxDateAction, type MaxDateIssue } from './maxDate.ts';

describe('maxDate', () => {
  describe('should return action object', () => {
    const requirement = new Date();

    test('with undefined message', () => {
      type Action = MaxDateAction<Date, Date, undefined>;
      expectTypeOf(maxDate<Date, Date>(requirement)).toEqualTypeOf<Action>();
      expectTypeOf(
        maxDate<Date, Date, undefined>(requirement, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        maxDate<Date, Date, 'message'>(requirement, 'message')
      ).toEqualTypeOf<MaxDateAction<Date, Date, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        maxDate<Date, Date, () => string>(requirement, () => 'message')
      ).toEqualTypeOf<MaxDateAction<Date, Date, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = MaxDateAction<Date, Date, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Date>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Date>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        MaxDateIssue<Date, Date>
      >();
    });
  });
});
