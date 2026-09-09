/**
 * Returns the code point count of the input.
 *
 * @param input The input to be measured.
 * @param limit The optional count limit.
 *
 * @returns The code point count, or the count at which the limit was reached.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getCodePointCount(input: string, limit?: number): number {
  if (limit !== undefined) {
    if (limit <= 0) {
      return 0;
    }
    let count = 0;
    for (let i = 0; i < input.length; ) {
      count++;
      if (count >= limit) {
        return count;
      }
      // codePointAt never returns undefined because i is always in bounds
      i += input.codePointAt(i)! > 0xffff ? 2 : 1;
    }
    return count;
  }

  let count = input.length;
  // A surrogate pair cannot start at the last code unit, so no iteration needs
  // to start there
  const lengthMinus1 = input.length - 1;
  for (let i = 0; i < lengthMinus1; ) {
    // codePointAt never returns undefined because i is always in bounds
    if (input.codePointAt(i)! <= 0xffff) {
      i++;
    } else {
      i += 2; // Move past both code units of the surrogate pair
      count--; // Count the pair as one code point instead of two code units
    }
  }
  return count;
}
