/**
 * Own-property check that survives prototype pollution. Mirrors the call
 * pattern already used by `_isValidObjectKey` so the entry-membership
 * checks in object schemas can reject keys like `__proto__`,
 * `constructor`, and `toString` instead of inheriting them from
 * `Object.prototype`.
 *
 * @param object The object to check.
 * @param key The key to check.
 *
 * @returns Whether the key is an own property of the object.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _hasOwnProperty(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}
