/**
 * Indents each line of a multi-line string by the given number of spaces.
 *
 * @param code The code string to indent.
 * @param spaces The number of spaces to indent by.
 *
 * @returns The indented code string.
 */
export function indent(code: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line) => (line.length > 0 ? pad + line : line))
    .join('\n');
}
