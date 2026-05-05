import { isJsonConstValue } from './isJsonConstValue.ts';

/**
 * Whether values are JSON compatible for an enum keyword.
 *
 * @param values The values to check.
 *
 * @returns Whether the values are JSON compatible.
 */
export function isJsonEnumValues(
  values: readonly unknown[]
): values is (boolean | number | string)[] {
  return values.every(isJsonConstValue);
}
