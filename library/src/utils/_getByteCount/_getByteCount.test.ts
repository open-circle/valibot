import { describe, expect, test } from 'vitest';
import { _getByteCount } from './_getByteCount.ts';

describe('_getByteCount', () => {
  test('should return byte count', () => {
    expect(_getByteCount('hello world')).toBe(11);
    expect(_getByteCount('😀')).toBe(4);
    expect(_getByteCount('🧑🏻‍💻')).toBe(15);
    expect(_getByteCount('𝄞')).toBe(4);
    expect(_getByteCount('สวัสดี')).toBe(18);
    expect(_getByteCount('')).toBe(0);
  });

  test('should count unpaired surrogates as replacement characters', () => {
    expect(_getByteCount('\ud800')).toBe(3);
    expect(_getByteCount('\udc00')).toBe(3);
    expect(_getByteCount('a\ud800b')).toBe(5);
  });

  test('should return byte count of inputs exceeding the buffer', () => {
    expect(_getByteCount('a'.repeat(10000))).toBe(10000);
    expect(_getByteCount('я'.repeat(5000))).toBe(10000);
    // Surrogate pair crosses the 4096 byte boundary of the buffer
    expect(_getByteCount(`${'a'.repeat(4094)}😀b`)).toBe(4099);
    // Surrogate pair is split by the end of the first and second chunk
    expect(_getByteCount(`${'a'.repeat(4095)}😀b`)).toBe(4100);
    expect(_getByteCount(`${'a'.repeat(8191)}😀b`)).toBe(8196);
    // Chunk ends with an unpaired surrogate
    expect(_getByteCount(`${'a'.repeat(4095)}\ud800b`)).toBe(4099);
  });

  test('should match the length of the encoded input', () => {
    const encoder = new TextEncoder();
    const units = ['a', 'я', '€', '😀', '\ud800', '\udc00'];
    for (let length = 4090; length < 4110; length++) {
      for (let offset = 0; offset < units.length; offset++) {
        let input = '';
        for (let index = 0; index < length; index++) {
          input += units[(index * 7 + offset) % units.length];
        }
        expect(_getByteCount(input)).toBe(encoder.encode(input).length);
      }
    }
  });
});
