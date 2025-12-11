import { describe, expect, test } from 'vitest';
import {
  boolean,
  number,
  object,
  optional,
  strictObject,
  strictTuple,
  string,
  tuple,
} from '../../schemas/index.ts';
import { fallback } from '../fallback/index.ts';
import { getFallbacks } from './getFallbacks.ts';

describe('getFallbacks', () => {
  test('should return undefined', () => {
    expect(getFallbacks(string())).toBeUndefined();
    expect(getFallbacks(number())).toBeUndefined();
    expect(getFallbacks(boolean())).toBeUndefined();
  });

  test('should return default', () => {
    expect(getFallbacks(fallback(string(), 'foo' as const))).toBe('foo');
    expect(getFallbacks(fallback(number(), () => 123 as const))).toBe(123);
    expect(getFallbacks(fallback(boolean(), false as const))).toBe(false);
  });

  describe('should return object defaults', () => {
    test('for empty object', () => {
      expect(getFallbacks(object({}))).toStrictEqual({});
    });

    test('for simple object', () => {
      expect(
        getFallbacks(
          object({
            key1: fallback(string(), 'foo' as const),
            key2: fallback(number(), () => 123 as const),
            key3: fallback(boolean(), false as const),
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
        getFallbacks(
          object({
            nested: strictObject({
              key1: fallback(string(), 'foo' as const),
              key2: fallback(number(), () => 123 as const),
              key3: fallback(boolean(), false as const),
            }),
            objectWithFallback: fallback(object({
              foo: number(),
              bar: fallback(number(), 5)

            }), {
              foo: 3
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
        objectWithFallback: { foo: 3 },
        other: undefined,
      });
    });
  });

  describe('should return tuple defaults', () => {
    test('for empty tuple', () => {
      expect(getFallbacks(tuple([]))).toStrictEqual([]);
    });

    test('for simple tuple', () => {
      expect(
        getFallbacks(
          tuple([
            fallback(string(), 'foo' as const),
            fallback(number(), () => 123 as const),
            fallback(boolean(), false as const),
            string(),
          ])
        )
      ).toStrictEqual(['foo', 123, false, undefined]);
    });

    test('for nested tuple', () => {
      expect(
        getFallbacks(
          tuple([
            strictTuple([
              fallback(string(), 'foo' as const),
              fallback(number(), () => 123 as const),
              fallback(boolean(), false as const),
            ]),
            string(),
          ])
        )
      ).toStrictEqual([['foo', 123, false], undefined]);
    });
  });
});
