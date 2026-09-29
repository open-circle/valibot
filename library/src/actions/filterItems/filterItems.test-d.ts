/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { describe, expectTypeOf, test } from 'vitest';
import { parse } from '../../methods/parse/parse.ts';
import { pipe } from '../../methods/pipe/pipe.ts';
import { array } from '../../schemas/array/array.ts';
import { number } from '../../schemas/number/number.ts';
import { string } from '../../schemas/string/string.ts';
import { union } from '../../schemas/union/union.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { filterItems, type FilterItemsAction } from './filterItems.ts';

describe('filterItems', () => {
  type Dog = { type: 'dog' };
  type Cat = { type: 'cat' };
  type Animal = Dog | Cat;
  type Input = Animal[];

  type Action1 = FilterItemsAction<Input, Input>;
  type Action2 = FilterItemsAction<Input, Dog[]>;

  type PrimitiveInput = (string | number)[];
  type Action3 = FilterItemsAction<PrimitiveInput, number[]>;

  type Pet = 'cat' | 'dog' | 'other';
  type PetInput = Pet[];
  type Action4 = FilterItemsAction<PetInput, ('cat' | 'dog')[]>;

  test('should return action object', () => {
    // Boolean predicate fallback overload
    expectTypeOf(
      filterItems<Input>((item): boolean => item.type === 'dog')
    ).toEqualTypeOf<Action1>();

    // Type guard overload with object union
    expectTypeOf(
      filterItems<Input, Dog>((item): item is Dog => item.type === 'dog')
    ).toEqualTypeOf<Action2>();

    // Type guard overload with primitive union
    expectTypeOf(
      filterItems<PrimitiveInput, number>(
        (item): item is number => typeof item === 'number'
      )
    ).toEqualTypeOf<Action3>();

    // Type guard overload with string literal union
    expectTypeOf(
      filterItems<PetInput, 'cat' | 'dog'>(
        (item): item is 'cat' | 'dog' => item === 'cat' || item === 'dog'
      )
    ).toEqualTypeOf<Action4>();

    // Baseline number[] test
    expectTypeOf(filterItems<number[]>((item) => item > 2)).toEqualTypeOf<
      FilterItemsAction<number[]>
    >();
  });

  describe('should infer correct types', () => {
    test('of input', () => {
      expectTypeOf<InferInput<Action1>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Action2>>().toEqualTypeOf<Input>();
      expectTypeOf<InferInput<Action3>>().toEqualTypeOf<PrimitiveInput>();
      expectTypeOf<InferInput<Action4>>().toEqualTypeOf<PetInput>();
      expectTypeOf<InferInput<FilterItemsAction<number[]>>>().toEqualTypeOf<number[]>();
    });

    test('of output', () => {
      // 1. Boolean predicate fallback: preserves input type
      expectTypeOf<InferOutput<Action1>>().toEqualTypeOf<Input>();

      // 2. Object union narrowing: narrows to Dog[]
      expectTypeOf<InferOutput<Action2>>().toEqualTypeOf<Dog[]>();

      // 3. Primitive narrowing: narrows to number[]
      expectTypeOf<InferOutput<Action3>>().toEqualTypeOf<number[]>();

      // 4. Literal union narrowing: narrows to ('cat' | 'dog')[]
      expectTypeOf<InferOutput<Action4>>().toEqualTypeOf<('cat' | 'dog')[]>();

      // 5. Default fallback for number[]
      expectTypeOf<InferOutput<FilterItemsAction<number[]>>>().toEqualTypeOf<number[]>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<Action1>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<Action2>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<Action3>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<Action4>>().toEqualTypeOf<never>();
      expectTypeOf<InferIssue<FilterItemsAction<number[]>>>().toEqualTypeOf<never>();
    });
  });

  describe('pipe integration', () => {
    test('should narrow union type in pipe with parse', () => {
      type PetUnion = 'cat' | 'dog';
      const isPet = (x: string): x is PetUnion => x === 'cat' || x === 'dog';
      const schema = pipe(array(string()), filterItems(isPet));

      expectTypeOf<InferInput<typeof schema>>().toEqualTypeOf<string[]>();
      expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<PetUnion[]>();

      const output = parse(schema, ['apple', 'cat', 'dog']);
      expectTypeOf(output).toEqualTypeOf<PetUnion[]>();
    });

    test('should narrow primitive union in pipe', () => {
      const isNumber = (x: string | number): x is number => typeof x === 'number';
      const schema = pipe(array(union([string(), number()])), filterItems(isNumber));

      expectTypeOf<InferInput<typeof schema>>().toEqualTypeOf<
        (string | number)[]
      >();
      expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<number[]>();

      const output = parse(schema, ['foo', 123, 'bar', 456]);
      expectTypeOf(output).toEqualTypeOf<number[]>();
    });

    test('should preserve type in pipe with boolean predicate fallback', () => {
      const schema = pipe(
        array(number()),
        filterItems((x) => x > 2)
      );

      expectTypeOf<InferInput<typeof schema>>().toEqualTypeOf<number[]>();
      expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<number[]>();

      const output = parse(schema, [1, 2, 3, 4]);
      expectTypeOf(output).toEqualTypeOf<number[]>();
    });
  });
});
