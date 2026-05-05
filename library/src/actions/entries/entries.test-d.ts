import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { entries, type EntriesAction, type EntriesIssue } from './entries.ts';

describe('entries', () => {
  type Input = Record<string, number>;

  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = EntriesAction<Input, 10, undefined>;
      expectTypeOf(entries<Input, 10>(10)).toEqualTypeOf<Action>();
      expectTypeOf(
        entries<Input, 10, undefined>(10, undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(entries<Input, 10, 'message'>(10, 'message')).toEqualTypeOf<
        EntriesAction<Input, 10, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(
        entries<Input, 10, () => string>(10, () => 'message')
      ).toEqualTypeOf<EntriesAction<Input, 10, () => string>>();
    });
  });

  describe('should infer correct types', () => {
    type Action = EntriesAction<Input, 10, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<Input>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<
        EntriesIssue<Input, 10>
      >();
    });
  });
});
