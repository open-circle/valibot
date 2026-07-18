/**
 * [Validates an ISBN-13](https://en.wikipedia.org/wiki/ISBN#ISBN-13_check_digit_calculation).
 *
 * @param input The input value.
 *
 * @returns `true` if the input is a valid ISBN-13, `false` otherwise.
 *
 * @internal
 */
export function _isIsbn13(input: string): boolean {
  const digits = input.split('').map((c) => parseInt(c));
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  return sum % 10 === 0;
}
