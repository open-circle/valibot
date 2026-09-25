import { describe, expect, test } from 'vitest';
import { _isBech32 } from './_isBech32.ts';

describe('_isBech32', () => {
  test('should return true', () => {
    expect(
      _isBech32('bc1qalxx0z89f975utgn7kygk49juswet08md9ueet', ['bc'], 'bech32')
    ).toBe(true);
    expect(
      _isBech32(
        'bc1qalxx0z89f975utgn7kygk49juswet08md9ueet',
        ['bc'],
        'bech32',
        () => true
      )
    ).toBe(true);
    expect(
      _isBech32(
        'bc1pk25q77wt6fltgn9ys87mgpp68llxs52mx5alpdl9ydmwxq09w07qywpdur',
        ['bc'],
        'bech32m'
      )
    ).toBe(true);
  });

  test('should return false', () => {
    expect(
      _isBech32('bc1qalxx0z89f975utgn7kygk49juswet08md9ueet', ['tb'], 'bech32')
    ).toBe(false);
    expect(
      _isBech32(
        'bc1qalxx0z89f975utgn7kygk49juswet08md9ueet',
        ['bc'],
        'bech32m'
      )
    ).toBe(false);
    expect(
      _isBech32('bc1qalxx0z89f975utgn7kygk49juswet0hmd9ueet', ['bc'], 'bech32')
    ).toBe(false);
    expect(_isBech32('bc1qalxx0z89f975utgn7kygk49juswet08md9ueet\n', ['bc'], 'bech32')).toBe(false);
    expect(_isBech32('bc1qqqqq', ['bc'], 'bech32')).toBe(false);
    expect(_isBech32('bc1qqqqqq$qqqqqq', ['bc'], 'bech32')).toBe(false);
    expect(
      _isBech32(
        'bc1qalxx0z89f975utgn7kygk49juswet08md9ueet',
        ['bc'],
        'bech32',
        () => false
      )
    ).toBe(false);
  });
});
