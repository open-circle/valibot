/**
 * Stringifies an unknown input to a literal or type string.
 *
 * @param input The unknown input.
 *
 * @returns A literal or type string.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _stringify(input: unknown): string {
  const type = typeof input;
  if (type === 'string') {
    return `"${input}"`;
  }
  // TODO: Should we add "n" suffix to bigints?
  if (type === 'number' || type === 'bigint' || type === 'boolean') {
    return `${input}`;
  }
  if (type === 'object' || type === 'function') {
    if (!input) {
      return 'null';
    }
    // Hint: `input` may be a `Proxy` whose `getPrototypeOf` trap throws, so
    // this is wrapped in a `try` block to fall back to a generic name
    // instead of letting the exception escape.
    try {
      return Object.getPrototypeOf(input)?.constructor?.name ?? 'null';
    } catch {
      return 'Object';
    }
  }
  return type;
}
