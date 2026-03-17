/**
 * Checks if the given value is a plain object.
 *
 * @param value The value to check.
 *
 * @returns Whether the value is a plain object.
 */
// @__NO_SIDE_EFFECTS__
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return (
    Object.getPrototypeOf(value) === proto ||
    Object.getPrototypeOf(value) === null
  );
}
