/**
 * Checks whether an object is a plain object in a way that also accepts an
 * object created in another JavaScript realm.
 *
 * Hint: Rather than comparing `Object.getPrototypeOf(input)` against this
 * realm's `Object.prototype` by reference, this checks the shape of the
 * prototype chain itself. An object is treated as plain if its prototype is
 * `null` or its prototype's prototype is `null`.
 *
 * @param input The object to check.
 *
 * @returns Whether the object is a plain object.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isPlainObject(input: object): boolean {
  const proto: object | null = Object.getPrototypeOf(input);
  return proto === null || Object.getPrototypeOf(proto) === null;
}
