import { describe, expect, test } from 'vitest';
import {
  boolean,
  nullable,
  nullish,
  number,
  object,
  optional,
  strictObject,
  strictTuple,
  string,
  tuple,
  unknown,
} from '../../schemas/index.ts';
import { getDefaults } from './getDefaults.ts';

describe('getDefaults', () => {
  test('should return undefined', () => {
    expect(getDefaults(string())).toBeUndefined();
    expect(getDefaults(number())).toBeUndefined();
    expect(getDefaults(boolean())).toBeUndefined();
  });

  test('should return default', () => {
    expect(getDefaults(optional(string(), 'foo'))).toBe('foo');
    expect(getDefaults(nullish(number(), () => 123 as const))).toBe(123);
    expect(getDefaults(nullable(boolean(), false))).toBe(false);
  });

  describe('should return object defaults', () => {
    test('for empty object', () => {
      expect(getDefaults(object({}))).toStrictEqual({});
    });

    test('for own __proto__ entry', () => {
      const result = getDefaults(
        object({ ['__proto__']: optional(string(), 'foo') })
      );
      expect(result).toStrictEqual({ ['__proto__']: 'foo' });
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    test('for own __proto__ entry with object value', () => {
      const value = { key: 'foo' };
      const result = getDefaults(
        object({ ['__proto__']: optional(unknown(), value) })
      );
      expect(result).toStrictEqual({ ['__proto__']: value });
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    });

    test('for simple object', () => {
      expect(
        getDefaults(
          object({
            key1: optional(string(), 'foo'),
            key2: nullish(number(), () => 123 as const),
            key3: nullable(boolean(), false),
            key4: string(),
          })
        )
      ).toStrictEqual({
        key1: 'foo',
        key2: 123,
        key3: false,
        key4: undefined,
      });
    });

    test('for nested object', () => {
      expect(
        getDefaults(
          object({
            nested: strictObject({
              key1: optional(string(), 'foo'),
              key2: nullish(number(), () => 123 as const),
              key3: nullable(boolean(), false),
            }),
            other: string(),
          })
        )
      ).toStrictEqual({
        nested: {
          key1: 'foo',
          key2: 123,
          key3: false,
        },
        other: undefined,
      });
    });
  });

  describe('should return tuple defaults', () => {
    test('for empty tuple', () => {
      expect(getDefaults(tuple([]))).toStrictEqual([]);
    });

    test('for simple tuple', () => {
      expect(
        getDefaults(
          tuple([
            optional(string(), 'foo'),
            nullish(number(), () => 123 as const),
            nullable(boolean(), false),
            string(),
          ])
        )
      ).toStrictEqual(['foo', 123, false, undefined]);
    });

    test('for nested tuple', () => {
      expect(
        getDefaults(
          tuple([
            strictTuple([
              optional(string(), 'foo'),
              nullish(number(), () => 123 as const),
              nullable(boolean(), false),
            ]),
            string(),
          ])
        )
      ).toStrictEqual([['foo', 123, false], undefined]);
    });
  });
});
