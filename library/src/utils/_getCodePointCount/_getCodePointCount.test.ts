import { describe, expect, test } from 'vitest';
import { _getCodePointCount } from './_getCodePointCountCount.ts';

describe('_getCodePointCount', () => {
  test('should return code points count', () => {
    expect(_getCodePointCount('hello world')).toBe(11);
    expect(_getCodePointCount('😀')).toBe(1);
    expect(_getCodePointCount('👨🏽‍👩🏽‍👧🏽‍👦🏽')).toBe(11);
    expect(_getCodePointCount('𝄞')).toBe(1);
    expect(_getCodePointCount('😶‍🌫️')).toBe(4);
    expect(_getCodePointCount('竈門禰󠄀豆子')).toBe(6); // 禰󠄀 = U+79B0 (禰) + U+E0100
    expect(_getCodePointCount('𛁟゙ん𛀸゙')).toBe(5);
    expect(_getCodePointCount('奈良県葛󠄀城市')).toBe(7);
    expect(_getCodePointCount('𠮷野家で𩸽')).toBe(5);
  });
});
