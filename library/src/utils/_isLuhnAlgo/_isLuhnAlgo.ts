/**
 * Checks whether a string with numbers corresponds to the luhn algorithm.
 *
 * @param input The input to be checked.
 *
 * @returns Whether input is valid.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isLuhnAlgo(input: string): boolean {
  // Create necessary variables
  let index = input.length;
  let bit = 1;
  let sum = 0;

  // Calculate sum of algorithm
  while (index) {
    const charCode = input.charCodeAt(--index);
    if (charCode >= 48 && charCode <= 57) {
      const value = charCode - 48;
      bit ^= 1;
      sum += bit ? (value > 4 ? value * 2 - 9 : value * 2) : value;
    }
  }

  // Return whether its valid
  return sum % 10 === 0;
}
