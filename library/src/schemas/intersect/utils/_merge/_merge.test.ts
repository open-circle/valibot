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

    test('for NaN primitives', () => {
      const result = _merge(NaN, NaN);
      expect(result.issue).toBeUndefined();
      expect(Number.isNaN((result as { value: unknown }).value)).toBe(true);
    });

    test('for zero values with different signs', () => {
      const negativeZeroResult = _merge(-0, 0);
      expect(negativeZeroResult.issue).toBeUndefined();
      expect(
        Object.is((negativeZeroResult as { value: unknown }).value, -0)
      ).toBe(true);
      const positiveZeroResult = _merge(0, -0);
      expect(positiveZeroResult.issue).toBeUndefined();
      expect(
        Object.is((positiveZeroResult as { value: unknown }).value, 0)
      ).toBe(true);
    });

    test('for valid dates', () => {
      const date = new Date();
      expect(_merge(date, date)).toStrictEqual({ value: date });
      expect(_merge(new Date(+date), new Date(+date))).toStrictEqual({
        value: date,
      });
    });

    test('for invalid dates', () => {
      const invalidDate = new Date(NaN);
      const result = _merge(invalidDate, new Date(NaN));
      expect(result.issue).toBeUndefined();
      const value = (result as { value: Date }).value;
      expect(value).toBeInstanceOf(Date);
      expect(Number.isNaN(+value)).toBe(true);
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

    test('for shared NaN and signed zero entries', () => {
      expect(
        _merge(
          { nan: NaN, negativeZero: -0, positiveZero: 0 },
          { nan: NaN, negativeZero: 0, positiveZero: -0 }
        )
      ).toStrictEqual({
        value: { nan: NaN, negativeZero: -0, positiveZero: 0 },
      });
    });

    test('for shared object references', () => {
      const shared = { key: 'foo' };
      const result = _merge({ shared }, { shared });
      expect(result).toStrictEqual({ value: { shared } });
      expect((result.value as { shared: object }).shared).toBe(shared);
    });

    test('for keys colliding with object prototype', () => {
      // Own keys that collide with `Object.prototype` members must be merged
      // as regular entries instead of resolving to the inherited member via
      // the `in` operator.
      expect(_merge({}, { toString: 'foo' })).toStrictEqual({
        value: { toString: 'foo' },
      });
      expect(_merge({ valueOf: 1 }, { valueOf: 1 })).toStrictEqual({
        value: { valueOf: 1 },
      });
      expect(
        _merge({ hasOwnProperty: 1 }, { hasOwnProperty: '1' })
      ).toStrictEqual({ issue: true });
    });

    test('without copying or merging inherited properties', () => {
      const value2 = Object.create({ inherited: 'foo', shared: 'bar' });
      value2.own = 'baz';
      expect(_merge({ shared: 'foo' }, value2)).toStrictEqual({
        value: { shared: 'foo', own: 'baz' },
      });
    });

    test('for objects with shared getters', () => {
      let reads = 0;
      const value2 = {
        get key() {
          reads++;
          return 1;
        },
      };
      expect(_merge({ key: 1 }, value2)).toStrictEqual({ value: { key: 1 } });
      expect(reads).toBe(2);
    });

    test('without invoking inherited setters', () => {
      let calls = 0;
      let result;
      try {
        Object.defineProperty(Object.prototype, 'inheritedSetter', {
          set() {
            calls++;
          },
          configurable: true,
        });
        result = _merge({}, { inheritedSetter: 'foo' });
      } finally {
        Reflect.deleteProperty(Object.prototype, 'inheritedSetter');
      }
      expect(result).toStrictEqual({ value: { inheritedSetter: 'foo' } });
      expect(calls).toBe(0);
    });

    test('for keys colliding with inherited non-writable properties', () => {
      let result;
      try {
        Object.defineProperty(Object.prototype, 'inheritedReadonly', {
          value: 'bar',
          writable: false,
          configurable: true,
        });
        result = _merge({}, { inheritedReadonly: 'foo' });
      } finally {
        Reflect.deleteProperty(Object.prototype, 'inheritedReadonly');
      }
      expect(result).toStrictEqual({ value: { inheritedReadonly: 'foo' } });
    });

    test.each([
      [{ ['__proto__']: { a: 1 } }, {}, { a: 1 }],
      [{}, { ['__proto__']: { a: 1 } }, { a: 1 }],
      [
        { ['__proto__']: { a: 1 } },
        { ['__proto__']: { b: 2 } },
        { a: 1, b: 2 },
      ],
    ])(
      'for own __proto__ properties in %j and %j',
      (value1, value2, expected) => {
        const result = _merge(value1, value2);
        expect(result.issue).toBeUndefined();
        expect(Object.getPrototypeOf(result.value)).toBe(Object.prototype);
        expect(
          Object.getOwnPropertyDescriptor(result.value, '__proto__')
        ).toEqual({
          value: expected,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    );

    test('for own prototype and constructor properties', () => {
      expect(
        _merge({}, { prototype: 'foo', constructor: Object })
      ).toStrictEqual({
        value: { prototype: 'foo', constructor: Object },
      });
      expect(
        _merge({ prototype: { a: 1 } }, { prototype: { b: 2 } })
      ).toStrictEqual({ value: { prototype: { a: 1, b: 2 } } });
    });

    test('for nested JSON objects with own __proto__ properties', () => {
      const input = JSON.parse('{"nested":{"__proto__":{"admin":true}}}');
      const result = _merge({ nested: { name: 'foo' } }, input);
      expect(result).toStrictEqual({
        value: { nested: { name: 'foo', ['__proto__']: { admin: true } } },
      });
      const nested = (result.value as { nested: object }).nested;
      expect(Object.getPrototypeOf(nested)).toBe(Object.prototype);
      expect('admin' in nested).toBe(false);
      expect(input).toStrictEqual({
        nested: { ['__proto__']: { admin: true } },
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
  });

  describe('should return dataset with issue', () => {
    test('for invalid primitives', () => {
      expect(_merge(1, 2)).toStrictEqual({ issue: true });
      expect(_merge('foo', 'bar')).toStrictEqual({ issue: true });
      expect(_merge(1, 'foo')).toStrictEqual({ issue: true });
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

    test.each(['__proto__', 'prototype'])(
      'for conflicting own %s properties',
      (key) => {
        expect(_merge({ [key]: 1 }, { [key]: 2 })).toStrictEqual({
          issue: true,
        });
      }
    );

    test('for invalid arrays', () => {
      expect(_merge([1], [1, 2])).toStrictEqual({ issue: true });
      expect(_merge([1], ['1'])).toStrictEqual({ issue: true });
    });
  });
});
