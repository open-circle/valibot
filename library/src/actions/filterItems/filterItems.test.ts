import { describe, expect, test } from 'vitest';
import { parse } from '../../methods/parse/parse.ts';
import { pipe } from '../../methods/pipe/pipe.ts';
import { array } from '../../schemas/array/array.ts';
import { number } from '../../schemas/number/number.ts';
import { string } from '../../schemas/string/string.ts';
import { filterItems, type FilterItemsAction } from './filterItems.ts';

describe('filterItems', () => {
  const operation = (item: number) => item > 9;
  const action = filterItems<number[]>(operation);

  test('should return action object', () => {
    expect(action).toStrictEqual({
      kind: 'transformation',
      type: 'filter_items',
      reference: filterItems,
      async: false,
      operation,
      '~run': expect.any(Function),
    } satisfies FilterItemsAction<number[]>);
  });

  describe('should transform input', () => {
    test('should transform with boolean predicate', () => {
      expect(
        action['~run']({ typed: true, value: [-12, 345, 0, 9, 10, 999] }, {})
      ).toStrictEqual({
        typed: true,
        value: [345, 10, 999],
      });
    });

    test('should filter with boolean predicate fallback', () => {
      const boolAction = filterItems<number[]>((x) => x > 2);
      expect(
        boolAction['~run']({ typed: true, value: [1, 2, 3, 4, 0] }, {})
      ).toStrictEqual({
        typed: true,
        value: [3, 4],
      });
    });

    test('should filter union items with type guard', () => {
      type Animal = 'cat' | 'dog' | 'other';
      const isCatOrDog = (item: Animal): item is 'cat' | 'dog' =>
        item === 'cat' || item === 'dog';
      const unionAction = filterItems<Animal[], 'cat' | 'dog'>(isCatOrDog);
      expect(
        unionAction['~run'](
          { typed: true, value: ['cat', 'other', 'dog', 'other'] },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: ['cat', 'dog'],
      });
    });

    test('should filter object union with type guard', () => {
      type Dog = { type: 'dog' };
      type Cat = { type: 'cat' };
      type Animal = Dog | Cat;
      const isDog = (item: Animal): item is Dog => item.type === 'dog';
      const objectAction = filterItems<Animal[], Dog>(isDog);
      expect(
        objectAction['~run'](
          {
            typed: true,
            value: [{ type: 'dog' }, { type: 'cat' }, { type: 'dog' }],
          },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: [{ type: 'dog' }, { type: 'dog' }],
      });
    });

    test('should filter primitive union with type guard', () => {
      const isNumber = (item: string | number): item is number =>
        typeof item === 'number';
      const primitiveAction = filterItems<(string | number)[], number>(isNumber);
      expect(
        primitiveAction['~run'](
          { typed: true, value: ['foo', 123, 'bar', 456, 'baz'] },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: [123, 456],
      });
    });
  });

  describe('pipe integration', () => {
    test('should filter and narrow items when used in pipe with parse', () => {
      type Animal = 'cat' | 'dog';
      const isAnimal = (x: string): x is Animal => x === 'cat' || x === 'dog';
      const schema = pipe(array(string()), filterItems(isAnimal));
      const result = parse(schema, ['apple', 'cat', 'banana', 'dog']);
      expect(result).toStrictEqual(['cat', 'dog']);
    });

    test('should filter items in pipe with boolean predicate', () => {
      const schema = pipe(
        array(number()),
        filterItems((x) => x > 2)
      );
      const result = parse(schema, [1, 2, 3, 4, 0]);
      expect(result).toStrictEqual([3, 4]);
    });
  });
});
