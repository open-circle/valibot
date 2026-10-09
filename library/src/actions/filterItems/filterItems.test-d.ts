/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { describe, expectTypeOf, test } from 'vitest';
import { pipe } from '../../methods/index.ts';
import { array, number, string, union } from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { filterItems, type FilterItemsAction } from './filterItems.ts';

describe('filterItems', () => {
  type Dog = { type: 'dog' };
  type Cat = { type: 'cat' };
  type Animal = Dog | Cat;
  type Input = Animal[];

  type Action1 = FilterItemsAction<Input, Animal>;
  type Action2 = FilterItemsAction<Input, Dog>;

  describe('should return action object', () => {
    test('with one type argument', () => {
      expectTypeOf(
        filterItems<Input>((item): boolean => item.type === 'dog')
      ).toEqualTypeOf<Action1>();
      expectTypeOf(
        filterItems<Input>((item): item is Dog => item.type === 'dog')
      ).toEqualTypeOf<Action1>();
    });

    test('with two type arguments', () => {
      expectTypeOf(
        filterItems<Input, Dog>((item): item is Dog => item.type === 'dog')
      ).toEqualTypeOf<Action2>();
      // @ts-expect-error A boolean operation cannot narrow the output
      filterItems<Input, Dog>((item): boolean => item.type === 'dog');
    });
  });

  describe('should narrow output of pipeline', () => {
    test('with explicit type predicate', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const schema = pipe(
        array(union([string(), number()])),
        filterItems((item): item is string => typeof item === 'string')
      );
      expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<string[]>();
    });

    test('with inferred type predicate', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const schema = pipe(
        array(union([string(), number()])),
        filterItems((item) => typeof item === 'string')
      );
      expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<string[]>();
    });

    test('with boolean operation', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const schema = pipe(
        array(union([string(), number()])),
        filterItems((item): boolean => typeof item === 'string')
      );
      expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<
        (string | number)[]
      >();
    });
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<Action1>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Action2>>().toEqualTypeOf<Input>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<Action1>>().toEqualTypeOf<Animal[]>();
      expectTypeOf<InferOutput<Action2>>().toEqualTypeOf<Dog[]>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action1>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<Action2>>().toEqualTypeOf<never>();
    });
  });
});
