import { describe, expect, test } from 'vitest';
import { _isBase58Check } from './_isBase58Check.ts';

describe('_isBase58Check', () => {
  test('should return true', () => {
    const versions = [0x00, 0x05, 0x6f, 0xc4];

    expect(_isBase58Check('1AoW95pvyjyBuSRHYHDRcJXcG5VzRmyi8X', versions)).toBe(
      true
    );
    expect(_isBase58Check('3HJ6dgpDGihdQAyLVbZrSSPcqdtC7WZqYh', versions)).toBe(
      true
    );
    expect(_isBase58Check('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn', versions)).toBe(
      true
    );
    expect(_isBase58Check('2N2JD6wb56AfK4tfmM6PwdVmoYk2dCKf4Br', versions)).toBe(
      true
    );
  });

  test('should return false', () => {
    expect(_isBase58Check('1AoW95pvyjaBuSRHYHDRcJXcG5VzRmyi8X', [0x00])).toBe(
      false
    );
    expect(_isBase58Check('QLbz7JHiBTspS962RLKV8GndWFwjA5K66', [0x00])).toBe(
      false
    );
    expect(_isBase58Check('bc1qalxx0z89f975utgn7kygk49juswet08md9ueet', [
      0x00,
    ])).toBe(false);
  });
});
