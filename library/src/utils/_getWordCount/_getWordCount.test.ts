import { afterEach, describe, expect, test, vi } from 'vitest';
import { _getWordCount } from './_getWordCount.ts';

describe('_getWordCount', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should return word count', () => {
    expect(_getWordCount('en', '')).toBe(0);
    expect(_getWordCount('en', 'h')).toBe(1);
    expect(_getWordCount('en', 'hello')).toBe(1);
    expect(_getWordCount('en', 'hello world')).toBe(2);
    expect(_getWordCount('en', '🧑🏻‍💻')).toBe(0);
    expect(_getWordCount('th', 'สวัสดี')).toBe(1);
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
    _getWordCount(['ja-JP'], 'foo bar');
    _getWordCount(['ja-JP'], 'baz qux');
    _getWordCount(new Intl.Locale('ja-JP'), 'foo bar');
    _getWordCount(new Intl.Locale('ja-JP'), 'baz qux');

    // The segmenter for `ja-JP` should only be created once, even though four
    // distinct (but equal) locale arguments were passed.
    expect(SegmenterSpy).toHaveBeenCalledTimes(1);
  });

  // TODO: This test is failing in CI, but works locally 😑
  // test('should take locale into account', () => {
  //   expect(_getWordCount('zh', 'foo:bar baz:qux')).toBe(4);
  //   expect(_getWordCount('he', 'foo:bar baz:qux')).toBe(4);
  //   expect(_getWordCount('sv', 'foo:bar baz:qux')).toBe(2);
  //   expect(_getWordCount('fi', 'foo:bar baz:qux')).toBe(2);
  // });
});
