import { describe, expect, test } from 'vitest';
import { _getDigitCount } from './_getDigitCount.ts';

describe('_getDigitCount', () => {
  test('should return digit count', () => {
    expect(_getDigitCount('')).toBe(0);
    expect(_getDigitCount('hello world')).toBe(0);
    expect(_getDigitCount('he22o world')).toBe(2);
    expect(_getDigitCount('hello world111')).toBe(3);
    expect(_getDigitCount('111hello world111')).toBe(6);
    expect(_getDigitCount('123')).toBe(3);
    expect(_getDigitCount('😀1')).toBe(1);
  });

  test('should only count ASCII digits', () => {
    expect(_getDigitCount('/:')).toBe(0);
    expect(_getDigitCount('0/9:')).toBe(2);
    expect(_getDigitCount('١٢٣')).toBe(0);
    expect(_getDigitCount('１２３')).toBe(0);
    expect(_getDigitCount('x²')).toBe(0);
  });
});
