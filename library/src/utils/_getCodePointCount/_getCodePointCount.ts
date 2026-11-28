/**
 * Returns the code point count of the input.
 *
 * @param input The input to be measured.
 *
 * @returns The code point count.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getCodePointCount(input: string): number {
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
