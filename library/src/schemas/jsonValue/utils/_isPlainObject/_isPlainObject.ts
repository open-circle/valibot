/**
 * Checks whether a prototype chain terminates in `null` within one more
 * hop, which every realm's real `Object.prototype` does (its own
 * prototype is `null`), and no other built-in or class prototype does,
 * since they all (directly or transitively) inherit from
 * `Object.prototype`.
 *
 * Hint: `proto` or a prototype further up its chain may be a `Proxy`
 * whose `getPrototypeOf` trap throws. Such a failure is treated as the
 * chain not terminating in `null`, so a hostile prototype cannot abort
 * validation.
 *
 * @param proto The prototype to check, or `null`.
 *
 * @returns Whether the prototype chain is plain-object-shaped.
 */
function _isPlainPrototype(proto: object | null): boolean {
  try {
    return proto === null || Object.getPrototypeOf(proto) === null;
  } catch {
    return false;
  }
}

/**
 * Checks whether an object is a plain object, in a way that also accepts a
 * plain object created in another JavaScript realm (for example another
 * `vm` context or iframe), since such an object has a different
 * `Object.prototype` reference despite being JSON-shaped and serializable.
 *
 * Hint: Rather than comparing `Object.getPrototypeOf(input)` against this
 * realm's `Object.prototype` by reference, or reading the prototype's
 * `constructor` property (which may be a throwing getter or a reassigned,
 * spoofable value), this checks the shape of the prototype chain itself:
 * `input` is treated as a plain object if and only if its prototype is
 * `null` (for example `Object.create(null)`) or its prototype's prototype
 * is `null`.
 *
 * Hint: This is a heuristic, not a sound check, and is not attacker-proof.
 * It can be defeated by a `Proxy` whose `getPrototypeOf` trap fakes a
 * shorter chain (for example making a `Map` or `Date` report a `null`
 * prototype), or by an object whose real prototype chain was deliberately
 * shortened (for example `Object.setPrototypeOf(Foo.prototype, null)`).
 * Both require the caller's own code, or code it already trusted enough to
 * run in the same realm, to construct such a value; there is no
 * in-language check that can be relied on against that threat model. This
 * check only guards against ordinary, non-adversarial inputs, such as a
 * `Date` or class instance passed in by mistake.
 *
 * Hint: This chain-shape check alone cannot tell a genuine plain object
 * apart from a constructor's own `.prototype` object (for example
 * `Date.prototype`), since such an object sits at the same one-hop depth
 * above `Object.prototype`. `_isPlainArray` relies on that here: it reuses
 * this function to confirm that an ordinary array's own prototype (real
 * `Array.prototype`, which is itself such a constructor prototype) is
 * "plain enough" one hop further up, so this function must keep accepting
 * `Array.prototype` and similar built-in prototypes. Callers that check an
 * actual input value, rather than a prototype one hop above it, should
 * additionally reject a `.prototype` object with `_isConstructorPrototype`;
 * see `_runJsonValue`.
 *
 * @param input The object to check.
 *
 * @returns Whether the object is a plain object.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isPlainObject(input: object): boolean {
  try {
    return _isPlainPrototype(Object.getPrototypeOf(input) as object | null);
  } catch {
    return false;
  }
}

/**
 * Checks whether an object is itself some constructor's own `.prototype`
 * object, for example `Date.prototype`, `Map.prototype`, or `Foo.prototype`
 * for a plain class `Foo`.
 *
 * Hint: Such an object passes `_isPlainObject` (see its hint above), since
 * it sits exactly one hop above `Object.prototype`, the same depth as an
 * ordinary plain object, and typically has no own enumerable properties
 * either (methods on a prototype are non-enumerable by default). Reading
 * `input`'s own `constructor` property and comparing its `prototype` back
 * to `input` catches it instead: a `.prototype` object has an own,
 * non-enumerable `constructor` that points back to it, while an ordinary
 * object literal has no own `constructor` at all (it only inherits one),
 * so this only flags true `.prototype` objects, not ordinary values that
 * happen to have their own `constructor` data property (which `jsonValue`
 * otherwise treats like any other key).
 *
 * Hint: `constructor` is read via its own property descriptor, never
 * through a plain property access, so a non-enumerable own `constructor`
 * accessor cannot be invoked (and cannot throw) just by checking an
 * ordinary plain object; a real `.prototype` object's own `constructor` is
 * always a plain data property, never an accessor, so this cannot miss a
 * genuine one. Reading the descriptor itself (for example on a hostile
 * `Proxy`) may still throw; unlike `_isPlainObject`, any such failure is
 * treated as "this might be a prototype object" and rejected, not as "this
 * is plain", since callers only run this check on values that already
 * passed the more permissive `_isPlainObject`.
 *
 * Hint: This intentionally only checks `input` itself, never a prototype
 * one hop above some other value, so it is safe to apply to an actual
 * input value (see `_runJsonValue`) without affecting `_isPlainArray`'s
 * unrelated reuse of `_isPlainObject` to check an array's own prototype.
 *
 * @param input The object to check.
 *
 * @returns Whether the object is a constructor's own prototype object.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isConstructorPrototype(input: object): boolean {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(input, 'constructor');
    const constructor: unknown =
      descriptor && 'value' in descriptor ? descriptor.value : undefined;
    return (
      typeof constructor === 'function' &&
      (constructor as { prototype?: unknown }).prototype === input
    );
  } catch {
    return true;
  }
}
