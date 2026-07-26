import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  maxEntries,
  type MaxEntriesAction,
  type MaxEntriesIssue,
} from './maxEntries.ts';

describe('maxEntries', () => {
  type Input = Record<string, number>;

  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = MaxEntriesAction<Input, 10, undefined>;
      expectTypeOf(maxEntries<Input, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        maxEntries<Input, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        maxEntries<Input, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<MaxEntriesAction<Input, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        maxEntries<Input, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<MaxEntriesAction<Input, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = MaxEntriesAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        MaxEntriesIssue<Input, 10>
      >();
    });
  });
});
