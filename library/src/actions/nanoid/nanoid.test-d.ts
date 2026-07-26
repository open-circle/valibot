import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { nanoid, type NanoIdAction, type NanoIdIssue } from './nanoid.ts';

describe('nanoid', () => {
  describe('should return action object', () => {
    test('with undefined message', () => {
      type Action = NanoIdAction<string, undefined>;
      expectTypeOf(nanoid<string>()).toEqualTypeOf<Action>();
      expectTypeOf(
        nanoid<string, undefined>(undefined)
      ).toEqualTypeOf<Action>();
    });

    test('with string message', () => {
      expectTypeOf(nanoid<string, 'message'>('message')).toEqualTypeOf<
        NanoIdAction<string, 'message'>
      >();
    });

    test('with function message', () => {
      expectTypeOf(nanoid<string, () => string>(() => 'message')).toEqualTypeOf<
        NanoIdAction<string, () => string>
      >();
    });
  });

  describe('should infer correct types', () => {
    type Action = NanoIdAction<string, undefined>;

    test('of input', () => {
      expectTypeOf<InferInput<Action>>().toEqualTypeOf<string>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action>>().toEqualTypeOf<string>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action>>().toEqualTypeOf<NanoIdIssue<string>>();
    });
  });
});
