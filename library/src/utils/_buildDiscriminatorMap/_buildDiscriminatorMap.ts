import type {
  VariantOptions,
  VariantOptionsAsync,
} from '../../schemas/variant/types.ts';

/**
 * Builds a map from discriminator value to variant option for O(1) dispatch.
 *
 * Returns `null` (disabling the fast path) whenever the options cannot be
 * unambiguously keyed by a single discriminator value: a nested variant, a
 * discriminator schema whose accepted values are not statically enumerable
 * (only `literal`, `enum` and `picklist` are), or a value claimed by more than
 * one option.
 *
 * @param key The discriminator key.
 * @param options The variant options.
 *
 * @returns The discriminator map or `null`.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _buildDiscriminatorMap<
  TOption extends
    | VariantOptions<string>[number]
    | VariantOptionsAsync<string>[number],
>(key: string, options: readonly TOption[]): Map<unknown, TOption> | null {
  const map = new Map<unknown, TOption>();
  for (const option of options) {
    // Nested variants cannot be statically keyed here
    if (option.type === 'variant') {
      return null;
    }
    const discriminatorSchema = option.entries[key];
    let values: readonly unknown[];
    if (!discriminatorSchema) {
      return null;
    } else if (discriminatorSchema.type === 'literal') {
      // @ts-expect-error
      values = [discriminatorSchema.literal];
    } else if (
      discriminatorSchema.type === 'enum' ||
      discriminatorSchema.type === 'picklist'
    ) {
      // @ts-expect-error
      values = discriminatorSchema.options;
    } else {
      // Non-enumerable discriminator (e.g. optional, union, custom)
      return null;
    }
    // `Map` keys use SameValueZero, the same comparison `literal`, `enum` and
    // `picklist` use, so `NaN` and `-0` dispatch exactly as they validate
    for (const value of values) {
      // Colliding discriminator values are ambiguous
      if (map.has(value)) {
        return null;
      }
      map.set(value, option);
    }
  }
  return map;
}
