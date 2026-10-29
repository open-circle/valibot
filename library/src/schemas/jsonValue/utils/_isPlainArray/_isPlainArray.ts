/**
 * Checks whether an array is a plain array, meaning not an instance of an
 * `Array` subclass. Since `jsonValue` never copies its input, accepting a
 * subclass instance would return it as is, typed as `JsonValue`, even
 * though it may carry extra behavior or state beyond its indexed items.
 *
 * Hint: The caller already established `input` is a real array via
 * `Array.isArray`. This checks that its prototype is itself a real array too,
 * via that same `Array.isArray` check (this realm's real
 * `Array.prototype`, or a cross-realm equivalent, is itself an array
 * exotic object, whereas an `Array` subclass's prototype, or an ordinary
 * object substituted as the prototype, is not), and that its own prototype
 * is `null` or has a `null` prototype, the same prototype chain shape that
 * `_isPlainObject` expects one hop up. That shape is checked directly rather
 * than via `_isPlainObject`, since `Array.prototype` is itself a prototype
 * object, which `_isPlainObject` rejects. An array whose
 * prototype was explicitly set to `null` is also accepted, matching how a
 * plain object created with `Object.create(null)` is accepted, even
 * though such an array is a rare, deliberate construction rather than
 * something `JSON.parse` would ever produce.
 *
 * @param input The array to check.
 *
 * @returns Whether the array is a plain array.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isPlainArray(input: object): boolean {
  const proto: unknown = Object.getPrototypeOf(input);
  if (proto === null) {
    return true;
  }
  if (!Array.isArray(proto)) {
    return false;
  }
  const protoProto: object | null = Object.getPrototypeOf(proto);
  return protoProto === null || Object.getPrototypeOf(protoProto) === null;
}
