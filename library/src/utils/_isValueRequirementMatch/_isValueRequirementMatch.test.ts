import { describe, expect, test } from 'vitest';
import { _isValueRequirementMatch } from './_isValueRequirementMatch.ts';

describe('_isValueRequirementMatch', () => {
  test('should return true for matching values', () => {
    expect(_isValueRequirementMatch('foo', 'foo')).toBe(true);
    expect(_isValueRequirementMatch(NaN, NaN)).toBe(true);
    expect(_isValueRequirementMatch(-0, 0)).toBe(true);
    expect(_isValueRequirementMatch(123, '123')).toBe(true);
    expect(_isValueRequirementMatch(new Date(123), 123)).toBe(true);
    expect(_isValueRequirementMatch(new Date(123), new Date(123))).toBe(true);
  });

  test('should return false for non-matching values', () => {
    expect(_isValueRequirementMatch(NaN, 0)).toBe(false);
    expect(_isValueRequirementMatch(123, '456')).toBe(false);
    expect(_isValueRequirementMatch(new Date(123), new Date(456))).toBe(false);
    expect(_isValueRequirementMatch(new Date(NaN), new Date(NaN))).toBe(false);
  });
});
