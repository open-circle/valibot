/**
 * Compares two values using the SameValueZero algorithm, which treats `NaN`
 * as equal to itself unlike `===`.
 *
 * @param value1 The first value.
 * @param value2 The second value.
 *
 * @returns Whether the values are equal.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isSameValueZero(value1: unknown, value2: unknown): boolean {
  return value1 === value2 || (Number.isNaN(value1) && Number.isNaN(value2));
}
