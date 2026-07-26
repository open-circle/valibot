// RegExp for matching special regex characters
const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;

/**
 * Escapes special regex characters in a string.
 *
 * @param string The string to escape.
 *
 * @returns The escaped string.
 */
export function escapeRegExp(string: string): string {
  return string.replace(ESCAPE_REGEX, '\\$&');
}
