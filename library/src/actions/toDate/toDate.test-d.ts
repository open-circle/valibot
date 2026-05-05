import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { toDate, type ToDateAction, type ToDateIssue } from './toDate.ts';

describe('toDate', () => {
  test('should return action object', () => {
    expectTypeOf(toDate<'123'>()).toEqualTypeOf<
      ToDateAction<'123', undefined>
    >();
  });

  describe('should infer correct types', () => {
    type Action = ToDateAction<'123', undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<'123'>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Date>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<ToDateIssue<'123'>>();
    });
  });
});
