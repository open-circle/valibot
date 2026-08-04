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
  const isInvalidDate =
    requirement instanceof Date && Number.isNaN(+requirement);

  return (
    (!isInvalidDate && _isSameValueZero(requirement, value)) ||
    (requirement <= value && requirement >= value)
  );
}
