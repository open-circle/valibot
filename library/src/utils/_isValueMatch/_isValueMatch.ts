import type { ValueInput } from '../../actions/types.ts';

/**
 * Checks whether a value matches a value action requirement.
 *
 * @param requirement The value action requirement.
 * @param value The value to check.
 *
 * @returns Whether the value matches the requirement.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _isValueMatch(
  requirement: ValueInput,
  value: ValueInput
): boolean {
  // Match NaN explicitly and compare other values by ordering so that invalid
  // dates never match, even when both values reference the same object.
  return (
    (Number.isNaN(requirement) && Number.isNaN(value)) ||
    (requirement <= value && requirement >= value)
  );
}
