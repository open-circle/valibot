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
});
