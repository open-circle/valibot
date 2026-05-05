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
    return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? 'null';
  }
  return type;
}
