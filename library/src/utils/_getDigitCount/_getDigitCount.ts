/**
 * Returns the digit count of the input.
 *
 * Hint: Only the ASCII digits 0-9 are counted.
 *
 * @param input The input to be measured.
 *
 * @returns The digit count.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getDigitCount(input: string): number {
  let count = 0;
  for (let index = 0; index < input.length; index++) {
    const charCode = input.charCodeAt(index);
    if (charCode >= 48 && charCode <= 57) {
      count++;
    }
  }
  return count;
}
