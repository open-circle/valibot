/**
 * Checks whether a value is a plain object, i.e. created via an object
 * literal or `Object.create(null)`. Arrays, `Date`, `Map`, class
 * instances, and other exotic objects are rejected so they are never
 * spread (which would silently strip their prototype).
 *
 * @param value The value to check.
 *
 * @returns `true` if `value` is a plain object.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Performs a shallow merge of two values. If both values are plain objects,
 * their top-level keys are merged with the override taking precedence.
 * Otherwise the override replaces the defaults.
 *
 * @param defaults The current accumulated value.
 * @param override The value to merge on top.
 *
 * @returns The merged value.
 */
// @__NO_SIDE_EFFECTS__
export function shallowMerge(defaults: unknown, override: unknown): unknown {
  if (!isPlainObject(defaults) || !isPlainObject(override)) {
    return override;
  }
  return { ...defaults, ...override };
}
