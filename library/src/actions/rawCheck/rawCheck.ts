import type { BaseValidation } from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { RawCheckContext, RawCheckIssue } from './types.ts';

/**
 * Raw check action interface.
 */
export interface RawCheckAction<TInput>
  extends BaseValidation<TInput, TInput, RawCheckIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'raw_check';
  /**
   * The action reference.
   */
  readonly reference: typeof rawCheck;
  /**
   * The expected property.
   */
  readonly expects: null;
}

/**
 * Creates a raw check validation action.
 *
 * @param action The validation action.
 *
 * @returns A raw check action.
 */
// @__NO_SIDE_EFFECTS__
export function rawCheck<TInput>(
  action: (context: RawCheckContext<TInput>) => void
): RawCheckAction<TInput> {
  return {
    kind: 'validation',
    type: 'raw_check',
    reference: rawCheck,
    async: false,
    expects: null,
    '~run'(dataset, config) {
      action({
        dataset,
        config,
        addIssue: (info) =>
          _addIssue(this, info?.label ?? 'input', dataset, config, info),
      });
      return dataset;
    },
  };
}
