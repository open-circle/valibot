import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { readonly, type ReadonlyAction } from './readonly.ts';

describe('readonly', () => {
  test('should return action object', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Input = { key: string };
    type Action = ReadonlyAction<Input>;
    expectTypeOf(readonly<Input>()).toEqualTypeOf<Action>();
  });

  describe('should infer correct types', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    type Input1 = { for: string; bar: number };
    type Action1 = ReadonlyAction<Input1>;
    type Input2 = [string, number];
    type Action2 = ReadonlyAction<Input2>;
    type Input3 = Map<string, number>;
    type Action3 = ReadonlyAction<Input3>;
    type Input4 = Set<string>;
    type Action4 = ReadonlyAction<Input4>;

    test('of input', () => {
      expectTypeOf<InferInput<Action1>>().toEqualTypeOf<Input1>();
      expectTypeOf<InferInput<Action2>>().toEqualTypeOf<Input2>();
      expectTypeOf<InferInput<Action3>>().toEqualTypeOf<Input3>();
      expectTypeOf<InferInput<Action4>>().toEqualTypeOf<Input4>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action1>>().toEqualTypeOf<{
        readonly for: string;
        readonly bar: number;
      }>();
      expectTypeOf<InferOutput<Action2>>().toEqualTypeOf<
        readonly [string, number]
      >();
      expectTypeOf<InferOutput<Action3>>().toEqualTypeOf<
        ReadonlyMap<string, number>
      >();
      expectTypeOf<InferOutput<Action4>>().toEqualTypeOf<ReadonlySet<string>>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action1>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<Action2>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<Action3>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<Action4>>().toEqualTypeOf<never>();
    });
  });
});
