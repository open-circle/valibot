import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  multipleOf,
  type MultipleOfAction,
  type MultipleOfIssue,
} from './multipleOf.ts';

describe('multipleOf', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = MultipleOfAction<number, 10, undefined>;
      expectTypeOf(multipleOf<number, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        multipleOf<number, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        multipleOf<number, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<MultipleOfAction<number, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        multipleOf<number, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<MultipleOfAction<number, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action1 = MultipleOfAction<number, 10, undefined>;
    type Action2 = MultipleOfAction<bigint, 10n, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action1>>().toEqualTypeOf<number>();
      expectTypeOf<InferInput<Action2>>().toEqualTypeOf<bigint>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action1>>().toEqualTypeOf<number>();
      expectTypeOf<InferOutput<Action2>>().toEqualTypeOf<bigint>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action1>>().toEqualTypeOf<
        MultipleOfIssue<number, 10>
      >();
      expectTypeOf<InferIssue<Action2>>().toEqualTypeOf<
        MultipleOfIssue<bigint, 10n>
      >();
    });
  });
});
