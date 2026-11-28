import { describe, expect, test } from 'vitest';
import { _isLuhnAlgo } from './_isLuhnAlgo.ts';

describe('_isLuhnAlgo', () => {
  test('should return true', () => {
    expect(_isLuhnAlgo('53-649845-919122-6')).toBe(true);
    expect(_isLuhnAlgo('53 649845 919122 6')).toBe(true);
    expect(_isLuhnAlgo('536498459191226')).toBe(true);
    expect(_isLuhnAlgo('860548042618881')).toBe(true);
    expect(_isLuhnAlgo('304517506893326')).toBe(true);
    expect(_isLuhnAlgo('378282246310005')).toBe(true);
    expect(_isLuhnAlgo('6011000990139424')).toBe(true);
    expect(_isLuhnAlgo('7238493252455')).toBe(true);
    expect(_isLuhnAlgo('8924578427422')).toBe(true);
  });

  test('should return false', () => {
    expect(_isLuhnAlgo('53649845919122')).toBe(false);
    expect(_isLuhnAlgo('5146713835430')).toBe(false);
    expect(_isLuhnAlgo('72348235235')).toBe(false);
    expect(_isLuhnAlgo('83793719357')).toBe(false);
    expect(_isLuhnAlgo('892457842742223')).toBe(false);
  });
});
