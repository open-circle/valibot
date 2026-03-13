import { describe, expect, test } from 'vitest';
import { _isIsbn13 } from './_isIsbn13.ts';

describe('_isIsbn13', () => {
  test('should return true', () => {
    expect(_isIsbn13('9780306406157')).toBe(true);
    expect(_isIsbn13('9780451526533')).toBe(true);
    expect(_isIsbn13('9780007149681')).toBe(true);
    expect(_isIsbn13('9780439420891')).toBe(true);
    expect(_isIsbn13('9780975229804')).toBe(true);
    expect(_isIsbn13('9780684843285')).toBe(true);
    expect(_isIsbn13('9781566199094')).toBe(true);
  });

  test('should return false', () => {
    expect(_isIsbn13('9780306406158')).toBe(false);
    expect(_isIsbn13('9780451526534')).toBe(false);
    expect(_isIsbn13('9780007149682')).toBe(false);
    expect(_isIsbn13('9780439420892')).toBe(false);
    expect(_isIsbn13('9780975229805')).toBe(false);
    expect(_isIsbn13('9780684843286')).toBe(false);
    expect(_isIsbn13('9781566199095')).toBe(false);
  });
});
