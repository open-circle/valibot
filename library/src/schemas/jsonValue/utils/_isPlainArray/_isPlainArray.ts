import { _isPlainObject } from '../_isPlainObject/index.ts';

/**
 * Checks whether an array is a plain array, meaning not an instance of an
 * `Array` subclass. Since `jsonValue` never copies its input, accepting a
 * subclass instance would return it as is, typed as `JsonValue`, even
 * though it may carry extra behavior or state beyond its indexed items.
 *
 * Hint: The caller already established `input` is a real array via
 * `Array.isArray`, which (unlike reading `input`'s prototype) cannot be
 * spoofed by a `Proxy`. So this checks that its prototype is itself a real
 * array too, via that same `Array.isArray` check (this realm's real
 * `Array.prototype`, or a cross-realm equivalent, is itself an array
 * exotic object, whereas an `Array` subclass's prototype, or an ordinary
 * object substituted as the prototype, is not), and that it is otherwise
 * plain-object-shaped one hop up, the same way this realm's real
 * `Object.prototype` is plain-shaped for a plain object. An array whose
 * prototype was explicitly set to `null` is also accepted, matching how a
 * plain object created with `Object.create(null)` is accepted, even
 * though such an array is a rare, deliberate construction rather than
 * something `JSON.parse` would ever produce.
 *
 * Hint: Same limitation as `_isPlainObject`: a `Proxy` wrapping a real
 * `Array` subclass instance can still fake its own `getPrototypeOf` result
 * to look like a plain array.
 *
 * @param input The array to check.
 *
 * @returns Whether the array is a plain array.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isPlainArray(input: object): boolean {
  try {
    const proto: unknown = Object.getPrototypeOf(input);
    return (
      proto === null ||
      (Array.isArray(proto) && _isPlainObject(proto as object))
    );
  } catch {
    return false;
  }
}
