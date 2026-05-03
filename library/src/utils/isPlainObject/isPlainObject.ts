/**
 * Checks if the given value is a plain object.
 *
 * @param value The value to check.
 *
 * @returns Whether the value is a plain object.
 */
// inlined from @httpx/plain-object
// @__NO_SIDE_EFFECTS__
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return (
    proto === null ||
    proto === Object.prototype ||
    // Required to support node:vm.runInNewContext({})
    Object.getPrototypeOf(proto) === null
  );
}
