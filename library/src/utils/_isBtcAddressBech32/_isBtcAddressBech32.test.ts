import { describe, expect, test } from 'vitest';
import { _isBtcAddressBech32 } from './_isBtcAddressBech32.ts';

describe('_isBtcAddressBech32', () => {
  test('should return true', () => {
    expect(
      _isBtcAddressBech32('bc1qalxx0z89f975utgn7kygk49juswet08md9ueet')
    ).toBe(true);
    expect(
      _isBtcAddressBech32('BC1QALXX0Z89F975UTGN7KYGK49JUSWET08MD9UEET')
    ).toBe(true);
    expect(
      _isBtcAddressBech32(
        'bc1pk25q77wt6fltgn9ys87mgpp68llxs52mx5alpdl9ydmwxq09w07qywpdur'
      )
    ).toBe(true);
    expect(
      _isBtcAddressBech32(
        'BC1PK25Q77WT6FLTGN9YS87MGPP68LLXS52MX5ALPDL9YDMWXQ09W07QYWPDUR'
      )
    ).toBe(true);
  });

  test('should return false', () => {
    expect(
      _isBtcAddressBech32('bc1qalxx0z89f975utgn7kygk49juswet0hmd9ueet')
    ).toBe(false);
    expect(
      _isBtcAddressBech32(
        'bc1pu4zg8y0zjawf8heauxan82e69dhq9mtsq9lwr3qyzkvf79cpmfmshmrela'
      )
    ).toBe(false);
    expect(
      _isBtcAddressBech32('bc1QALXX0Z89F975UTGN7KYGK49JUSWET08MD9UEET')
    ).toBe(false);
    expect(_isBtcAddressBech32('bc13qqqqqqqx66tz5')).toBe(false);
    expect(_isBtcAddressBech32('bc1qqqqqqqpxn7fl2')).toBe(false);
    expect(
      _isBtcAddressBech32(
        'bc1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqepcyyg'
      )
    ).toBe(false);
    expect(_isBtcAddressBech32('bc1qqqqqqqqqqqqqqqqqh2xx79')).toBe(false);
    expect(_isBtcAddressBech32('1AoW95pvyjyBuSRHYHDRcJXcG5VzRmyi8X')).toBe(
      false
    );
  });
});
