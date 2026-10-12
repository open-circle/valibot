import { describe, expect, test } from 'vitest';
import { _getDecimalPlaces } from './_getDecimalPlaces.ts';

describe('_getDecimalPlaces', () => {
  test('should return 0 for integers', () => {
    expect(_getDecimalPlaces(0)).toBe(0);
    expect(_getDecimalPlaces(-0)).toBe(0);
    expect(_getDecimalPlaces(1)).toBe(0);
    expect(_getDecimalPlaces(-1)).toBe(0);
    expect(_getDecimalPlaces(100)).toBe(0);
    expect(_getDecimalPlaces(Number.MAX_SAFE_INTEGER)).toBe(0);
  });

  test('should return decimal places for plain decimals', () => {
    expect(_getDecimalPlaces(0.1)).toBe(1);
    expect(_getDecimalPlaces(-0.1)).toBe(1);
    expect(_getDecimalPlaces(0.01)).toBe(2);
    expect(_getDecimalPlaces(0.001)).toBe(3);
    expect(_getDecimalPlaces(1.5)).toBe(1);
    expect(_getDecimalPlaces(1.234)).toBe(3);
    expect(_getDecimalPlaces(-1.234)).toBe(3);
  });

  test('should add exponent for scientific notation with negative exponent', () => {
    expect(_getDecimalPlaces(1e-7)).toBe(7);
    expect(_getDecimalPlaces(-1e-7)).toBe(7);
    expect(_getDecimalPlaces(1.5e-7)).toBe(8);
    expect(_getDecimalPlaces(2.345e-10)).toBe(13);
  });

  test('should clamp at 0 for scientific notation with positive exponent', () => {
    // `(1e21).toString()` is "1e+21" — exponent parse handles the leading '+'
    expect(_getDecimalPlaces(1e21)).toBe(0);
    expect(_getDecimalPlaces(-1e21)).toBe(0);
    expect(_getDecimalPlaces(1.5e21)).toBe(0);
    expect(_getDecimalPlaces(1.234e21)).toBe(0);
  });

  test('should return 0 for non-finite numbers', () => {
    expect(_getDecimalPlaces(Infinity)).toBe(0);
    expect(_getDecimalPlaces(-Infinity)).toBe(0);
    expect(_getDecimalPlaces(NaN)).toBe(0);
  });
});
