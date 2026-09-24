import { afterEach, describe, expect, test, vi } from 'vitest';
import { _getWordCount } from './_getWordCount.ts';

describe('_getWordCount', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('without creating a segmenter for an empty input', () => {
    const OriginalSegmenter = Intl.Segmenter;
    const segmenterSpy = vi
      .spyOn(Intl, 'Segmenter')
      .mockImplementation(function (locales, options) {
        return new OriginalSegmenter(locales, options);
      });
    expect(_getWordCount('en', '', Infinity)).toBe(0);
    expect(segmenterSpy).not.toHaveBeenCalled();
  });

  test('should return word count', () => {
    expect(_getWordCount('en', '', Infinity)).toBe(0);
    expect(_getWordCount('en', 'h', Infinity)).toBe(1);
    expect(_getWordCount('en', 'hello', Infinity)).toBe(1);
    expect(_getWordCount('en', 'hello world', Infinity)).toBe(2);
    expect(_getWordCount('en', '🧑🏻‍💻', Infinity)).toBe(0);
    expect(_getWordCount('th', 'สวัสดี', Infinity)).toBe(1);
  });

  test('should stop at the limit', () => {
    expect(_getWordCount('en', 'hello world from Valibot', 2)).toBe(2);
    expect(_getWordCount('en', 'hello world', 5)).toBe(2);
  });

  test('should cache segmenter for non-primitive locales', () => {
    const OriginalSegmenter = Intl.Segmenter;
    const SegmenterSpy = vi
      .spyOn(Intl, 'Segmenter')
      .mockImplementation(function (locales, options) {
        return new OriginalSegmenter(locales, options);
      });

    // An array of locales and an `Intl.Locale` object are non-primitive values
    // with a fresh reference on each call, so they must be cached by a stable
    // key instead of by reference.
    _getWordCount(['ja-JP'], 'foo bar', Infinity);
    _getWordCount(['ja-JP'], 'baz qux', Infinity);
    _getWordCount(new Intl.Locale('ja-JP'), 'foo bar', Infinity);
    _getWordCount(new Intl.Locale('ja-JP'), 'baz qux', Infinity);

    // The segmenter for `ja-JP` should only be created once, even though four
    // distinct (but equal) locale arguments were passed.
    expect(SegmenterSpy).toHaveBeenCalledTimes(1);
  });

  // TODO: This test is failing in CI, but works locally 😑
  // test('should take locale into account', () => {
  //   expect(_getWordCount('zh', 'foo:bar baz:qux', Infinity)).toBe(4);
  //   expect(_getWordCount('he', 'foo:bar baz:qux', Infinity)).toBe(4);
  //   expect(_getWordCount('sv', 'foo:bar baz:qux', Infinity)).toBe(2);
  //   expect(_getWordCount('fi', 'foo:bar baz:qux', Infinity)).toBe(2);
  // });
});
