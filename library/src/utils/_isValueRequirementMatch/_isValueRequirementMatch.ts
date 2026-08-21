import type { ValueInput } from '../../actions/types.ts';
import { _isSameValueZero } from '../_isSameValueZero/index.ts';

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
export function _isValueRequirementMatch(
  requirement: ValueInput,
  value: ValueInput
): boolean {
  // requirement.getTime() is NaN for Invalid Date
  if (requirement instanceof Date && Number.isNaN(requirement.getTime())) {
    return false;
  }

  return (
    _isSameValueZero(requirement, value) ||
    (requirement <= value && requirement >= value)
  );
}
