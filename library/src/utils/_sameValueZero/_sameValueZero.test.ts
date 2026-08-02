import { describe, expect, test } from 'vitest';
import { _sameValueZero } from './_sameValueZero.ts';

describe('_sameValueZero', () => {
  test('should return whether values are equal', () => {
    expect(_sameValueZero('foo', 'foo')).toBe(true);
    expect(_sameValueZero('foo', 'bar')).toBe(false);
    expect(_sameValueZero(NaN, NaN)).toBe(true);
    expect(_sameValueZero(NaN, 0)).toBe(false);
    expect(_sameValueZero(-0, 0)).toBe(true);
  });
});
