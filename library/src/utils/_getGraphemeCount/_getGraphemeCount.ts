let segmenter: Intl.Segmenter;

/**
 * Returns the grapheme count of the input.
 *
 * @param input The input to be measured.
 *
 * @returns The grapheme count.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getGraphemeCount(input: string): number {
  // Hint: An empty input has no graphemes, so the expensive segmentation can be
  // skipped and the segmenter does not even have to be created
  if (input === '') {
    return 0;
  }
  if (!segmenter) {
    segmenter = new Intl.Segmenter();
  }
  const segments = segmenter.segment(input);
  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of segments) {
    count++;
  }
  return count;
}
