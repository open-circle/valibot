import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

/**
 * Flavor symbol.
 *
 * @beta
 */
export declare const FlavorSymbol: unique symbol;

/**
 * Flavor name type.
 *
 * @beta
 */
export type FlavorName = string | number | symbol;

/**
 * Flavor interface.
 *
 * @beta
 */
export interface Flavor<TName extends FlavorName> {
  [FlavorSymbol]?: { [TValue in TName]: TValue };
}

/**
 * Flavor action interface.
 *
 * @beta
 */
export interface FlavorAction<TInput, TName extends FlavorName>
  extends BaseTransformation<TInput, TInput & Flavor<TName>, never> {
  /**
   * The action type.
   */
  readonly type: 'flavor';
  /**
   * The action reference.
   */
  readonly reference: typeof flavor;
  /**
   * The flavor name.
   */
  readonly name: TName;
}

/**
 * Creates a flavor transformation action.
 *
 * @param name The flavor name.
 *
 * @returns A flavor action.
 *
 * @beta
 */
// @__NO_SIDE_EFFECTS__
export function flavor<TInput, TName extends FlavorName>(
  name: TName
): FlavorAction<TInput, TName> {
  return {
    kind: 'transformation',
    type: 'flavor',
    reference: flavor,
    async: false,
    name,
    '~run'(dataset) {
      return dataset as SuccessDataset<TInput & Flavor<TName>>;
    },
  };
}
