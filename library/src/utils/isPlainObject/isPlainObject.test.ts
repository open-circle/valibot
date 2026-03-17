import { describe, expect, test } from 'vitest';
import { isPlainObject } from './isPlainObject.ts';

describe('isPlainObject', () => {
  test('should return true for plain objects and null prototype', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ foo: 1, bar: 2 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  test.each([
    null,
    123,
    'foo',
    true,
    1n,
    Symbol('foo'),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    function () {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
    [],
    new Map(),
    new Set(),
    new Date(),
  ])('should return false for %s', (value) => {
    expect(isPlainObject(value)).toBe(false);
  });
});
