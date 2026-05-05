/**
 * Disallows inherited object properties and prevents object prototype
 * pollution by disallowing certain keys.
 *
 * @param object The object to check.
 * @param key The key to check.
 *
 * @returns Whether the key is allowed.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isValidObjectKey(object: object, key: string): boolean {
  return (
    Object.prototype.hasOwnProperty.call(object, key) &&
    key !== '__proto__' &&
    key !== 'prototype' &&
    key !== 'constructor'
  );
}
