import { describe, expect, test } from 'vitest';
import { _getCodePointCount } from './_getCodePointCount.ts';

describe('_getCodePointCount', () => {
  test('should return code points count', () => {
    expect(_getCodePointCount('', Infinity)).toBe(0);
    expect(_getCodePointCount('hello world', Infinity)).toBe(11);
    expect(_getCodePointCount('😀', Infinity)).toBe(1);
    expect(_getCodePointCount('👨🏽‍👩🏽‍👧🏽‍👦🏽', Infinity)).toBe(11); // (U+1F468 + U+1F3FD) + U+200D + (U+1F469 + U+1F3FD) + U+200D + (U+1F467 + U+1F3FD) + U+200D + (U+1F466 + U+1F3FD)
    expect(_getCodePointCount('𝄞', Infinity)).toBe(1);
    expect(_getCodePointCount('😶‍🌫️', Infinity)).toBe(4); // U+1F636 + U+200D + (U+1F32B + U+FE0F)
    expect(_getCodePointCount('竈門禰󠄀豆子', Infinity)).toBe(6); // 禰󠄀 = U+79B0 (禰) + U+E0100
    expect(_getCodePointCount('𛁟゙ん𛀸゙', Infinity)).toBe(5); // (U+1B05F + U+3099) + U+3093 + (U+1B038 + U+3099)
    expect(_getCodePointCount('奈良県葛󠄀城市', Infinity)).toBe(7); // 葛󠄀 = U+845B (葛) + U+E0100
    expect(_getCodePointCount('𠮷野家で𩸽', Infinity)).toBe(5);
    // Ill-formed code unit sequences that have unpaired surrogate code units
    expect(_getCodePointCount('\ud800\udbff', Infinity)).toBe(2);
    expect(_getCodePointCount('\udc00\udfff', Infinity)).toBe(2);
  });

  test('should stop at the limit', () => {
    expect(_getCodePointCount('😀👋🏼🧩', 2)).toBe(2);
    expect(_getCodePointCount('hello', 8)).toBe(5);
    expect(_getCodePointCount('😀😀', 3)).toBe(2);
  });
});
