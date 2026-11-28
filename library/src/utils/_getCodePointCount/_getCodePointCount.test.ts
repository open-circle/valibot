import { describe, expect, test } from 'vitest';
import { _getCodePointCount } from './_getCodePointCount.ts';

describe('_getCodePointCount', () => {
  test('should return code points count', () => {
    expect(_getCodePointCount('')).toBe(0);
    expect(_getCodePointCount('hello world')).toBe(11);
    expect(_getCodePointCount('😀')).toBe(1);
    expect(_getCodePointCount('👨🏽‍👩🏽‍👧🏽‍👦🏽')).toBe(11); // (U+1F468 + U+1F3FD) + U+200D + (U+1F469 + U+1F3FD) + U+200D + (U+1F467 + U+1F3FD) + U+200D + (U+1F466 + U+1F3FD)
    expect(_getCodePointCount('𝄞')).toBe(1);
    expect(_getCodePointCount('😶‍🌫️')).toBe(4); // U+1F636 + U+200D + (U+1F32B + U+FE0F)
    expect(_getCodePointCount('竈門禰󠄀豆子')).toBe(6); // 禰󠄀 = U+79B0 (禰) + U+E0100
    expect(_getCodePointCount('𛁟゙ん𛀸゙')).toBe(5); // (U+1B05F + U+3099) + U+3093 + (U+1B038 + U+3099)
    expect(_getCodePointCount('奈良県葛󠄀城市')).toBe(7); // 葛󠄀 = U+845B (葛) + U+E0100
    expect(_getCodePointCount('𠮷野家で𩸽')).toBe(5);
    // Ill-formed code unit sequences that have unpaired surrogate code units
    expect(_getCodePointCount('\ud800\udbff')).toBe(2);
    expect(_getCodePointCount('\udc00\udfff')).toBe(2);
  });
});
