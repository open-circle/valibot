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
  const digits = input.split('').map((c) => (c === 'X' ? 10 : parseInt(c)));
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (10 - i);
  }
  return sum % 11 === 0;
}
