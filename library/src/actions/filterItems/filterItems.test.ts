import { describe, expect, test } from 'vitest';
import { filterItems, type FilterItemsAction } from './filterItems.ts';

describe('filterItems', () => {
  const operation = (item: number) => item > 9;
  const action = filterItems<number[]>(operation);

  describe('should return action object', () => {
    test('with one type argument', () => {
      expect(action).toStrictEqual({
        kind: 'transformation',
        type: 'filter_items',
        reference: filterItems,
        async: false,
        operation,
        '~run': expect.any(Function),
      } satisfies FilterItemsAction<number[]>);
    });

    test('with two type arguments', () => {
      const predicate = (item: number | string): item is number =>
        typeof item === 'number';
      expect(filterItems<(number | string)[], number>(predicate)).toStrictEqual(
        {
          kind: 'transformation',
          type: 'filter_items',
          reference: filterItems,
          async: false,
          operation: predicate,
          '~run': expect.any(Function),
        } satisfies FilterItemsAction<(number | string)[], number>
      );
    });
  });

  test('should transform input', () => {
    expect(
      action['~run']({ typed: true, value: [-12, 345, 0, 9, 10, 999] }, {})
    ).toStrictEqual({
      typed: true,
      value: [345, 10, 999],
    });
  });
});
