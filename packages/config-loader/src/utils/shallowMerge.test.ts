import { describe, expect, test } from 'vitest';
import { shallowMerge } from './shallowMerge.ts';

describe('shallowMerge', () => {
  test('merges top-level keys of two plain objects with override taking precedence', () => {
    expect(shallowMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toStrictEqual({
      a: 1,
      b: 3,
      c: 4,
    });
  });

  test('does not recurse into nested objects', () => {
    expect(shallowMerge({ a: { x: 1, y: 2 } }, { a: { y: 99 } })).toStrictEqual(
      { a: { y: 99 } }
    );
  });

  test('returns the override when defaults is not a plain object', () => {
    expect(shallowMerge(null, { a: 1 })).toStrictEqual({ a: 1 });
    expect(shallowMerge(undefined, { a: 1 })).toStrictEqual({ a: 1 });
    expect(shallowMerge('a string', { a: 1 })).toStrictEqual({ a: 1 });
    expect(shallowMerge([1, 2, 3], { a: 1 })).toStrictEqual({ a: 1 });
  });

  test('returns the override when override is not a plain object', () => {
    expect(shallowMerge({ a: 1 }, null)).toBeNull();
    expect(shallowMerge({ a: 1 }, undefined)).toBeUndefined();
    expect(shallowMerge({ a: 1 }, 'replaced')).toBe('replaced');
    expect(shallowMerge({ a: 1 }, [10, 20])).toStrictEqual([10, 20]);
  });

  test('returns the override when both values are non-objects', () => {
    expect(shallowMerge(1, 2)).toBe(2);
    expect(shallowMerge('x', 'y')).toBe('y');
  });

  test('does not spread non-plain objects such as Date or Map', () => {
    const date = new Date(0);
    const map = new Map([['a', 1]]);

    // A non-plain override must replace, not be spread into an empty object.
    expect(shallowMerge({ a: 1 }, date)).toBe(date);
    expect(shallowMerge({ a: 1 }, map)).toBe(map);
    // A non-plain defaults must be replaced wholesale by the override.
    expect(shallowMerge(date, { a: 1 })).toStrictEqual({ a: 1 });
    // Two non-plain objects: the override wins, identity preserved.
    expect(shallowMerge(new Date(1), date)).toBe(date);
  });

  test('merges objects created via Object.create(null)', () => {
    const defaults = Object.assign(Object.create(null), { a: 1 });
    expect(shallowMerge(defaults, { b: 2 })).toStrictEqual({ a: 1, b: 2 });
  });
});
