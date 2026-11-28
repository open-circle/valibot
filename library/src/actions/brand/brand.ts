import type { BaseTransformation, SuccessDataset } from '../../types/index.ts';

/**
 * Brand symbol.
 */
export declare const BrandSymbol: unique symbol;

/**
 * Brand name type.
 */
export type BrandName = string | number | symbol;

/**
 * Brand interface.
 */
export interface Brand<TName extends BrandName> {
  [BrandSymbol]: { [TValue in TName]: TValue };
}

/**
 * Brand action interface.
 */
export interface BrandAction<
  TInput,
  TName extends BrandName,
> extends BaseTransformation<TInput, TInput & Brand<TName>, never> {
  /**
   * The action type.
   */
  readonly type: 'brand';
  /**
   * The action reference.
   */
  readonly reference: typeof brand;
  /**
   * The brand name.
   */
  readonly name: TName;
}

/**
 * Creates a brand transformation action.
 *
 * @param name The brand name.
 *
 * @returns A brand action.
 */
// @__NO_SIDE_EFFECTS__
export function brand<TInput, TName extends BrandName>(
  name: TName
): BrandAction<TInput, TName> {
  return {
    kind: 'transformation',
    type: 'brand',
    reference: brand,
    async: false,
    name,
    '~run'(dataset) {
      return dataset as SuccessDataset<TInput & Brand<TName>>;
    },
  };
}
