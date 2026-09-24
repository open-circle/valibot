/**
 * Returns the code point count of the input.
 *
 * @param input The input to be measured.
 * @param limit The count limit, at least 1. Pass `Infinity` to count the
 * entire input.
 *
 * @returns The code point count, or the count at which the limit was reached.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getCodePointCount(input: string, limit: number): number {
  // Hint: The prefix up to index i contains i - pairs code points, so the limit
  // is reached at index limit + pairs. Using this as the loop end avoids an
  // extra limit check per code unit
  let pairs = 0;
  let end = Math.min(input.length, limit);
  let i = 0;
  while (i < end) {
    // codePointAt never returns undefined because i is always in bounds
    if (input.codePointAt(i)! <= 0xffff) {
      i++;
    } else {
      i += 2; // Move past both code units of the surrogate pair
      pairs++; // Count the pair as one code point instead of two code units
      if (end < input.length) {
        end++; // The limit is now reached one code unit later
      }
    }
  }
  return i - pairs;
}
