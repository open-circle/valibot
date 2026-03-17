/**
 * Whether a value is JSON compatible for a const keyword.
 *
 * @param value The value to check.
 *
 * @returns Whether the value is JSON compatible.
 */
export function isJsonConstValue(
  value: unknown
): value is boolean | number | string {
  return (
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    typeof value === 'string'
  );
}
