let store: Map<string, Intl.Segmenter>;

/**
 * Returns the word count of the input.
 *
 * @param locales The locales to be used.
 * @param input The input to be measured.
 *
 * @returns The word count.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getWordCount(
  locales: Intl.LocalesArgument,
  input: string
): number {
  if (!store) {
    store = new Map();
  }
  // Hint: We use a stable string key instead of `locales` directly, because
  // `Intl.LocalesArgument` is often a non-primitive value (an array or an
  // `Intl.Locale` object). Such values are compared by reference in a `Map`,
  // which would defeat the cache and recreate the segmenter on every call.
  const key = String(locales);
  let segmenter = store.get(key);
  if (!segmenter) {
    segmenter = new Intl.Segmenter(locales, { granularity: 'word' });
    store.set(key, segmenter);
  }
  const segments = segmenter.segment(input);
  let count = 0;
  for (const segment of segments) {
    if (segment.isWordLike) {
      count++;
    }
  }
  return count;
}
