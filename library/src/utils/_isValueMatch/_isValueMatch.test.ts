import { describe, expect, test } from 'vitest';
import { _isValueMatch } from './_isValueMatch.ts';

describe('_isValueMatch', () => {
  test('should return true for matching values', () => {
    expect(_isValueMatch('foo', 'foo')).toBe(true);
    expect(_isValueMatch(NaN, NaN)).toBe(true);
    expect(_isValueMatch(-0, 0)).toBe(true);
    expect(_isValueMatch(123, '123')).toBe(true);
    expect(_isValueMatch(new Date(123), 123)).toBe(true);
    expect(_isValueMatch(new Date(123), new Date(123))).toBe(true);
  });

  test('should return false for non-matching values', () => {
    expect(_isValueMatch(NaN, 0)).toBe(false);
    expect(_isValueMatch(123, '456')).toBe(false);
    expect(_isValueMatch(new Date(123), new Date(456))).toBe(false);
  });

  test('should return false for invalid dates', () => {
    const invalidDate = new Date(NaN);
    expect(_isValueMatch(invalidDate, invalidDate)).toBe(false);
    expect(_isValueMatch(invalidDate, new Date(NaN))).toBe(false);
  });

  test('should compare dates from another realm by their timestamp', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    try {
      const { Date: OtherDate } = iframe.contentWindow as Window &
        typeof globalThis;
      const invalidDate = new OtherDate(NaN);
      expect(invalidDate).not.toBeInstanceOf(Date);
      expect(_isValueMatch(invalidDate, invalidDate)).toBe(false);
      expect(_isValueMatch(new OtherDate(123), new Date(123))).toBe(true);
    } finally {
      iframe.remove();
    }
  });
});
