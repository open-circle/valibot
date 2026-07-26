import type {
  BaseIssue,
  BaseTransformation,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type { RawTransformContext, RawTransformIssue } from './types.ts';

/**
 * Raw transform action interface.
 */
export interface RawTransformAction<TInput, TOutput>
  extends BaseTransformation<TInput, TOutput, RawTransformIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'raw_transform';
  /**
   * The action reference.
   */
  readonly reference: typeof rawTransform;
}

/**
 * Creates a raw transformation action.
 *
 * @param action The transformation action.
 *
 * @returns A raw transform action.
 */
// @__NO_SIDE_EFFECTS__
export function rawTransform<TInput, TOutput>(
  action: (context: RawTransformContext<TInput>) => TOutput
): RawTransformAction<TInput, TOutput> {
  return {
    kind: 'transformation',
    type: 'raw_transform',
    reference: rawTransform,
    async: false,
    '~run'(dataset, config) {
      // Execute action and get its output
      const output = action({
        dataset,
        config,
        addIssue: (info) =>
          _addIssue(this, info?.label ?? 'input', dataset, config, info),
        NEVER: null as never,
      });

      // Update dataset depending on issues
      if (dataset.issues) {
        // @ts-expect-error
        dataset.typed = false;
      } else {
        // @ts-expect-error
        dataset.value = output;
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        TOutput,
        BaseIssue<unknown> | RawTransformIssue<TInput>
      >;
    },
  };
}
