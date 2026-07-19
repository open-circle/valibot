import { describe, expect, test } from 'vitest';
import { _isBtcAddressBase58 } from './_isBtcAddressBase58.ts';

describe('_isBtcAddressBase58', () => {
  test('should return true', () => {
    expect(_isBtcAddressBase58('1AoW95pvyjyBuSRHYHDRcJXcG5VzRmyi8X')).toBe(
      true
    );
    expect(_isBtcAddressBase58('3HJ6dgpDGihdQAyLVbZrSSPcqdtC7WZqYh')).toBe(
      true
    );
    expect(_isBtcAddressBase58('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn')).toBe(
      true
    );
    expect(_isBtcAddressBase58('2N2JD6wb56AfK4tfmM6PwdVmoYk2dCKf4Br')).toBe(
      true
    );
  });

  test('should return false', () => {
    expect(_isBtcAddressBase58('1AoW95pvyjaBuSRHYHDRcJXcG5VzRmyi8X')).toBe(
      false
    );
    expect(_isBtcAddressBase58('QLbz7JHiBTspS962RLKV8GndWFwjA5K66')).toBe(
      false
    );
    expect(
      _isBtcAddressBase58('bc1qalxx0z89f975utgn7kygk49juswet08md9ueet')
    ).toBe(false);
  });
});
