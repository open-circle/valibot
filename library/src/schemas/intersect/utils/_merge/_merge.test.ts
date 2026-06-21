import { describe, expect, test } from 'vitest';
import { _merge } from './_merge.ts';

describe('_merge', () => {
  describe('should return dataset with value', () => {
    test('for valid primitives', () => {
      const date = new Date();
      expect(_merge(1, 1)).toStrictEqual({ value: 1 });
      expect(_merge('foo', 'foo')).toStrictEqual({ value: 'foo' });
      expect(_merge(date, date)).toStrictEqual({ value: date });
      expect(_merge(new Date(+date), new Date(+date))).toStrictEqual({
        value: date,
      });
    });

    test('for valid dates', () => {
      const date = new Date();
      expect(_merge(date, date)).toStrictEqual({ value: date });
      expect(_merge(new Date(+date), new Date(+date))).toStrictEqual({
        value: date,
      });
    });

    test('for valid objects', () => {
      expect(_merge({ key: 1 }, { key: 1 })).toStrictEqual({
        value: { key: 1 },
      });
      expect(_merge({ a: 1 }, { b: 2 })).toStrictEqual({
        value: { a: 1, b: 2 },
      });
      expect(_merge({ key: { a: 1 } }, { key: { b: 2 } })).toStrictEqual({
        value: { key: { a: 1, b: 2 } },
      });
    });

    test('for valid frozen object', () => {
      expect(_merge(Object.freeze({ key: 1 }), { key: 1 })).toStrictEqual({
        value: { key: 1 },
      });
    });

    test('for valid frozen empty object', () => {
      expect(_merge(Object.freeze({}), { key: 1 })).toStrictEqual({
        value: { key: 1 },
      });
    });

    test('for valid arrays', () => {
      expect(_merge([1, 2, 3], [1, 2, 3])).toStrictEqual({ value: [1, 2, 3] });
      expect(_merge([{ a: 1 }, { a: 1 }], [{ b: 2 }, { b: 2 }])).toStrictEqual({
        value: [
          { a: 1, b: 2 },
          { a: 1, b: 2 },
        ],
      });
    });

    test('for valid frozen array', () => {
      expect(_merge(Object.freeze([1, 2, 3]), [1, 2, 3])).toStrictEqual({
        value: [1, 2, 3],
      });
    });

    test('for NaN primitives', () => {
      // NaN === NaN is false in JavaScript, but Object.is(NaN, NaN) is true.
      // Two NaN values represent the same "not a number" state and must merge.
      const result = _merge(NaN, NaN);
      expect(result.issue).toBeUndefined();
      expect(Number.isNaN((result as { value: unknown }).value)).toBe(true);
    });

    test('for invalid Date objects with NaN timestamp', () => {
      // new Date(NaN) is an invalid date. Two invalid dates are equal under
      // Object.is(+invalidDate, +invalidDate) === Object.is(NaN, NaN) === true.
      const invalidDate = new Date(NaN);
      const result = _merge(invalidDate, new Date(NaN));
      expect(result.issue).toBeUndefined();
      expect(
        Number.isNaN(+(result as { value: unknown }).value as number)
      ).toBe(true);
    });
  });

  describe('should return dataset with issue', () => {
    test('for invalid primitives', () => {
      expect(_merge(1, 2)).toStrictEqual({ issue: true });
      expect(_merge('foo', 'bar')).toStrictEqual({ issue: true });
      expect(_merge(1, 'foo')).toStrictEqual({ issue: true });
    });

    test('for mismatched zero values', () => {
      // Object.is(-0, +0) is false, so -0 and +0 are distinct values that
      // cannot be merged without losing information.
      expect(_merge(-0, 0)).toStrictEqual({ issue: true });
      expect(_merge(0, -0)).toStrictEqual({ issue: true });
    });

    test('for invalid dates', () => {
      const date = new Date();
      expect(_merge(date, new Date(+date + 1234))).toStrictEqual({
        issue: true,
      });
    });

    test('for invalid objects', () => {
      expect(_merge({ key: 1 }, { key: '1' })).toStrictEqual({ issue: true });
    });

    test('for invalid arrays', () => {
      expect(_merge([1], [1, 2])).toStrictEqual({ issue: true });
      expect(_merge([1], ['1'])).toStrictEqual({ issue: true });
    });
  });
});
