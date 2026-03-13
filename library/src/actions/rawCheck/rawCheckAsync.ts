import type { BaseValidationAsync, MaybePromise } from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { RawCheckContext, RawCheckIssue } from './types.ts';

/**
 * Raw check action async interface.
 */
export interface RawCheckActionAsync<TInput>
  extends BaseValidationAsync<TInput, TInput, RawCheckIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'raw_check';
  /**
   * The action reference.
   */
  readonly reference: typeof rawCheckAsync;
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
export function rawCheckAsync<TInput>(
  action: (context: RawCheckContext<TInput>) => MaybePromise<void>
): RawCheckActionAsync<TInput> {
  return {
    kind: 'validation',
    type: 'raw_check',
    reference: rawCheckAsync,
    async: true,
    expects: null,
    async '~run'(dataset, config) {
      await action({
        dataset,
        config,
        addIssue: (info) =>
          _addIssue(this, info?.label ?? 'input', dataset, config, info),
      });
      return dataset;
    },
  };
}
