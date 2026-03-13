import { describe, expect, test } from 'vitest';
import { _isIsbn10 } from './_isIsbn10.ts';

describe('_isIsbn10', () => {
  test('should return true', () => {
    expect(_isIsbn10('0306406152')).toBe(true);
    expect(_isIsbn10('0451526538')).toBe(true);
    expect(_isIsbn10('0007149689')).toBe(true);
    expect(_isIsbn10('043942089X')).toBe(true);
    expect(_isIsbn10('097522980X')).toBe(true);
    expect(_isIsbn10('0684843285')).toBe(true);
    expect(_isIsbn10('1566199093')).toBe(true);
  });

  test('should return false', () => {
    expect(_isIsbn10('0306406153')).toBe(false);
    expect(_isIsbn10('0451526539')).toBe(false);
    expect(_isIsbn10('0007149680')).toBe(false);
    expect(_isIsbn10('0439420891')).toBe(false);
    expect(_isIsbn10('0975229801')).toBe(false);
    expect(_isIsbn10('0684843286')).toBe(false);
    expect(_isIsbn10('1566199094')).toBe(false);
  });
});
