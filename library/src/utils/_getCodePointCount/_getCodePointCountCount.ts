/**
 * Returns the code point count of the input.
 *
 * @param input The input to be measured.
 *
 * @returns The code point count.
 *
 * @internal
 */
export function _getCodePointCount(input: string): number {
  let count = input.length;
  for (let i = 0; i < input.length; ) {
    // If codePoint were undefined here, we would have already got out of loop
    if (input.codePointAt(i)! <= 65535) {
      i++;
    } else {
      i += 2; // 2 characters (surrogate pair) in JS (UTF-16)
      count--; // compensate for over-counting
    }
  }
  return count;
}
