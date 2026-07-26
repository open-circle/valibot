import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  notEntries,
  type NotEntriesAction,
  type NotEntriesIssue,
} from './notEntries.ts';

describe('notEntries', () => {
  type Input = Record<string, number>;

  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = NotEntriesAction<Input, 10, undefined>;
      expectTypeOf(notEntries<Input, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        notEntries<Input, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(
        notEntries<Input, 10, 'message'>(10, 'message')
      ).toEqualTypeOf<NotEntriesAction<Input, 10, 'message'>>();
    });

    test('with function message', () => {
      expectTypeOf(
        notEntries<Input, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<NotEntriesAction<Input, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = NotEntriesAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        NotEntriesIssue<Input, 10>
      >();
    });
  });
});
