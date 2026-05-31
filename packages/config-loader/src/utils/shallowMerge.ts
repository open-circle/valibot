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
export function shallowMerge(defaults: unknown, override: unknown): unknown {
  if (
    defaults === null ||
    typeof defaults !== 'object' ||
    Array.isArray(defaults) ||
    override === null ||
    typeof override !== 'object' ||
    Array.isArray(override)
  ) {
    return override;
  }
  return {
    ...(defaults as Record<string, unknown>),
    ...(override as Record<string, unknown>),
  };
}
