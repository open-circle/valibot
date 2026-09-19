let segmenter: Intl.Segmenter;

/**
 * Returns the grapheme count of the input.
 *
 * @param input The input to be measured.
 * @param limit The optional count limit.
 *
 * @returns The grapheme count, or the count at which the limit was reached.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getGraphemeCount(input: string, limit?: number): number {
  if (limit !== undefined && limit <= 0) {
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
    if (limit !== undefined && count >= limit) {
      break;
    }
  }
  return count;
}
