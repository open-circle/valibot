/**
 * Splits a string into lowercase words and rejoins them with the given
 * separator and capitalization rules.
 *
 * Words are separated by `_`, `-` and ASCII whitespace, as well as by case
 * and acronym boundaries. Whether the first or subsequent words are
 * capitalized is controlled by `capFirst` and `capRest`.
 *
 * Hint: Implemented in a single pass that emits directly to the result
 * string to avoid an intermediate `string[]` allocation. ASCII chars are
 * classified via char codes to skip `.toLowerCase()` and `.toUpperCase()`
 * method calls in the common case.
 *
 * Hint: Digits are treated as a separate character class, so `item2Name`
 * yields `item2` and `name` rather than `item`, `2` and `name`.
 *
 * @param input The input string.
 * @param separator The string inserted between words.
 * @param capFirst Whether to capitalize the first word.
 * @param capRest Whether to capitalize subsequent words.
 *
 * @returns The formatted string.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _formatCase(
  input: string,
  separator: string,
  capFirst: boolean,
  capRest: boolean
): string {
  // Char type codes used for boundary detection:
  // 0 = separator, 1 = uppercase, 2 = lowercase, 3 = other (digit, symbol)

  // Create necessary variables
  let result = '';
  let firstWord = true;
  let start = 0;
  let prev = 0;
  let prevPrev = 0;

  // Append current word slice to result, applying capitalization
  const flush = (end: number): void => {
    if (end > start) {
      let word = input.slice(start, end).toLowerCase();

      // If this word should be capitalized, uppercase its first char
      if (firstWord ? capFirst : capRest) {
        const firstCode = word.charCodeAt(0);
        if (firstCode >= 97 && firstCode <= 122) {
          // Hint: For ASCII lowercase letters (codes 97–122), subtract 32
          // to derive the uppercase code. This avoids `.toUpperCase()` for
          // the common case.
          word = String.fromCharCode(firstCode - 32) + word.slice(1);
        } else {
          // Hint: Codes 0xD800–0xDBFF are high surrogates that pair with
          // the next code unit to form one supplementary-plane character
          // (e.g. Deseret, Adlam). Slice both code units so `.toUpperCase()`
          // sees the full character.
          const charLen = firstCode >= 0xd800 && firstCode <= 0xdbff ? 2 : 1;
          word = word.slice(0, charLen).toUpperCase() + word.slice(charLen);
        }
      }

      result += firstWord ? word : separator + word;
      firstWord = false;
    }
  };

  // Iterate over each char in input
  for (let index = 0; index < input.length; index++) {
    const code = input.charCodeAt(index);
    let type: number;

    // If char is `_`, `-`, ` `, `\t`, `\n`, `\v`, `\f` or `\r`, flush
    // current word and skip char
    if (
      code === 32 ||
      code === 9 ||
      code === 10 ||
      code === 11 ||
      code === 12 ||
      code === 13 ||
      code === 45 ||
      code === 95
    ) {
      flush(index);
      start = index + 1;
      type = 0;

      // Otherwise, if char is ASCII, classify by char code range
    } else if (code < 128) {
      type = code >= 65 && code <= 90 ? 1 : code >= 97 && code <= 122 ? 2 : 3;

      // Otherwise, fall back to case folding for non-ASCII chars
    } else {
      const char = input[index];
      const charLower = char.toLowerCase();
      type = charLower === char.toUpperCase() ? 3 : char === charLower ? 2 : 1;
    }

    // If uppercase follows lowercase or other, split before this char
    if (type === 1 && (prev === 2 || prev === 3) && index > start) {
      flush(index);
      start = index;

      // Otherwise, if lowercase follows two consecutive uppercase chars,
      // split before previous char to end acronym run
      // Hint: Only a real lowercase letter ends an acronym — digits do not.
      // This keeps `HTTP2` together while still splitting `URLParser` into
      // `url` and `parser`.
    } else if (
      type === 2 &&
      prev === 1 &&
      prevPrev === 1 &&
      index - 1 > start
    ) {
      flush(index - 1);
      start = index - 1;
    }

    // Update char type history for next iteration
    prevPrev = prev;
    prev = type;
  }

  // Flush trailing word
  flush(input.length);
  return result;
}
