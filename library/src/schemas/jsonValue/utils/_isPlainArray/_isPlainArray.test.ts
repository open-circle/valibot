import { describe, expect, test } from 'vitest';
import { _isPlainArray } from './_isPlainArray.ts';

describe('_isPlainArray', () => {
  test('should return true for ordinary array', () => {
    expect(_isPlainArray([])).toBe(true);
    expect(_isPlainArray([1, 2, 3])).toBe(true);
  });

  test('should return true for array with null prototype', () => {
    const input: unknown[] = [];
    Object.setPrototypeOf(input, null);
    expect(_isPlainArray(input)).toBe(true);
  });

  test('should return false for array subclass instance', () => {
    class CustomArray extends Array {}
    expect(_isPlainArray(new CustomArray())).toBe(false);
  });

  test('should return false for array with ordinary object prototype', () => {
    const input: unknown[] = [];
    Object.setPrototypeOf(input, {});
    expect(_isPlainArray(input)).toBe(false);
  });
});
