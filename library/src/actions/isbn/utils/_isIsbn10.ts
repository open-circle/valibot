/**
 * [Validates an ISBN-10](https://en.wikipedia.org/wiki/ISBN#ISBN-10_check_digits).
 *
 * @param input The input value.
 *
 * @returns `true` if the input is a valid ISBN-10, `false` otherwise.
 *
 * @internal
 */
export function _isIsbn10(input: string): boolean {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const charCode = input.charCodeAt(i);
    if (charCode === 88) {
      sum += 10 * (10 - i);
    } else if (charCode >= 48 && charCode <= 57) {
      sum += (charCode - 48) * (10 - i);
    } else {
      return false;
    }
  }
  return sum % 11 === 0;
}
