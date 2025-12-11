/**
 * Returns the digit count of the input.
 *
 * @param input The input to be measured.
 *
 * @returns The digit count.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getDigitCount(input: string): number {
  return (input.match(/\d/gu) || []).length;
}
