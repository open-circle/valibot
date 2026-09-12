import { describe, expect, test } from 'vitest';
import { _isSameValueZero } from './_isSameValueZero.ts';

describe('_isSameValueZero', () => {
  test('should return whether values are equal', () => {
    expect(_isSameValueZero('foo', 'foo')).toBe(true);
    expect(_isSameValueZero('foo', 'bar')).toBe(false);
    expect(_isSameValueZero(NaN, NaN)).toBe(true);
    expect(_isSameValueZero(NaN, 0)).toBe(false);
    expect(_isSameValueZero(-0, 0)).toBe(true);
  });
});
