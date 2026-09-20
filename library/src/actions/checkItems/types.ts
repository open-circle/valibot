import type { BaseIssue } from '../../types/index.ts';
import type { ArrayInput, ArrayRequirementAsync } from '../types.ts';

/**
 * Check items issue interface.
 */
export interface CheckItemsIssue<TInput extends ArrayInput> extends BaseIssue<
  TInput[number]
> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'check_items';
  /**
   * The expected input.
   */
  readonly expected: null;
  /**
   * The validation function.
   */
  readonly requirement: ArrayRequirementAsync<TInput>;
}
