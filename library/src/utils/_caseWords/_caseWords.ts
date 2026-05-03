/**
 * Tokenizes a string into lowercase words, splitting on separator characters
 * (`_`, `-`, space), lowercase→uppercase boundaries, and acronym-run→lowercase
 * boundaries (e.g. `parseURLValue` → `['parse', 'url', 'value']`).
 *
 * Digits are treated as lowercase for boundary detection, so `item2Name`
 * yields `['item2', 'name']`.
 *
 * @param input The input string.
 *
 * @returns The tokenized words.
 */
export function _caseWords(input: string): string[] {
  const words: string[] = [];
  let word = '';
  let prevWasUpper = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (
      ch === '_' ||
      ch === '-' ||
      ch === ' ' ||
      ch === '\t' ||
      ch === '\n' ||
      ch === '\r' ||
      ch === '\f' ||
      ch === '\v'
    ) {
      if (word) {
        words.push(word);
        word = '';
      }
      prevWasUpper = false;
      continue;
    }

    const lower = ch.toLowerCase();
    const isUpper = ch !== lower;

    if (isUpper) {
      const nextCh = i + 1 < input.length ? input[i + 1] : '';
      // nextIsLower: only real lowercase letters, not digits
      const nextIsLower =
        nextCh !== '' &&
        nextCh === nextCh.toLowerCase() &&
        nextCh !== nextCh.toUpperCase();

      if (word && !prevWasUpper) {
        // lower/digit → upper: split
        words.push(word);
        word = lower;
      } else if (word && prevWasUpper && nextIsLower) {
        // acronym-run → lower: this char opens the new word
        words.push(word);
        word = lower;
      } else {
        word += lower;
      }
      prevWasUpper = true;
    } else {
      word += lower;
      prevWasUpper = false;
    }
  }

  if (word) words.push(word);
  return words;
}
